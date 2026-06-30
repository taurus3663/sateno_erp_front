import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DatePicker } from 'primeng/datepicker';
import { PrimeTemplate } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FinancialDashboardService } from './dashboard.service';
import { IFinancialCard, IFinancialDashboard, IFinancialMetrics, IMetricDef } from './interfaces';

/**
 * Финансов дашборд — основен финансов екран на ERP-то.
 * Дизайн: 3 KPI карти (Днес/Вчера/Последни 7 дни) + детайлна таблица за период по избор
 * + десен панел "Общ преглед". Всички стойности са живи от базата.
 */
@Component({
    selector: 'financial-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, Button, ProgressSpinner, DatePicker, PrimeTemplate, TranslatePipe],
    styles: [
        `
            :host {
                --bg: #f4f7fb;
                --border-soft: #e9eff6;
                --text: #071832;
                --muted: #526582;
                --blue: #246bfe;
                --green: #10aa58;
                --red: #ef3d4d;
                --purple: #8b54f7;
                --orange: #f97316;
                display: block;
                color: var(--text);
            }
            .fin-main { padding: 0 2px 8px; }
            .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
            .header h1 { margin: 0; font-size: 26px; letter-spacing: -0.03em; line-height: 1.05; }
            .header p { margin: 6px 0 0; color: var(--muted); font-size: 14px; }
            .header-right { display: flex; align-items: center; gap: 10px; }
            .updated { color: var(--muted); font-size: 13px; }

            /* KPI CARDS */
            .top-cards { display: grid; grid-template-columns: 1fr 1.25fr 1.25fr; gap: 18px; margin-bottom: 20px; }
            .day-toggle { display: flex; gap: 6px; margin-bottom: 16px; }
            .day-toggle button { border: 1px solid var(--border-soft); background: #fff; color: #465b79; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; cursor: pointer; }
            .day-toggle button.active { background: var(--blue); border-color: var(--blue); color: #fff; }
            .kpi-card { background: #fff; border: 1px solid #d9e5f1; border-radius: 9px; overflow: hidden; min-height: 270px; }
            .kpi-card-inner { padding: 22px 20px 17px; position: relative; height: 100%; }
            .card-title-row { display: flex; gap: 16px; align-items: center; margin-bottom: 26px; }
            .big-icon { width: 44px; height: 44px; border-radius: 9px; display: grid; place-items: center; color: #fff; }
            .big-icon.green { background: linear-gradient(135deg, #43c96f, #18aa55); }
            .big-icon.blue { background: linear-gradient(135deg, #2c83ff, #1263df); }
            .big-icon.purple { background: linear-gradient(135deg, #a263ff, #7745df); }
            .card-name { font-size: 20px; font-weight: 900; }
            .card-dates { font-size: 12px; font-weight: 700; color: var(--muted); margin-left: 6px; white-space: nowrap; }
            .status { font-size: 12px; font-weight: 700; color: #0f9a52; margin-top: 3px; }
            .status.final { color: #1e334f; }
            .sparkline { position: absolute; right: 18px; top: 24px; width: 125px; height: 52px; }
            .card-metrics { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border-soft); }
            .card-metrics.second { border-bottom: none; }
            /* 3-колонен вид (само за седмичната карта) — третото поле взима място от другите две */
            .card-metrics.cols3 { grid-template-columns: 1fr 1fr 1fr; }
            .card-metrics.cols3 .metric-cell { padding-right: 8px; }
            .card-metrics.cols3 .metric-cell:nth-child(3) { border-left: 1px solid var(--border-soft); padding-left: 14px; padding-right: 0; }
            .metric-cell { padding: 0 18px 18px 0; }
            .metric-cell:nth-child(2) { border-left: 1px solid var(--border-soft); padding-left: 18px; padding-right: 0; }
            .card-metrics.second .metric-cell { padding-top: 18px; }
            .metric-label { color: #465b79; font-size: 13px; margin-bottom: 9px; }
            .metric-value { font-size: 23px; font-weight: 900; letter-spacing: -0.02em; }
            .metric-value.profit { color: var(--green); }

            .badge { display: inline-flex; align-items: center; gap: 4px; border-radius: 999px; padding: 3px 9px; font-size: 12px; font-weight: 900; margin-left: 6px; }
            .badge.up { color: #089c50; background: #eaf9f0; }
            .badge.down { color: var(--red); background: #fff0f1; }
            .badge.neutral { color: #f59e0b; background: #fff7e6; }
            .badge-text { font-size: 11px; color: #1a2d47; margin-left: 4px; }

            /* DETAIL + OVERVIEW */
            .content-row { display: grid; grid-template-columns: 1fr 410px; gap: 20px; }
            .detail-card, .overview-card { background: #fff; border: 1px solid #d9e5f1; border-radius: 9px; overflow: hidden; }
            .detail-header-row { display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-bottom: 1px solid var(--border-soft); flex-wrap: wrap; }
            .detail-title, .overview-title { font-size: 17px; font-weight: 900; }
            .overview-title { padding: 18px 18px 14px; }
            .detail-date { margin-left: auto; }

            .finance-table { width: 100%; border-collapse: collapse; font-size: 14px; }
            .finance-table th { color: #334861; font-size: 13px; font-weight: 800; padding: 11px 18px; border-bottom: 1px solid var(--border-soft); background: #fff; }
            .finance-table td { border-bottom: 1px solid var(--border-soft); padding: 10px 18px; }
            .finance-table tr:last-child td { border-bottom: none; }
            .finance-table th:first-child, .finance-table td:first-child { text-align: left; }
            .finance-table th:last-child, .finance-table td:last-child { text-align: right; }
            .table-label { display: flex; align-items: center; gap: 14px; color: #344d6f; }
            .small-icon { width: 26px; height: 26px; border-radius: 7px; display: grid; place-items: center; color: #fff; font-size: 14px; flex: none; }
            .i-blue { background: #2f7cff; }
            .i-orange { background: #ff9f2f; }
            .i-green { background: #17b866; }
            .i-red { background: #ff4f5f; }
            .i-purple { background: #945af9; }
            .today-value { font-weight: 800; }

            .overview-card { padding-bottom: 18px; }
            .overview-list { display: flex; flex-direction: column; gap: 8px; padding: 0 15px; }
            .overview-item { min-height: 72px; border: 1px solid #d9e5f1; border-radius: 8px; padding: 9px 14px; display: grid; grid-template-columns: 1fr 116px; align-items: center; overflow: hidden; }
            .overview-item.green { background: linear-gradient(135deg, #fff 50%, #f0fbf5); }
            .overview-item.blue { background: linear-gradient(135deg, #fff 50%, #f2f7ff); }
            .overview-item.purple { background: linear-gradient(135deg, #fff 50%, #f8f2ff); }
            .overview-item.orange { background: linear-gradient(135deg, #fff 50%, #fff7ef); }
            .overview-item.red { background: linear-gradient(135deg, #fff 50%, #fff2f4); }
            .overview-item.yellow { background: linear-gradient(135deg, #fff 50%, #fffbeb); }
            .overview-item.cyan { background: linear-gradient(135deg, #fff 50%, #ecfeff); }
            .overview-item.violet { background: linear-gradient(135deg, #fff 50%, #faf5ff); }
            .overview-label { color: #465b79; font-size: 12px; margin-bottom: 4px; }
            .overview-number { font-size: 21px; font-weight: 900; letter-spacing: -0.02em; }
            .overview-number.green { color: var(--green); }
            .overview-number.blue { color: var(--blue); }
            .overview-number.purple { color: var(--purple); }
            .overview-number.orange { color: var(--orange); }
            .overview-number.red { color: var(--red); }
            .overview-number.yellow { color: #f59e0b; }
            .overview-number.cyan { color: #06b6d4; }
            .overview-number.violet { color: #a855f7; }
            .overview-sub { margin-top: 4px; color: #36506f; font-size: 11px; }
            .ov-spark { width: 116px; height: 46px; }

            .center-pad { display: flex; justify-content: center; padding: 2rem; }
            :host ::ng-deep .detail-date .p-datepicker-input,
            :host ::ng-deep .detail-date .p-inputtext { min-width: 15rem; font-weight: 700; }
            .fin-cal-footer { display: flex; justify-content: flex-end; padding: 0.5rem 0.25rem 0.25rem; }

            @media (max-width: 1250px) {
                .content-row { grid-template-columns: 1fr; }
                .top-cards { grid-template-columns: 1fr; }
            }
            @media (max-width: 768px) {
                /* По-широко съдържание на телефона — минимум странично празно място */
                :host { margin-left: -2rem; margin-right: -2rem; }
                .fin-main { padding: 0 6px 8px; }
                .kpi-card-inner { padding: 16px 12px 14px; }
                .metric-cell { padding: 0 10px 14px 0; }
                .metric-cell:nth-child(2) { padding-left: 12px; }
                .card-metrics.cols3 .metric-cell:nth-child(3) { padding-left: 10px; }
                .finance-table th, .finance-table td { padding-left: 10px; padding-right: 10px; }
            }
        `
    ],
    template: `
        <div class="fin-main">
            @if (!service.data() && service.loading()) {
                <div class="center-pad"><p-progress-spinner strokeWidth="4" [style]="{ width: '48px', height: '48px' }"></p-progress-spinner></div>
            }

            @if (service.data(); as d) {
                <!-- KPI КАРТИ -->
                <section class="top-cards">
                    <article class="kpi-card">
                        <div class="kpi-card-inner">
                            <div class="card-title-row">
                                <div class="big-icon green"><i class="pi pi-chart-line" style="font-size:1.4rem"></i></div>
                                <div>
                                    <div class="card-name">{{ todayTitleKey() | translate }}</div>
                                    <div class="status">● {{ 'fin.live' | translate }}</div>
                                </div>
                            </div>
                            <div class="day-toggle">
                                <button type="button" [class.active]="todaySel() === 'today'" (click)="todaySel.set('today')">{{ 'fin.today' | translate }}</button>
                                <button type="button" [class.active]="todaySel() === 'yesterday'" (click)="todaySel.set('yesterday')">{{ 'fin.yesterday' | translate }}</button>
                                <button type="button" [class.active]="todaySel() === 'dayBefore'" (click)="todaySel.set('dayBefore')">{{ 'fin.dayBefore' | translate }}</button>
                            </div>
                            <ng-container *ngTemplateOutlet="kpiBody; context: { $implicit: selectedTodayCard(d) }"></ng-container>
                        </div>
                    </article>

                    <article class="kpi-card">
                        <div class="kpi-card-inner">
                            <div class="card-title-row">
                                <div class="big-icon purple"><i class="pi pi-calendar-plus" style="font-size:1.4rem"></i></div>
                                <div>
                                    <div class="card-name">{{ 'fin.last7' | translate }} <span class="card-dates">{{ subFor(d.last7Days) }}</span></div>
                                    <div class="status">● {{ 'fin.live' | translate }}</div>
                                </div>
                            </div>
                            <svg class="sparkline" viewBox="0 0 125 52"><path d="M3 43 C21 29,28 17,42 24 S58 5,72 14 S91 35,102 13 S114 17,123 0" fill="none" stroke="#8b54f7" stroke-width="2"/></svg>
                            <ng-container *ngTemplateOutlet="kpiBody; context: { $implicit: d.last7Days, avgDays: 7 }"></ng-container>
                        </div>
                    </article>

                    <article class="kpi-card">
                        <div class="kpi-card-inner">
                            <div class="card-title-row">
                                <div class="big-icon blue"><i class="pi pi-calendar" style="font-size:1.4rem"></i></div>
                                <div>
                                    <div class="card-name">{{ 'fin.lastMonth' | translate }} <span class="card-dates">{{ subFor(d.lastMonth) }}</span></div>
                                    <div class="status final">{{ 'fin.finalData' | translate }}</div>
                                </div>
                            </div>
                            <svg class="sparkline" viewBox="0 0 125 52"><path d="M3 42 C17 35,24 34,36 25 S52 31,64 17 S80 4,93 21 S109 29,123 1" fill="none" stroke="#246bfe" stroke-width="2"/></svg>
                            <ng-container *ngTemplateOutlet="kpiBody; context: { $implicit: d.lastMonth, avgDays: monthDays(d.lastMonth) }"></ng-container>
                        </div>
                    </article>
                </section>

                <!-- ДЕТАЙЛНА ТАБЛИЦА + ОБЩ ПРЕГЛЕД -->
                <section class="content-row">
                    <article class="detail-card">
                        <div class="detail-header-row">
                            <div class="detail-title">{{ 'fin.detail' | translate }}</div>
                            <div class="detail-date">
                                <p-date-picker
                                    #dp
                                    [(ngModel)]="rangeDates"
                                    selectionMode="range"
                                    [readonlyInput]="true"
                                    dateFormat="dd.mm.yy"
                                    [showIcon]="true"
                                    [appendTo]="'body'"
                                    [numberOfMonths]="1"
                                    [maxDate]="today"
                                    [hideOnDateTimeSelect]="false"
                                    [inputStyle]="{ width: '15rem' }"
                                >
                                    <ng-template pTemplate="footer">
                                        <div class="fin-cal-footer">
                                            <p-button [label]="'fin.apply' | translate" icon="pi pi-check" size="small"
                                                [disabled]="!rangeReady()" [loading]="service.customLoading()"
                                                (onClick)="applyCustom(); dp.overlayVisible = false"></p-button>
                                        </div>
                                    </ng-template>
                                </p-date-picker>
                            </div>
                            <p-button
                                [label]="'fin.export' | translate"
                                icon="pi pi-file-pdf"
                                severity="secondary"
                                size="small"
                                [disabled]="!service.customCard()"
                                [loading]="exporting"
                                (onClick)="exportPdf()"
                            ></p-button>
                        </div>

                        @if (service.customCard(); as card) {
                            <table class="finance-table">
                                <thead><tr><th style="width:58%">{{ 'fin.metric' | translate }}</th><th>{{ subFor(card) }}</th></tr></thead>
                                <tbody>
                                    @for (def of metricDefs; track def.key) {
                                        <tr>
                                            <td><div class="table-label"><span class="small-icon" [ngClass]="def.iconClass">{{ def.icon }}</span>{{ def.label | translate }}</div></td>
                                            <td>
                                                <span class="today-value">{{ format(def, card.current[def.key]) }}</span>
                                                <span class="badge" [ngClass]="badgeClass(def, card)">{{ deltaText(def, card) }}</span>
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        } @else {
                            <div class="center-pad"><p-progress-spinner strokeWidth="4" [style]="{ width: '40px', height: '40px' }"></p-progress-spinner></div>
                        }
                    </article>

                    <!-- ОБЩ ПРЕГЛЕД (на база избрания период от календара) -->
                    <aside class="overview-card">
                        <div class="overview-title">{{ 'fin.overview' | translate }}</div>
                        @if (service.customCard(); as ov) {
                            <div class="overview-list">
                                @for (t of overviewTiles; track t.key) {
                                    <div class="overview-item" [ngClass]="t.color">
                                        <div>
                                            <div class="overview-label">{{ t.label | translate }}</div>
                                            <div>
                                                <span class="overview-number" [ngClass]="t.color">{{ format(getDef(t.key), ov.current[t.key]) }}</span>
                                                <span class="badge" [ngClass]="badgeClass(getDef(t.key), ov)">{{ deltaArrow(getDef(t.key), ov) }}</span>
                                            </div>
                                            <div class="overview-sub">{{ t.sub | translate }}</div>
                                        </div>
                                        <svg class="ov-spark" viewBox="0 0 132 52">
                                            <path d="M5 40 C22 31,30 22,43 28 S63 12,77 23 S98 45,111 15 S122 24,130 2" fill="none" stroke="currentColor" stroke-width="2.5"/>
                                        </svg>
                                    </div>
                                }
                            </div>
                        } @else {
                            <div class="center-pad"><p-progress-spinner strokeWidth="4" [style]="{ width: '40px', height: '40px' }"></p-progress-spinner></div>
                        }
                    </aside>
                </section>
            }
        </div>

        <!-- Тяло на KPI карта (4 показателя) -->
        <ng-template #kpiBody let-card let-avgDays="avgDays">
            <div class="card-metrics" [class.cols3]="avgDays">
                <div class="metric-cell">
                    <div class="metric-label">{{ 'fin.ordersShort' | translate }}</div>
                    <div class="metric-value">{{ format(getDef('orders'), card.current.orders) }}</div>
                    <span class="badge" [ngClass]="badgeClass(getDef('orders'), card)">{{ deltaArrow(getDef('orders'), card) }}</span>
                </div>
                <div class="metric-cell">
                    <div class="metric-label">{{ 'fin.revenueShort' | translate }}</div>
                    <div class="metric-value">{{ format(getDef('revenue'), card.current.revenue) }}</div>
                    <span class="badge" [ngClass]="badgeClass(getDef('revenue'), card)">{{ deltaArrow(getDef('revenue'), card) }}</span>
                </div>
                @if (avgDays) {
                    <div class="metric-cell">
                        <div class="metric-label">{{ 'fin.avgOrdersPerDay' | translate }}</div>
                        <div class="metric-value">{{ avgOrdersStr(card, avgDays) }}</div>
                    </div>
                }
            </div>
            <div class="card-metrics second" [class.cols3]="avgDays">
                <div class="metric-cell">
                    <div class="metric-label">{{ 'fin.netProfitShort' | translate }}</div>
                    <div class="metric-value profit">{{ format(getDef('netProfit'), card.current.netProfit) }}
                        <span class="badge" [ngClass]="badgeClass(getDef('netProfit'), card)">{{ deltaArrow(getDef('netProfit'), card) }}</span>
                    </div>
                </div>
                <div class="metric-cell">
                    <div class="metric-label">ROAS</div>
                    <div class="metric-value">{{ format(getDef('roas'), card.current.roas) }}
                        <span class="badge" [ngClass]="badgeClass(getDef('roas'), card)">{{ deltaArrow(getDef('roas'), card) }}</span>
                    </div>
                </div>
                @if (avgDays) {
                    <div class="metric-cell">
                        <div class="metric-label">{{ 'fin.avgNetProfitPerDay' | translate }}</div>
                        <div class="metric-value profit">{{ avgNetProfitStr(card, avgDays) }}</div>
                    </div>
                }
            </div>
        </ng-template>
    `
})
export class FinancialDashboardComponent implements OnInit, OnDestroy {
    service = inject(FinancialDashboardService);
    private primeng = inject(PrimeNG);
    private translate = inject(TranslateService);
    private langSub?: Subscription;

    today: Date = new Date();
    rangeDates: Date[] = [this.daysAgo(6), new Date()];
    exporting = false;

    /** Избор за първата карта: днес / вчера / оня ден. */
    todaySel = signal<'today' | 'yesterday' | 'dayBefore'>('today');

    /** Връща избраната карта за първия слот. */
    selectedTodayCard(d: IFinancialDashboard): IFinancialCard {
        if (this.todaySel() === 'yesterday') return d.yesterday;
        if (this.todaySel() === 'dayBefore') return d.dayBeforeYesterday;
        return d.today;
    }

    /** Заглавие на първия слот според избора. */
    todayTitleKey(): string {
        if (this.todaySel() === 'yesterday') return 'fin.yesterday';
        if (this.todaySel() === 'dayBefore') return 'fin.dayBefore';
        return 'fin.today';
    }

    /** Брой дни в периода на картата (за дневните средни на месечната карта). */
    monthDays(card: IFinancialCard): number {
        const ms = new Date(card.to).getTime() - new Date(card.from).getTime();
        return Math.max(1, Math.round(ms / 86400000));
    }

    /** Дефиниции на показателите — пълни имена, подредба по списъка + икони за таблицата. */
    readonly metricDefs: IMetricDef[] = [
        { key: 'orders', label: 'fin.orders', type: 'int', higherBetter: true, key4: true, icon: '▣', iconClass: 'i-blue' },
        { key: 'revenue', label: 'fin.revenue', type: 'money', higherBetter: true, key4: true, icon: '€', iconClass: 'i-green' },
        { key: 'adSpend', label: 'fin.adSpend', type: 'money', higherBetter: false, icon: '●', iconClass: 'i-purple' },
        { key: 'shippingCost', label: 'fin.shippingCost', type: 'money', higherBetter: false, icon: '▶', iconClass: 'i-blue' },
        { key: 'cpa', label: 'fin.cpa', type: 'money', higherBetter: false, icon: '◎', iconClass: 'i-red' },
        { key: 'cpis', label: 'fin.cpis', type: 'money', higherBetter: false, icon: '◆', iconClass: 'i-orange' },
        { key: 'avgOrderValue', label: 'fin.avgOrderValue', type: 'money', higherBetter: true, icon: '◔', iconClass: 'i-blue' },
        { key: 'productsSold', label: 'fin.productsSold', type: 'int', higherBetter: true, icon: '▣', iconClass: 'i-orange' },
        { key: 'grossProfit', label: 'fin.grossProfit', type: 'money', higherBetter: true, icon: '↗', iconClass: 'i-green' },
        { key: 'cogs', label: 'fin.cogs', type: 'money', higherBetter: false, icon: '◆', iconClass: 'i-orange' },
        { key: 'roas', label: 'fin.roas', type: 'ratio', higherBetter: true, key4: true, icon: '◎', iconClass: 'i-red' },
        { key: 'margin', label: 'fin.margin', type: 'percent', higherBetter: true, icon: '◔', iconClass: 'i-blue' },
        { key: 'netProfit', label: 'fin.netProfit', type: 'money', higherBetter: true, key4: true, icon: '▣', iconClass: 'i-green' }
    ];

    /** Плочки в десния панел "Общ преглед" (на база картата "Днес"). */
    readonly overviewTiles: { key: keyof IFinancialMetrics; label: string; color: string; sub: string }[] = [
        { key: 'orders', label: 'fin.orders', color: 'cyan', sub: 'fin.vsPrevPeriod' },
        { key: 'revenue', label: 'fin.revenue', color: 'blue', sub: 'fin.vsPrevPeriod' },
        { key: 'adSpend', label: 'fin.adSpend', color: 'purple', sub: 'fin.vsPrevPeriod' },
        { key: 'cpa', label: 'fin.cpa', color: 'red', sub: 'fin.vsPrevPeriod' },
        { key: 'roas', label: 'fin.roas', color: 'violet', sub: 'fin.vsPrevPeriod' },
        { key: 'cogs', label: 'fin.cogs', color: 'orange', sub: 'fin.vsPrevPeriod' },
        { key: 'margin', label: 'fin.margin', color: 'yellow', sub: 'fin.vsPrevPeriod' },
        { key: 'netProfit', label: 'fin.netProfit', color: 'green', sub: 'fin.vsPrevPeriod' }
    ];

    private defByKey: Record<string, IMetricDef> = {};

    constructor() {
        for (const d of this.metricDefs) this.defByKey[d.key] = d;
    }

    getDef(key: keyof IFinancialMetrics): IMetricDef {
        return this.defByKey[key];
    }

    private get currency(): string {
        return this.service.data()?.currency ?? 'EUR';
    }

    ngOnInit(): void {
        this.applyCalendarLocale(this.translate.currentLang);
        this.langSub = this.translate.onLangChange.subscribe((e) => this.applyCalendarLocale(e.lang));
        this.service.startLive();
        this.applyCustom();
    }

    ngOnDestroy(): void {
        this.langSub?.unsubscribe();
        this.service.stopLive();
    }

    refreshAll(): void {
        this.service.load();
        this.applyCustom();
    }

    rangeReady(): boolean {
        return !!(this.rangeDates && this.rangeDates[0] && this.rangeDates[1]);
    }

    applyCustom(): void {
        const from = this.rangeDates?.[0];
        const to = this.rangeDates?.[1] ?? this.rangeDates?.[0];
        if (!from || !to) return;
        this.service.loadCustom(this.fmt(from), this.fmt(to));
    }

    private daysAgo(n: number): Date {
        const d = new Date();
        d.setDate(d.getDate() - n);
        return d;
    }

    private fmt(d: Date): string {
        const y = d.getFullYear();
        const m = `${d.getMonth() + 1}`.padStart(2, '0');
        const day = `${d.getDate()}`.padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    subFor(card: IFinancialCard): string {
        const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };
        const f = new Date(card.from).toLocaleDateString('bg-BG', opts);
        // card.to е изключеният край (полунощ на следващия ден) → показваме реалния последен ден
        const t = new Date(new Date(card.to).getTime() - 1000).toLocaleDateString('bg-BG', opts);
        return f === t ? f : `${f} – ${t}`;
    }

    /** Период с пълни дати (с година) за заглавието на PDF-а. */
    private periodFull(card: IFinancialCard): string {
        const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const f = new Date(card.from).toLocaleDateString('bg-BG', opts);
        const to = new Date(new Date(card.to).getTime() - 1000).toLocaleDateString('bg-BG', opts);
        return `${f} – ${to}`;
    }

    /**
     * Експортира избрания период като PDF файл (директно сваляне, без диалог за печат).
     * Рендира скрита визия (както на екрана), снима я с html2canvas и я записва с jsPDF.
     */
    async exportPdf(): Promise<void> {
        const card = this.service.customCard();
        if (!card || this.exporting) return;
        this.exporting = true;

        const built = this.buildExportHtml(card);
        const root = document.createElement('div');
        root.id = 'pdfRoot';
        root.style.cssText = 'position:fixed;left:-10000px;top:0;width:1120px;background:#ffffff;';
        root.innerHTML = `<style>${built.css}</style>${built.body}`;
        document.body.appendChild(root);

        try {
            const canvas = await html2canvas(root, { scale: 2, backgroundColor: '#ffffff', logging: false });
            const img = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const m = 8;
            const pw = pdf.internal.pageSize.getWidth() - m * 2;
            const pageH = pdf.internal.pageSize.getHeight() - m * 2;
            const ph = (canvas.height * pw) / canvas.width;

            let left = ph;
            let pos = m;
            pdf.addImage(img, 'PNG', m, pos, pw, ph);
            left -= pageH;
            while (left > 0) {
                pos = m - (ph - left);
                pdf.addPage();
                pdf.addImage(img, 'PNG', m, pos, pw, ph);
                left -= pageH;
            }
            pdf.save(built.filename);
        } finally {
            document.body.removeChild(root);
            this.exporting = false;
        }
    }

    /** Сглобява HTML (scoped под #pdfRoot) + CSS за експорта. */
    private buildExportHtml(card: IFinancialCard): { css: string; body: string; filename: string } {
        const t = (k: string) => this.translate.instant(k);
        const colorHex: Record<string, string> = {
            green: '#10aa58', blue: '#246bfe', purple: '#8b54f7', orange: '#f97316',
            red: '#ef3d4d', yellow: '#f59e0b', cyan: '#06b6d4', violet: '#a855f7'
        };
        const badge = (d: IMetricDef, arrow: boolean) =>
            `<span class="badge ${this.badgeClass(d, card)}">${arrow ? this.deltaArrow(d, card) : this.deltaText(d, card)}</span>`;

        const detailRows = this.metricDefs
            .map(
                (d) => `<tr>
                    <td><div class="table-label"><span class="small-icon ${d.iconClass}">${d.icon}</span>${t(d.label)}</div></td>
                    <td class="val"><span class="today-value">${this.format(d, card.current[d.key])}</span> ${badge(d, false)}</td>
                </tr>`
            )
            .join('');

        const overviewItems = this.overviewTiles
            .map((o) => {
                const d = this.getDef(o.key);
                return `<div class="overview-item ${o.color}">
                    <div>
                        <div class="overview-label">${t(o.label)}</div>
                        <div><span class="overview-number ${o.color}">${this.format(d, card.current[o.key])}</span> ${badge(d, true)}</div>
                        <div class="overview-sub">${t(o.sub)}</div>
                    </div>
                    <svg class="ov-spark" viewBox="0 0 132 52"><path d="M5 40 C22 31,30 22,43 28 S63 12,77 23 S98 45,111 15 S122 24,130 2" fill="none" stroke="${colorHex[o.color]}" stroke-width="2.5"/></svg>
                </div>`;
            })
            .join('');

        const title = t('menu.Financial_Dashboard');
        const period = this.periodFull(card);
        const generated = new Date().toLocaleString('bg-BG');

        const css = `
            #pdfRoot * { font-family: Inter, Arial, "Segoe UI", sans-serif; color: #071832; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            #pdfRoot { padding: 22px; background: #fff; }
            #pdfRoot h1 { font-size: 20px; margin: 0; }
            #pdfRoot .sub { color: #526582; font-size: 13px; margin: 4px 0 18px; }
            #pdfRoot .content-row { display: grid; grid-template-columns: 1fr 410px; gap: 20px; align-items: start; }
            #pdfRoot .detail-card, #pdfRoot .overview-card { border: 1px solid #d9e5f1; border-radius: 9px; overflow: hidden; }
            #pdfRoot .panel-title { padding: 14px 18px; font-size: 16px; font-weight: 900; border-bottom: 1px solid #e9eff6; }
            #pdfRoot .finance-table { width: 100%; border-collapse: collapse; font-size: 13px; }
            #pdfRoot .finance-table th { color: #334861; font-size: 12px; font-weight: 800; padding: 10px 18px; border-bottom: 1px solid #e9eff6; text-align: left; }
            #pdfRoot .finance-table td { border-bottom: 1px solid #e9eff6; padding: 9px 18px; }
            #pdfRoot .finance-table tr:last-child td { border-bottom: none; }
            #pdfRoot .finance-table td.val { text-align: right; white-space: nowrap; }
            #pdfRoot .table-label { display: flex; align-items: center; gap: 12px; color: #344d6f; }
            #pdfRoot .small-icon { width: 24px; height: 24px; border-radius: 7px; display: inline-grid; place-items: center; color: #fff; font-size: 13px; }
            #pdfRoot .i-blue { background: #2f7cff; } #pdfRoot .i-orange { background: #ff9f2f; } #pdfRoot .i-green { background: #17b866; } #pdfRoot .i-red { background: #ff4f5f; } #pdfRoot .i-purple { background: #945af9; }
            #pdfRoot .today-value { font-weight: 800; }
            #pdfRoot .badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 900; margin-left: 6px; }
            #pdfRoot .badge.up { color: #089c50; background: #eaf9f0; } #pdfRoot .badge.down { color: #ef3d4d; background: #fff0f1; } #pdfRoot .badge.neutral { color: #b45309; background: #fff7e6; }
            #pdfRoot .overview-card { padding-bottom: 14px; }
            #pdfRoot .overview-list { display: flex; flex-direction: column; gap: 8px; padding: 12px 14px 0; }
            #pdfRoot .overview-item { border: 1px solid #d9e5f1; border-radius: 8px; padding: 9px 14px; display: grid; grid-template-columns: 1fr 116px; align-items: center; }
            #pdfRoot .overview-item.green { background: linear-gradient(135deg,#fff 50%,#f0fbf5); } #pdfRoot .overview-item.blue { background: linear-gradient(135deg,#fff 50%,#f2f7ff); }
            #pdfRoot .overview-item.purple { background: linear-gradient(135deg,#fff 50%,#f8f2ff); } #pdfRoot .overview-item.orange { background: linear-gradient(135deg,#fff 50%,#fff7ef); }
            #pdfRoot .overview-item.red { background: linear-gradient(135deg,#fff 50%,#fff2f4); } #pdfRoot .overview-item.yellow { background: linear-gradient(135deg,#fff 50%,#fffbeb); }
            #pdfRoot .overview-item.cyan { background: linear-gradient(135deg,#fff 50%,#ecfeff); } #pdfRoot .overview-item.violet { background: linear-gradient(135deg,#fff 50%,#faf5ff); }
            #pdfRoot .overview-label { color: #465b79; font-size: 12px; margin-bottom: 4px; }
            #pdfRoot .overview-number { font-size: 20px; font-weight: 900; }
            #pdfRoot .overview-number.green { color: #10aa58; } #pdfRoot .overview-number.blue { color: #246bfe; } #pdfRoot .overview-number.purple { color: #8b54f7; } #pdfRoot .overview-number.orange { color: #f97316; }
            #pdfRoot .overview-number.red { color: #ef3d4d; } #pdfRoot .overview-number.yellow { color: #f59e0b; } #pdfRoot .overview-number.cyan { color: #06b6d4; } #pdfRoot .overview-number.violet { color: #a855f7; }
            #pdfRoot .overview-sub { margin-top: 4px; color: #36506f; font-size: 11px; }
            #pdfRoot .ov-spark { width: 116px; height: 44px; }
            #pdfRoot .foot { color: #526582; font-size: 11px; margin-top: 16px; }`;

        const body = `
            <h1>${title}</h1>
            <div class="sub">${period} · ${this.currency}</div>
            <div class="content-row">
                <div class="detail-card">
                    <div class="panel-title">${t('fin.detail')}</div>
                    <table class="finance-table">
                        <thead><tr><th style="width:62%">${t('fin.metric')}</th><th style="text-align:right">${this.subFor(card)}</th></tr></thead>
                        <tbody>${detailRows}</tbody>
                    </table>
                </div>
                <div class="overview-card">
                    <div class="panel-title">${t('fin.overview')}</div>
                    <div class="overview-list">${overviewItems}</div>
                </div>
            </div>
            <div class="foot">${t('fin.updated')}: ${generated}</div>`;

        const fromStr = this.fmt(new Date(card.from));
        const toStr = this.fmt(new Date(new Date(card.to).getTime() - 86400000));
        const filename = `dashbord-${fromStr}_${toStr}.pdf`;

        return { css, body, filename };
    }

    format(def: IMetricDef, value: number | null): string {
        if (value === null || value === undefined) return '—';
        switch (def.type) {
            case 'money':
                return this.money(value);
            case 'percent':
                return `${value.toFixed(1)} %`;
            case 'ratio':
                return value.toFixed(2);
            case 'int':
            default:
                return `${value}`;
        }
    }

    private money(v: number): string {
        const symbol = this.currency === 'EUR' ? '€' : this.currency;
        return `${v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
    }

    /** Средно поръчки на ден за периода. */
    avgOrdersStr(card: IFinancialCard, days: number): string {
        const v = (card.current.orders || 0) / days;
        return v.toLocaleString('bg-BG', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }

    /** Средно чиста печалба на ден за периода. */
    avgNetProfitStr(card: IFinancialCard, days: number): string {
        return this.money((card.current.netProfit || 0) / days);
    }

    private deltaPct(def: IMetricDef, card: IFinancialCard): number | null {
        const cur = card.current[def.key];
        const prev = card.previous[def.key];
        if (cur === null || prev === null) return null;
        if (prev === 0) return cur === 0 ? 0 : 100;
        return ((cur - prev) / Math.abs(prev)) * 100;
    }

    /** Подписан процент за таблицата, напр. "+42%" / "-4%". */
    deltaText(def: IMetricDef, card: IFinancialCard): string {
        const pct = this.deltaPct(def, card);
        if (pct === null) return '—';
        const sign = pct > 0 ? '+' : '';
        return `${sign}${pct.toFixed(0)}%`;
    }

    /** Със стрелка за картите/прегледа, напр. "▲ 26%". */
    deltaArrow(def: IMetricDef, card: IFinancialCard): string {
        const pct = this.deltaPct(def, card);
        if (pct === null || pct === 0) return '0%';
        const arrow = pct > 0 ? '▲' : '▼';
        return `${arrow} ${Math.abs(pct).toFixed(0)}%`;
    }

    /** 🟢 up / 🔴 down / 🟡 neutral според посоката и дали по-високо е по-добре. */
    badgeClass(def: IMetricDef, card: IFinancialCard): 'up' | 'down' | 'neutral' {
        const pct = this.deltaPct(def, card);
        if (pct === null || Math.abs(pct) < 5) return 'neutral';
        const improved = def.higherBetter ? pct > 0 : pct < 0;
        return improved ? 'up' : 'down';
    }

    private applyCalendarLocale(lang?: string): void {
        if (lang && lang.startsWith('en')) {
            this.primeng.setTranslation({
                firstDayOfWeek: 0,
                dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                today: 'Today',
                clear: 'Clear'
            });
            return;
        }
        this.primeng.setTranslation({
            firstDayOfWeek: 1,
            dayNames: ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота'],
            dayNamesShort: ['нед', 'пон', 'вто', 'сря', 'чет', 'пет', 'съб'],
            dayNamesMin: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
            monthNames: ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'],
            monthNamesShort: ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'],
            today: 'Днес',
            clear: 'Изчисти'
        });
    }
}
