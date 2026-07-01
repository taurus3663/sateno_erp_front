import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Сервиз за AI Sales Assistant таблото.
 * Вика backend endpoint-ите (interceptor-ът добавя базовия адрес + /erp):
 *   Lead Score, AI препоръки (генериране/одобрение), Prompt Manager, статус на доставчици/опашка.
 */

export interface AiLead {
    customerId: number;
    leadScore: number;
    leadTier: string;
    ordersCount: number;
    ordersValue: number;
    recencyDays: number | null;
    abandonedCarts: number;
    adSource: string | null;
}

export interface AiRecommendation {
    id: number;
    customerId: number;
    leadScore: number;
    leadTier: string;
    channel: string;
    recType: string;
    aiDraftText: string;
    reason: string;
    status: string;
    createdBy: string;
    aiProvider: string;
    promptKey: string;
    promptVersion: number;
    createTime: string;
}

export interface AiPrompt {
    id: number;
    promptKey: string;
    version: number;
    active: boolean;
    description: string;
    body: string;
    updateTime: string;
}

export interface GenerateSummary {
    minScore: number;
    limit: number;
    candidates: number;
    generated: number;
    skipped: number;
    failed: number;
    providerAvailable: boolean;
    provider: string | null;
    dryRun: boolean;
    message: string | null;
}

export interface BehaviorSlice { label: string; count: number; pct: number; }
export interface BehaviorActivity { time: string; type: string; title: string; sub: string | null; device: string | null; }
export interface BehaviorAbandoned { date: string; products: number; value: number | null; currency: string | null; }
export interface CustomerBehavior {
    customerId: number;
    name: string | null;
    phone: string | null;
    email: string | null;
    firstSeen: string | null;
    lastSeen: string | null;
    totalVisits: number | null;
    totalTimeText: string | null;
    leadScore: number | null;
    leadTier: string | null;
    source: string | null;
    sourceCampaign: string | null;
    pageviews: number;
    addToCarts: number;
    abandonedCount: number;
    abandonedValue: number;
    checkoutStarts: number;
    completedOrders: number;
    completedValue: number;
    currency: string;
    topCategories: BehaviorSlice[];
    topProducts: BehaviorSlice[];
    funnel: BehaviorSlice[];
    devices: BehaviorSlice[];
    locations: BehaviorSlice[];
    trafficSources: BehaviorSlice[];
    timeline: BehaviorActivity[];
    abandoned: BehaviorAbandoned[];
}

@Injectable({ providedIn: 'root' })
export class AiSalesService {
    private http = inject(HttpClient);

    getLeads() {
        return this.http.get<AiLead[]>('/ai/leads');
    }

    getBehavior(customerId: number) {
        return this.http.get<CustomerBehavior>(`/ai/customer-behavior/${customerId}`);
    }

    leads = signal<AiLead[]>([]);
    pending = signal<AiRecommendation[]>([]);
    prompts = signal<AiPrompt[]>([]);
    providers = signal<any | null>(null);
    queueStatus = signal<any | null>(null);

    loading = signal(false);
    working = signal(false);

    // ---------- Lead Score ----------
    loadLeads(): void {
        this.loading.set(true);
        this.http.get<AiLead[]>('/ai/leads').subscribe({
            next: (l) => { this.leads.set(l || []); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    recomputeLeads() {
        return this.http.post<{ recomputed: number }>('/ai/recompute-leads', {});
    }

    // ---------- Препоръки ----------
    loadPending(): void {
        this.http.get<AiRecommendation[]>('/ai/recommendations/pending')
            .subscribe({ next: (r) => this.pending.set(r || []), error: () => {} });
    }

    generate(minScore: number, limit: number, dryRun = false) {
        const params: any = { dryRun };
        if (minScore != null) params.minScore = minScore;
        if (limit != null) params.limit = limit;
        return this.http.post<GenerateSummary>('/ai/generate-recommendations', {}, { params });
    }

    approve(id: number, body: { text?: string; channel?: string; decidedBy?: string }) {
        return this.http.post<AiRecommendation>(`/ai/recommendations/${id}/approve`, body);
    }

    reject(id: number, body: { reason?: string; decidedBy?: string }) {
        return this.http.post<AiRecommendation>(`/ai/recommendations/${id}/reject`, body);
    }

    editDraft(id: number, body: { text?: string; channel?: string }) {
        return this.http.put<AiRecommendation>(`/ai/recommendations/${id}`, body);
    }

    // ---------- Prompt Manager ----------
    loadPrompts(): void {
        this.http.get<AiPrompt[]>('/ai/prompts')
            .subscribe({ next: (p) => this.prompts.set(p || []), error: () => {} });
    }

    savePromptVersion(body: { key: string; body: string; description: string }) {
        return this.http.post<AiPrompt>('/ai/prompts', body);
    }

    activatePrompt(id: number) {
        return this.http.post<AiPrompt>(`/ai/prompts/${id}/activate`, {});
    }

    // ---------- Диагностика ----------
    loadProviders(): void {
        this.http.get('/ai/providers').subscribe({ next: (p) => this.providers.set(p), error: () => {} });
    }

    loadQueueStatus(): void {
        this.http.get('/ai/queue/status').subscribe({ next: (q) => this.queueStatus.set(q), error: () => {} });
    }
}
