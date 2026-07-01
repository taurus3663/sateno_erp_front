import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiRecommendation, AiPrompt, AiSalesService } from './ai-sales.service';

/**
 * AI Асистент по продажби — табло (Фаза 5).
 * Три секции: Лийдове (Lead Score), Препоръки (генериране + одобрение), Промптове (Prompt Manager).
 * Данните са живи от backend-а (/erp/ai/*). Следва дизайн-езика на ERP-то.
 */
@Component({
    selector: 'ai-sales',
    standalone: true,
    imports: [CommonModule, FormsModule],
    styles: [
        `
            :host {
                --bg: #f3f8fc; --card: #fff; --border: #d9e8f5; --text: #061935; --muted: #526987;
                --blue: #2f80ff; --green: #18b96b; --purple: #8a4cff; --orange: #f97316; --red: #ef3d4d;
                --shadow: 0 10px 28px rgba(12,33,64,.05);
                display: block; color: var(--text);
            }
            .wrap { padding: 8px; }
            .panel { background: rgba(255,255,255,.95); border: 1px solid var(--border); border-radius: 14px; padding: 24px; box-shadow: var(--shadow); }
            .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
            .title { display: flex; gap: 16px; align-items: center; }
            .sig { font-size: 40px; color: var(--purple); line-height: 1; }
            .title h1 { font-size: 25px; margin: 0 0 6px; font-weight: 800; }
            .sub { color: var(--muted); font-size: 14px; }
            .btn { height: 40px; border: 1px solid var(--border); background: #fff; border-radius: 8px; padding: 0 16px; font-weight: 700; color: #30445f; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
            .btn:hover { background: #f4f9ff; }
            .btn.primary { background: var(--blue); border-color: var(--blue); color: #fff; }
            .btn.green { background: var(--green); border-color: var(--green); color: #fff; }
            .btn.danger { background: #fff; border-color: #f2c0c6; color: var(--red); }
            .btn:disabled { opacity: .55; cursor: default; }
            .tabs { display: flex; gap: 8px; margin-bottom: 18px; border-bottom: 1px solid var(--border); }
            .tab { border: none; background: none; padding: 10px 16px; font-weight: 700; color: var(--muted); cursor: pointer; border-bottom: 3px solid transparent; }
            .tab.active { color: var(--blue); border-bottom-color: var(--blue); }
            .toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
            .field { display: flex; gap: 6px; align-items: center; font-size: 13px; color: var(--muted); }
            input[type=number], select, textarea { border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; font: inherit; color: var(--text); background: #fff; }
            input[type=number] { width: 80px; }
            textarea { width: 100%; min-height: 90px; resize: vertical; }
            .hint { font-size: 13px; color: var(--muted); }
            .hint b { color: var(--text); }

            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 11px 12px; border-bottom: 1px solid #eef4fa; font-size: 14px; }
            th { color: var(--muted); font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .03em; }
            tbody tr:hover { background: #f7fbff; }
            .num { text-align: right; font-variant-numeric: tabular-nums; }

            .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; color: #fff; }
            .score { font-weight: 900; font-variant-numeric: tabular-nums; }
            .tier-hot { background: var(--red); }
            .tier-warm { background: var(--orange); }
            .tier-cold { background: #64748b; }
            .chip { display: inline-block; padding: 2px 9px; border-radius: 6px; font-size: 12px; font-weight: 700; background: #eef4ff; color: #2b4a86; }

            .cards { display: grid; gap: 14px; }
            .rec { border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; background: #fff; }
            .rec-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
            .rec-head .who { font-weight: 800; }
            .rec-reason { color: var(--muted); font-size: 13px; margin: 6px 0 10px; }
            .rec-actions { display: flex; gap: 10px; align-items: center; margin-top: 10px; flex-wrap: wrap; }
            .empty { text-align: center; color: var(--muted); padding: 40px 0; }

            .plist { display: grid; grid-template-columns: 320px 1fr; gap: 18px; }
            .pitem { border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; margin-bottom: 8px; cursor: pointer; }
            .pitem.active-sel { border-color: var(--blue); background: #f5f9ff; }
            .pitem .pk { font-weight: 800; }
            .pitem .pmeta { font-size: 12px; color: var(--muted); margin-top: 3px; display: flex; gap: 8px; align-items: center; }
            .dot-active { width: 8px; height: 8px; border-radius: 50%; background: var(--green); display: inline-block; }
            @media (max-width: 900px) { .plist { grid-template-columns: 1fr; } }
        `
    ],
    template: `
        <div class="wrap">
            <div class="panel">
                <div class="top">
                    <div class="title">
                        <span class="sig">✦</span>
                        <div>
                            <h1>AI Асистент по продажби</h1>
                            <div class="sub">Лийдове, препоръки за действие и управление на промптовете — живи данни.</div>
                        </div>
                    </div>
                    <div>
                        <button class="btn" (click)="refresh()">↻ Обнови</button>
                    </div>
                </div>

                <div class="tabs">
                    <button class="tab" [class.active]="tab()==='leads'" (click)="tab.set('leads')">Лийдове</button>
                    <button class="tab" [class.active]="tab()==='recs'" (click)="tab.set('recs')">Препоръки</button>
                    <button class="tab" [class.active]="tab()==='prompts'" (click)="tab.set('prompts')">Промптове</button>
                </div>

                <!-- ЛИЙДОВЕ -->
                <div *ngIf="tab()==='leads'">
                    <div class="toolbar">
                        <button class="btn" (click)="recompute()" [disabled]="svc.working()">↺ Преизчисли Lead Score</button>
                        <span class="hint">Показани: <b>{{ svc.leads().length }}</b> топ лийда</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Клиент</th><th>Score</th><th>Ниво</th>
                                <th class="num">Поръчки</th><th class="num">Стойност</th>
                                <th class="num">Скорошност</th><th class="num">Изоставени</th><th>Реклама</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let l of svc.leads()">
                                <td>#{{ l.customerId }}</td>
                                <td><span class="score">{{ l.leadScore }}</span></td>
                                <td><span class="badge" [ngClass]="tierClass(l.leadTier)">{{ l.leadTier }}</span></td>
                                <td class="num">{{ l.ordersCount }}</td>
                                <td class="num">{{ l.ordersValue | number:'1.2-2' }}</td>
                                <td class="num">{{ l.recencyDays != null ? l.recencyDays + ' д' : '—' }}</td>
                                <td class="num">{{ l.abandonedCarts }}</td>
                                <td>{{ l.adSource || '—' }}</td>
                            </tr>
                            <tr *ngIf="svc.leads().length===0"><td colspan="8" class="empty">Няма лийдове. Пусни „Преизчисли Lead Score".</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- ПРЕПОРЪКИ -->
                <div *ngIf="tab()==='recs'">
                    <div class="toolbar">
                        <span class="field">Мин. score <input type="number" [(ngModel)]="minScore" min="0" max="100"></span>
                        <span class="field">Брой <input type="number" [(ngModel)]="limit" min="1" max="200"></span>
                        <button class="btn primary" (click)="generate()" [disabled]="svc.working()">✦ Генерирай препоръки</button>
                        <span class="hint" *ngIf="genMsg()">{{ genMsg() }}</span>
                        <span class="hint" *ngIf="svc.providers() as p">AI доставчик: <b>{{ p.primary || 'няма' }}</b></span>
                    </div>

                    <div class="cards">
                        <div class="rec" *ngFor="let r of svc.pending()">
                            <div class="rec-head">
                                <span class="who">Клиент #{{ r.customerId }}</span>
                                <span class="badge" [ngClass]="tierClass(r.leadTier)">{{ r.leadTier }}</span>
                                <span class="score">{{ r.leadScore }}</span>
                                <span class="chip">{{ r.recType || 'действие' }}</span>
                                <span class="hint" style="margin-left:auto">от {{ r.createdBy }}</span>
                            </div>
                            <div class="rec-reason">{{ r.reason }}</div>
                            <textarea [(ngModel)]="r.aiDraftText"></textarea>
                            <div class="rec-actions">
                                <span class="field">Канал
                                    <select [(ngModel)]="r.channel">
                                        <option value="EMAIL">Имейл</option>
                                        <option value="VIBER">Viber</option>
                                        <option value="SMS">SMS</option>
                                        <option value="CALL">Обаждане</option>
                                    </select>
                                </span>
                                <button class="btn green" (click)="approve(r)" [disabled]="svc.working()">✓ Одобри</button>
                                <button class="btn danger" (click)="reject(r)" [disabled]="svc.working()">✕ Отхвърли</button>
                            </div>
                        </div>
                        <div class="empty" *ngIf="svc.pending().length===0">Няма чакащи препоръки. Генерирай нови отгоре.</div>
                    </div>
                </div>

                <!-- ПРОМПТОВЕ -->
                <div *ngIf="tab()==='prompts'">
                    <div class="plist">
                        <div>
                            <div class="pitem" *ngFor="let p of svc.prompts()"
                                 [class.active-sel]="selected()?.id===p.id" (click)="select(p)">
                                <div class="pk">{{ p.promptKey }} · v{{ p.version }}</div>
                                <div class="pmeta">
                                    <span *ngIf="p.active"><span class="dot-active"></span> активен</span>
                                    <span *ngIf="!p.active">неактивен</span>
                                    <span>{{ p.description }}</span>
                                </div>
                            </div>
                            <div class="empty" *ngIf="svc.prompts().length===0">Няма промптове.</div>
                        </div>
                        <div>
                            <div *ngIf="selected() as p">
                                <div class="toolbar">
                                    <b>{{ p.promptKey }} · v{{ p.version }}</b>
                                    <span class="badge tier-warm" *ngIf="!p.active">неактивен</span>
                                    <button class="btn" *ngIf="!p.active" (click)="activate(p)" [disabled]="svc.working()">Активирай тази версия</button>
                                    <button class="btn primary" style="margin-left:auto" (click)="saveNewVersion(p)" [disabled]="svc.working()">Запази като нова версия</button>
                                </div>
                                <textarea [(ngModel)]="promptDraft" style="min-height:320px"></textarea>
                                <div class="hint" style="margin-top:8px">Записът създава НОВА версия и я активира — старите остават за история.</div>
                            </div>
                            <div class="empty" *ngIf="!selected()">Избери промпт отляво, за да го редактираш.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AiSalesComponent implements OnInit {
    svc = inject(AiSalesService);

    tab = signal<'leads' | 'recs' | 'prompts'>('leads');
    selected = signal<AiPrompt | null>(null);
    genMsg = signal<string>('');

    minScore = 40;
    limit = 50;
    promptDraft = '';

    ngOnInit(): void {
        this.svc.loadLeads();
        this.svc.loadPending();
        this.svc.loadPrompts();
        this.svc.loadProviders();
        this.svc.loadQueueStatus();
    }

    refresh(): void {
        if (this.tab() === 'leads') this.svc.loadLeads();
        else if (this.tab() === 'recs') { this.svc.loadPending(); this.svc.loadProviders(); }
        else this.svc.loadPrompts();
    }

    tierClass(tier: string): string {
        if (tier === 'горещ') return 'tier-hot';
        if (tier === 'топъл') return 'tier-warm';
        return 'tier-cold';
    }

    recompute(): void {
        this.svc.working.set(true);
        this.svc.recomputeLeads().subscribe({
            next: () => { this.svc.working.set(false); this.svc.loadLeads(); },
            error: () => this.svc.working.set(false)
        });
    }

    generate(): void {
        this.svc.working.set(true);
        this.genMsg.set('Генериране...');
        this.svc.generate(this.minScore, this.limit, false).subscribe({
            next: (s) => {
                this.svc.working.set(false);
                this.genMsg.set(s.message
                    ? s.message
                    : `Генерирани ${s.generated}, пропуснати ${s.skipped}, грешки ${s.failed} (доставчик: ${s.provider || '—'})`);
                this.svc.loadPending();
                this.svc.loadLeads();
            },
            error: () => { this.svc.working.set(false); this.genMsg.set('Грешка при генерирането.'); }
        });
    }

    approve(r: AiRecommendation): void {
        this.svc.working.set(true);
        this.svc.approve(r.id, { text: r.aiDraftText, channel: r.channel, decidedBy: 'erp-user' }).subscribe({
            next: () => { this.svc.working.set(false); this.svc.loadPending(); },
            error: () => this.svc.working.set(false)
        });
    }

    reject(r: AiRecommendation): void {
        this.svc.working.set(true);
        this.svc.reject(r.id, { decidedBy: 'erp-user' }).subscribe({
            next: () => { this.svc.working.set(false); this.svc.loadPending(); },
            error: () => this.svc.working.set(false)
        });
    }

    select(p: AiPrompt): void {
        this.selected.set(p);
        this.promptDraft = p.body;
    }

    activate(p: AiPrompt): void {
        this.svc.working.set(true);
        this.svc.activatePrompt(p.id).subscribe({
            next: () => { this.svc.working.set(false); this.svc.loadPrompts(); },
            error: () => this.svc.working.set(false)
        });
    }

    saveNewVersion(p: AiPrompt): void {
        this.svc.working.set(true);
        this.svc.savePromptVersion({ key: p.promptKey, body: this.promptDraft, description: 'Редакция от таблото' })
            .subscribe({
                next: (np) => { this.svc.working.set(false); this.svc.loadPrompts(); this.select(np); },
                error: () => this.svc.working.set(false)
            });
    }
}
