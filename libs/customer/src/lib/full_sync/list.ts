import { Component, OnDestroy, OnInit, computed, inject, signal, ElementRef, ViewChild, AfterViewChecked, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { Checkbox } from 'primeng/checkbox';
import { PrimeTemplate } from 'primeng/api';
import { WebSocketService } from 'xl-util';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ROUTES } from '../api.routes';
import { ISite } from '../site/interfaces';
import { ISyncStatus, SyncStep } from './interfaces';

@Component({
    selector: 'full-sync-list',
    standalone: true,
    imports: [CommonModule, FormsModule, Button, Select, Dialog, Checkbox, PrimeTemplate, TranslatePipe],
    styles: [`
        :host { display: block; padding: 20px; }
        h1 { margin: 0 0 6px; font-size: 22px; font-weight: 900; color: #071832; }
        .subtitle { color: #526582; font-size: 14px; margin-bottom: 28px; }

        /* STEPS */
        .steps { display: flex; align-items: center; gap: 0; margin-bottom: 28px; }
        .step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; position: relative; }
        .step:not(:last-child)::after {
            content: ''; position: absolute; top: 20px; left: calc(50% + 22px);
            width: calc(100% - 44px); height: 2px; background: #e2e8f0;
        }
        .step:not(:last-child).done::after { background: #10b981; }
        .step:not(:last-child).running::after { background: #e2e8f0; }
        .step-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; border: 2px solid #e2e8f0; background: #fff; transition: all .3s; }
        .step-icon.waiting { color: #94a3b8; border-color: #e2e8f0; }
        .step-icon.running { color: #fff; background: #246bfe; border-color: #246bfe; animation: pulse 1.2s ease-in-out infinite; }
        .step-icon.done    { color: #fff; background: #10b981; border-color: #10b981; }
        .step-icon.error   { color: #fff; background: #ef4444; border-color: #ef4444; }
        .step-label { font-size: 12px; font-weight: 700; color: #526582; white-space: nowrap; }
        .step-label.running { color: #246bfe; }
        .step-label.done    { color: #10b981; }
        .step-label.error   { color: #ef4444; }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(36,107,254,.4); } 50% { box-shadow: 0 0 0 8px rgba(36,107,254,0); } }

        /* ACTION ROW */
        .action-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .timer { font-size: 13px; font-weight: 700; color: #526582; font-family: monospace; }
        .timer.running { color: #246bfe; }
        .status-badge { border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 900; }
        .status-badge.IDLE       { background: #f1f5f9; color: #64748b; }
        .status-badge.BRANDS,
        .status-badge.CATEGORIES,
        .status-badge.PRODUCTS   { background: #dbeafe; color: #1e40af; }
        .status-badge.DONE       { background: #d1fae5; color: #065f46; }
        .status-badge.ERROR      { background: #fee2e2; color: #991b1b; }

        /* TERMINAL */
        .terminal { background: #0f172a; border-radius: 10px; padding: 16px; min-height: 280px; max-height: 460px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.7; }
        .terminal-header { display: flex; gap: 6px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #1e293b; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot.red { background: #ef4444; }
        .dot.yellow { background: #f59e0b; }
        .dot.green { background: #10b981; }
        .log-line { color: #94a3b8; }
        .log-line.success { color: #34d399; }
        .log-line.error   { color: #f87171; }
        .log-line.info    { color: #60a5fa; }
        .log-line.start   { color: #fbbf24; }
        .cursor { display: inline-block; width: 8px; height: 14px; background: #94a3b8; animation: blink .8s step-end infinite; vertical-align: middle; }
        @keyframes blink { 50% { opacity: 0; } }
        .terminal-empty { color: #334155; font-style: italic; }
    `],
    template: `
        <h1>{{ 'sync.title' | translate }}</h1>
        <p class="subtitle">{{ 'sync.subtitle' | translate }}</p>

        <!-- Steps -->
        <div class="steps">
            <div class="step" [class.done]="isDone('BRANDS')" [class.running]="isActive('BRANDS')">
                <div class="step-icon" [class.waiting]="isWaiting('BRANDS')" [class.running]="isActive('BRANDS')" [class.done]="isDone('BRANDS')" [class.error]="isError('BRANDS')">
                    {{ isActive('BRANDS') ? '⟳' : isDone('BRANDS') ? '✓' : isError('BRANDS') ? '✕' : '1' }}
                </div>
                <span class="step-label" [class.running]="isActive('BRANDS')" [class.done]="isDone('BRANDS')" [class.error]="isError('BRANDS')">{{ 'sync.step.brands' | translate }}</span>
            </div>
            <div class="step" [class.done]="isDone('CATEGORIES')" [class.running]="isActive('CATEGORIES')">
                <div class="step-icon" [class.waiting]="isWaiting('CATEGORIES')" [class.running]="isActive('CATEGORIES')" [class.done]="isDone('CATEGORIES')" [class.error]="isError('CATEGORIES')">
                    {{ isActive('CATEGORIES') ? '⟳' : isDone('CATEGORIES') ? '✓' : isError('CATEGORIES') ? '✕' : '2' }}
                </div>
                <span class="step-label" [class.running]="isActive('CATEGORIES')" [class.done]="isDone('CATEGORIES')" [class.error]="isError('CATEGORIES')">{{ 'sync.step.categories' | translate }}</span>
            </div>
            <div class="step" [class.done]="isDone('PRODUCTS')" [class.running]="isActive('PRODUCTS')">
                <div class="step-icon" [class.waiting]="isWaiting('PRODUCTS')" [class.running]="isActive('PRODUCTS')" [class.done]="isDone('PRODUCTS')" [class.error]="isError('PRODUCTS')">
                    {{ isActive('PRODUCTS') ? '⟳' : isDone('PRODUCTS') ? '✓' : isError('PRODUCTS') ? '✕' : '3' }}
                </div>
                <span class="step-label" [class.running]="isActive('PRODUCTS')" [class.done]="isDone('PRODUCTS')" [class.error]="isError('PRODUCTS')">{{ 'sync.step.products' | translate }}</span>
            </div>
            <div class="step" [class.done]="isDone('ATTRIBUTES')" [class.running]="isActive('ATTRIBUTES')">
                <div class="step-icon" [class.waiting]="isWaiting('ATTRIBUTES')" [class.running]="isActive('ATTRIBUTES')" [class.done]="isDone('ATTRIBUTES')" [class.error]="isError('ATTRIBUTES')">
                    {{ isActive('ATTRIBUTES') ? '⟳' : isDone('ATTRIBUTES') ? '✓' : isError('ATTRIBUTES') ? '✕' : '4' }}
                </div>
                <span class="step-label" [class.running]="isActive('ATTRIBUTES')" [class.done]="isDone('ATTRIBUTES')" [class.error]="isError('ATTRIBUTES')">{{ 'sync.step.attributes' | translate }}</span>
            </div>
            @if (importOrders) {
                <div class="step" [class.done]="isDone('ORDERS')" [class.running]="isActive('ORDERS')">
                    <div class="step-icon" [class.waiting]="isWaiting('ORDERS')" [class.running]="isActive('ORDERS')" [class.done]="isDone('ORDERS')" [class.error]="isError('ORDERS')">
                        {{ isActive('ORDERS') ? '⟳' : isDone('ORDERS') ? '✓' : isError('ORDERS') ? '✕' : '5' }}
                    </div>
                    <span class="step-label" [class.running]="isActive('ORDERS')" [class.done]="isDone('ORDERS')" [class.error]="isError('ORDERS')">{{ 'sync.step.orders' | translate }}</span>
                </div>
            }
        </div>

        <!-- Action row -->
        <div class="action-row">
            <p-button
                [label]="'sync.btn.start' | translate"
                icon="pi pi-cloud-download"
                [disabled]="running()"
                [loading]="running()"
                (onClick)="showSiteDialog = true" />

            <span class="status-badge {{ status().step }}">{{ stepLabel() }}</span>

            @if (running() || status().step === 'DONE') {
                <span class="timer" [class.running]="running()">⏱ {{ formatTime(displaySeconds()) }}</span>
            }
        </div>

        <!-- Terminal -->
        <div class="terminal" #terminal>
            <div class="terminal-header">
                <div class="dot red"></div>
                <div class="dot yellow"></div>
                <div class="dot green"></div>
            </div>
            @if (status().logs.length === 0) {
                <div class="terminal-empty">// {{ 'sync.terminal.empty' | translate }}</div>
            }
            @for (line of status().logs; track $index) {
                <div class="log-line" [class.success]="line.includes('✅') || line.includes('🎉')" [class.error]="line.includes('❌')" [class.info]="line.includes('⏳') || line.includes('ℹ️')" [class.start]="line.includes('🚀')">
                    {{ line }}
                </div>
            }
            @if (running()) {
                <div class="log-line info">  <span class="cursor"></span></div>
            }
        </div>

        <!-- Site picker dialog -->
        <p-dialog [header]="'sync.dialog.title' | translate" [(visible)]="showSiteDialog" [modal]="true" [style]="{width:'460px'}" [closable]="true">
            <div style="display:flex;flex-direction:column;gap:16px;padding:8px 0">
                <p style="margin:0;color:#526582;font-size:14px">{{ 'sync.dialog.desc' | translate }}</p>
                <p-select
                    [options]="sites()"
                    [(ngModel)]="selectedSite"
                    optionLabel="name"
                    [placeholder]="'sync.dialog.selectPlaceholder' | translate"
                    appendTo="body"
                    [style]="{width:'100%'}" />
                <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                    <p-checkbox [(ngModel)]="importOrders" [binary]="true" inputId="importOrders" />
                    <label for="importOrders" style="cursor:pointer;font-size:14px;font-weight:600;color:#071832;margin:0">
                        {{ 'sync.dialog.importOrders' | translate }}
                        <span style="display:block;font-size:12px;font-weight:400;color:#526582;margin-top:2px">{{ 'sync.dialog.importOrdersHint' | translate }}</span>
                    </label>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button [label]="'Cancel' | translate" severity="secondary" [text]="true" (onClick)="showSiteDialog = false" />
                <p-button [label]="'sync.dialog.startBtn' | translate" icon="pi pi-play" [disabled]="!selectedSite" (onClick)="startSync()" />
            </ng-template>
        </p-dialog>
    `,
})
export class FullSyncListComponent implements OnInit, OnDestroy, AfterViewChecked {
    private http = inject(HttpClient);
    private wsService = inject(WebSocketService);
    private zone = inject(NgZone);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    @ViewChild('terminal') terminalEl?: ElementRef<HTMLElement>;

    status = signal<ISyncStatus>({ step: 'IDLE', logs: [], elapsedSeconds: 0 });
    sites = signal<ISite[]>([]);
    selectedSite: ISite | null = null;
    importOrders = false;
    showSiteDialog = false;

    running = computed(() => ['BRANDS', 'CATEGORIES', 'PRODUCTS', 'ATTRIBUTES', 'ORDERS'].includes(this.status().step));

    displaySeconds = signal(0);

    private clockTimer?: ReturnType<typeof setInterval>;
    private shouldScrollTerminal = false;

    ngOnInit(): void {
        this.loadSites();

        // Зареждаме текущото статус при влизане (recovery при refresh)
        this.http.get<ISyncStatus>(`/${ROUTES.fullSync.status}`).subscribe({
            next: (s) => this.applyStatus(s),
        });

        // WebSocket — получаваме push от backend при всяка промяна
        this.wsService
            .listen('sync_status')
            .pipe(takeUntil(this.destroy$))
            .subscribe((s: ISyncStatus) => {
                this.zone.run(() => this.applyStatus(s));
            });
    }

    ngAfterViewChecked(): void {
        if (this.shouldScrollTerminal && this.terminalEl) {
            const el = this.terminalEl.nativeElement;
            el.scrollTop = el.scrollHeight;
            this.shouldScrollTerminal = false;
        }
    }

    loadSites(): void {
        this.http.get<{ content: ISite[] }>(`/${ROUTES.site.list}?size=100`).subscribe({
            next: (p) => this.sites.set(p.content),
        });
    }

    startSync(): void {
        if (!this.selectedSite) return;
        this.showSiteDialog = false;
        const params = this.importOrders ? '?importOrders=true' : '';
        this.http.post<ISyncStatus>(`/${ROUTES.fullSync.start}/${this.selectedSite.id}${params}`, {}).subscribe({
            next: (s) => this.applyStatus(s),
        });
    }

    private applyStatus(s: ISyncStatus): void {
        const prevLen = this.status().logs.length;
        this.status.set(s);
        this.displaySeconds.set(s.elapsedSeconds);
        if (s.logs.length !== prevLen) this.shouldScrollTerminal = true;

        if (this.running()) {
            this.startClock();
        } else {
            this.stopClock();
        }
    }

    private startClock(): void {
        if (this.clockTimer) return;
        this.clockTimer = setInterval(() => {
            this.displaySeconds.update(s => s + 1);
        }, 1000);
    }

    private stopClock(): void {
        if (this.clockTimer) { clearInterval(this.clockTimer); this.clockTimer = undefined; }
    }

    // Step state helpers
    private readonly STEP_ORDER: SyncStep[] = ['BRANDS', 'CATEGORIES', 'PRODUCTS', 'ATTRIBUTES', 'ORDERS'];

    isActive(s: SyncStep): boolean { return this.status().step === s; }

    isDone(s: SyncStep): boolean {
        const cur = this.status().step;
        if (cur === 'DONE') return true;
        if (cur === 'ERROR' || cur === 'IDLE') return false;
        return this.STEP_ORDER.indexOf(cur) > this.STEP_ORDER.indexOf(s);
    }

    isWaiting(s: SyncStep): boolean {
        return !this.isActive(s) && !this.isDone(s) && !this.isError(s);
    }

    isError(s: SyncStep): boolean {
        return this.status().step === 'ERROR' && this.isActive(s);
    }

    stepLabel(): string {
        const keys: Record<SyncStep, string> = {
            IDLE: 'sync.status.idle', BRANDS: 'sync.status.brands', CATEGORIES: 'sync.status.categories',
            PRODUCTS: 'sync.status.products', ATTRIBUTES: 'sync.status.attributes', ORDERS: 'sync.status.orders',
            DONE: 'sync.status.done', ERROR: 'sync.status.error',
        };
        return this.translate.instant(keys[this.status().step] ?? '');
    }

    formatTime(s: number): string {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.stopClock();
    }
}
