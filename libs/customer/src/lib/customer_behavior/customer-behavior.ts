import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiLead, AiSalesService, BehaviorSlice, CustomerBehavior } from '../ai_sales/ai-sales.service';

/**
 * „Поведение на клиента" — детайлен дашборд по клиент (по дизайна).
 * Живи данни от /erp/ai/customer-behavior/{id}. Клиентът се избира от падащото меню (топ лийдове).
 * Полетата „Общо време" и „Локация" още не се събират — показват се като „—".
 */
@Component({
    selector: 'customer-behavior',
    standalone: true,
    imports: [CommonModule, FormsModule],
    styles: [`
        :host {
            --bg:#f3f8fc; --card:#fff; --border:#e2ecf5; --text:#0b2038; --muted:#5b6f8c;
            --blue:#2f80ff; --green:#18b96b; --purple:#8a4cff; --orange:#f97316; --red:#ef3d4d; --gray:#64748b;
            --shadow:0 8px 24px rgba(12,33,64,.05); display:block; color:var(--text);
        }
        .wrap{padding:8px;}
        .panel{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;box-shadow:var(--shadow);}
        .top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:18px;}
        .top h1{font-size:24px;margin:0;font-weight:800;display:flex;align-items:center;gap:10px;}
        .live{font-size:13px;color:#0aa35a;font-weight:700;display:inline-flex;gap:6px;align-items:center;}
        .dot{width:8px;height:8px;border-radius:50%;background:#18c46a;display:inline-block;}
        .sub{color:var(--muted);font-size:13px;margin-top:4px;}
        select{border:1px solid var(--border);border-radius:8px;padding:8px 12px;font:inherit;background:#fff;color:var(--text);min-width:230px;}
        .btn{border:1px solid var(--border);background:#fff;border-radius:8px;padding:8px 14px;font-weight:700;color:#30445f;cursor:pointer;}

        .profile{display:flex;gap:22px;align-items:center;flex-wrap:wrap;border:1px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:16px;background:#fbfdff;}
        .avatar{width:56px;height:56px;border-radius:50%;background:#eaf1fb;display:grid;place-items:center;font-size:24px;color:#7f93b3;}
        .pname{font-weight:800;font-size:17px;}
        .pcontact{color:var(--muted);font-size:13px;margin-top:3px;line-height:1.5;}
        .pstats{display:flex;gap:26px;margin-left:auto;flex-wrap:wrap;}
        .pstat .lbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em;display:flex;align-items:center;gap:5px;}
        .pstat .val{font-weight:800;font-size:17px;margin-top:2px;}
        .tier{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:800;color:#fff;}
        .tier-hot{background:var(--red);} .tier-warm{background:var(--orange);} .tier-cold{background:var(--gray);}

        .kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:16px;}
        .kpi{border:1px solid var(--border);border-radius:12px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start;}
        .kpi .ic{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;color:#fff;font-size:18px;flex:none;}
        .kpi .big{font-size:22px;font-weight:800;line-height:1.1;}
        .kpi .cap{font-size:12px;color:var(--muted);margin-bottom:3px;}
        .kpi .foot{font-size:11px;color:var(--muted);margin-top:4px;}
        .bg-blue{background:var(--blue);} .bg-green{background:var(--green);} .bg-orange{background:var(--orange);}
        .bg-purple{background:var(--purple);} .bg-ok{background:#12b36a;}

        .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;}
        .box{border:1px solid var(--border);border-radius:12px;padding:16px 18px;}
        .box h3{margin:0 0 14px;font-size:15px;font-weight:800;}
        .donut-wrap{display:flex;gap:16px;align-items:center;}
        .donut{width:120px;height:120px;border-radius:50%;flex:none;position:relative;}
        .donut::after{content:'';position:absolute;inset:22px;background:#fff;border-radius:50%;}
        .legend{display:flex;flex-direction:column;gap:7px;font-size:13px;flex:1;}
        .legend .row{display:flex;align-items:center;gap:8px;}
        .legend .sw{width:10px;height:10px;border-radius:3px;flex:none;}
        .legend .lg-lbl{flex:1;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .legend .lg-val{color:var(--muted);font-weight:700;}

        .plist{display:flex;flex-direction:column;gap:10px;}
        .prow{display:flex;align-items:center;gap:10px;font-size:13px;}
        .prow .rank{width:20px;color:var(--muted);font-weight:700;}
        .prow .pn{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .prow .pc{color:var(--muted);font-weight:700;}

        .funnel .fstep{margin-bottom:12px;}
        .funnel .fhead{display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;}
        .funnel .track{height:12px;background:#eef4fa;border-radius:6px;overflow:hidden;}
        .funnel .fill{height:100%;border-radius:6px;}

        .bars{display:flex;flex-direction:column;gap:12px;}
        .bar .bhead{display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;}
        .bar .track{height:8px;background:#eef4fa;border-radius:5px;overflow:hidden;}
        .bar .fill{height:100%;border-radius:5px;background:var(--blue);}

        .grid2{display:grid;grid-template-columns:1.4fr 1fr;gap:16px;}
        table{width:100%;border-collapse:collapse;}
        th,td{text-align:left;padding:9px 8px;border-bottom:1px solid #eef4fa;font-size:13px;}
        th{color:var(--muted);font-weight:700;font-size:11px;text-transform:uppercase;}
        .timeline{display:flex;flex-direction:column;gap:2px;}
        .tl{display:flex;gap:12px;padding:7px 0;font-size:13px;align-items:flex-start;}
        .tl .tt{color:var(--muted);width:64px;flex:none;font-variant-numeric:tabular-nums;}
        .tl .ti{width:9px;height:9px;border-radius:50%;margin-top:5px;flex:none;}
        .tl .txt{flex:1;} .tl .tsub{color:var(--muted);}
        .tl .tdev{color:var(--muted);font-size:12px;}
        .empty{color:var(--muted);text-align:center;padding:26px 0;font-size:13px;}
        .muted{color:var(--muted);}
        @media(max-width:1100px){.kpis{grid-template-columns:repeat(2,1fr);}.grid3,.grid2{grid-template-columns:1fr;}}
    `],
    template: `
    <div class="wrap"><div class="panel">
        <div class="top">
            <div>
                <h1>Поведение на клиента <span class="live"><span class="dot"></span>На живо</span></h1>
                <div class="sub">Детайлен анализ на поведението и активността на клиента.</div>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
                <select [(ngModel)]="selectedId" (ngModelChange)="load()">
                    <option *ngFor="let l of leads()" [ngValue]="l.customerId">
                        #{{l.customerId}} · {{l.leadTier}} · {{l.leadScore}}
                    </option>
                </select>
                <button class="btn" (click)="load()">↻ Обнови</button>
            </div>
        </div>

        <ng-container *ngIf="data() as d; else loadingTpl">
            <!-- ПРОФИЛ -->
            <div class="profile">
                <div class="avatar">👤</div>
                <div>
                    <div class="pname">{{ d.name || ('Клиент #' + d.customerId) }}</div>
                    <div class="pcontact">
                        {{ d.email || 'няма имейл' }}<br>{{ d.phone || 'няма телефон' }}
                    </div>
                </div>
                <div class="pstats">
                    <div class="pstat"><div class="lbl">📅 Първо посещение</div><div class="val">{{ d.firstSeen ? (d.firstSeen | date:'dd.MM.yyyy') : '—' }}</div></div>
                    <div class="pstat"><div class="lbl">📅 Последно</div><div class="val">{{ d.lastSeen ? (d.lastSeen | date:'dd.MM.yyyy') : '—' }}</div></div>
                    <div class="pstat"><div class="lbl">Общо посещения</div><div class="val">{{ d.totalVisits ?? 0 }}</div></div>
                    <div class="pstat"><div class="lbl">Общо време</div><div class="val muted">{{ d.totalTimeText || '—' }}</div></div>
                    <div class="pstat"><div class="lbl">Lead Score</div><div class="val"><span class="tier" [ngClass]="tierClass(d.leadTier)">{{ d.leadScore ?? 0 }} / 100</span></div></div>
                    <div class="pstat"><div class="lbl">Източник</div><div class="val">{{ d.source || '—' }}<div class="sub" *ngIf="d.sourceCampaign">{{ d.sourceCampaign }}</div></div></div>
                </div>
            </div>

            <!-- KPI -->
            <div class="kpis">
                <div class="kpi"><div class="ic bg-blue">👁</div><div><div class="cap">Разгледани страници</div><div class="big">{{ d.pageviews }}</div><div class="foot">{{ perVisit(d) }} на посещение</div></div></div>
                <div class="kpi"><div class="ic bg-green">🛒</div><div><div class="cap">Добавяния в количка</div><div class="big">{{ d.addToCarts }}</div></div></div>
                <div class="kpi"><div class="ic bg-orange">🛍</div><div><div class="cap">Изоставени колички</div><div class="big">{{ d.abandonedCount }}</div><div class="foot">Стойност: {{ d.abandonedValue | number:'1.2-2' }} {{ d.currency }}</div></div></div>
                <div class="kpi"><div class="ic bg-purple">🧾</div><div><div class="cap">Започнати поръчки</div><div class="big">{{ d.checkoutStarts }}</div></div></div>
                <div class="kpi"><div class="ic bg-ok">✓</div><div><div class="cap">Завършени поръчки</div><div class="big">{{ d.completedOrders }}</div><div class="foot">Стойност: {{ d.completedValue | number:'1.2-2' }} {{ d.currency }}</div></div></div>
            </div>

            <!-- 3 колони: категории / фуния / устройство -->
            <div class="grid3">
                <div class="box">
                    <h3>Топ категории</h3>
                    <div class="donut-wrap" *ngIf="d.topCategories.length; else noCat">
                        <div class="donut" [style.background]="donut(d.topCategories)"></div>
                        <div class="legend">
                            <div class="row" *ngFor="let s of d.topCategories; let i=index">
                                <span class="sw" [style.background]="color(i)"></span>
                                <span class="lg-lbl">{{ s.label }}</span><span class="lg-val">{{ s.pct }}%</span>
                            </div>
                        </div>
                    </div>
                    <ng-template #noCat><div class="empty">Няма данни за категории</div></ng-template>
                    <h3 style="margin-top:18px">Топ продукти</h3>
                    <div class="plist" *ngIf="d.topProducts.length; else noProd">
                        <div class="prow" *ngFor="let p of d.topProducts; let i=index">
                            <span class="rank">{{ i+1 }}</span><span class="pn">{{ p.label }}</span><span class="pc">{{ p.count }} пъти</span>
                        </div>
                    </div>
                    <ng-template #noProd><div class="empty">Няма данни за продукти</div></ng-template>
                </div>

                <div class="box funnel">
                    <h3>Фуния (Checkout)</h3>
                    <div class="fstep" *ngFor="let f of d.funnel; let i=index">
                        <div class="fhead"><span>{{ f.label }}</span><span class="muted">{{ f.count }} · {{ capPct(f.pct) }}%</span></div>
                        <div class="track"><div class="fill" [style.width.%]="capPct(f.pct)" [style.background]="color(i)"></div></div>
                    </div>
                </div>

                <div class="box">
                    <h3>Устройство</h3>
                    <div class="donut-wrap" *ngIf="d.devices.length; else noDev">
                        <div class="donut" [style.background]="donut(d.devices)"></div>
                        <div class="legend">
                            <div class="row" *ngFor="let s of d.devices; let i=index">
                                <span class="sw" [style.background]="color(i)"></span>
                                <span class="lg-lbl">{{ s.label }}</span><span class="lg-val">{{ s.pct }}%</span>
                            </div>
                        </div>
                    </div>
                    <ng-template #noDev><div class="empty">Няма данни</div></ng-template>
                    <h3 style="margin-top:18px">Локация</h3>
                    <div class="empty" *ngIf="!d.locations.length">Още не се събира (geo)</div>
                </div>
            </div>

            <!-- хронология + източници -->
            <div class="grid2">
                <div class="box">
                    <h3>Хронология на активността</h3>
                    <div class="timeline" *ngIf="d.timeline.length; else noTl">
                        <div class="tl" *ngFor="let a of d.timeline">
                            <span class="tt">{{ a.time | date:'HH:mm:ss' }}</span>
                            <span class="ti" [style.background]="activityColor(a.type)"></span>
                            <span class="txt">{{ a.title }} <span class="tsub" *ngIf="a.sub">„{{ a.sub }}"</span></span>
                            <span class="tdev" *ngIf="a.device">{{ a.device }}</span>
                        </div>
                    </div>
                    <ng-template #noTl><div class="empty">Няма записана активност</div></ng-template>
                </div>
                <div class="box">
                    <h3>Източници на трафик</h3>
                    <div class="bars" *ngIf="d.trafficSources.length; else noSrc">
                        <div class="bar" *ngFor="let s of d.trafficSources">
                            <div class="bhead"><span>{{ s.label }}</span><span class="muted">{{ s.pct }}%</span></div>
                            <div class="track"><div class="fill" [style.width.%]="s.pct"></div></div>
                        </div>
                    </div>
                    <ng-template #noSrc><div class="empty">Няма данни</div></ng-template>

                    <h3 style="margin-top:18px">Последни изоставени колички</h3>
                    <table *ngIf="d.abandoned.length; else noAb">
                        <thead><tr><th>Дата</th><th>Продукти</th><th>Стойност</th></tr></thead>
                        <tbody>
                            <tr *ngFor="let a of d.abandoned">
                                <td>{{ a.date | date:'dd.MM.yyyy HH:mm' }}</td>
                                <td>{{ a.products }} продукта</td>
                                <td>{{ a.value | number:'1.2-2' }} {{ a.currency }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <ng-template #noAb><div class="empty">Няма изоставени колички</div></ng-template>
                </div>
            </div>
        </ng-container>
        <ng-template #loadingTpl><div class="empty">{{ leads().length ? 'Зареждане...' : 'Няма клиенти с данни. Пусни „Преизчисли Lead Score" в AI Асистент.' }}</div></ng-template>
    </div></div>
    `
})
export class CustomerBehaviorComponent implements OnInit {
    private svc = inject(AiSalesService);

    leads = signal<AiLead[]>([]);
    data = signal<CustomerBehavior | null>(null);
    selectedId: number | null = null;

    private palette = ['#2f80ff', '#18b96b', '#f97316', '#8a4cff', '#ef3d4d', '#64748b'];

    ngOnInit(): void {
        this.svc.getLeads().subscribe({
            next: (l) => {
                this.leads.set(l || []);
                if (l && l.length) { this.selectedId = l[0].customerId; this.load(); }
            },
            error: () => {}
        });
    }

    load(): void {
        if (this.selectedId == null) return;
        this.data.set(null);
        this.svc.getBehavior(this.selectedId).subscribe({
            next: (d) => this.data.set(d),
            error: () => this.data.set(null)
        });
    }

    color(i: number): string { return this.palette[i % this.palette.length]; }

    capPct(p: number): number { return p > 100 ? 100 : (p < 0 ? 0 : p); }

    donut(slices: BehaviorSlice[]): string {
        let acc = 0; const parts: string[] = [];
        slices.forEach((s, i) => { const start = acc; acc += s.pct; parts.push(`${this.color(i)} ${start}% ${acc}%`); });
        if (acc < 100) parts.push(`#eef4fa ${acc}% 100%`);
        return `conic-gradient(${parts.join(',')})`;
    }

    tierClass(tier: string | null): string {
        if (tier === 'горещ') return 'tier-hot';
        if (tier === 'топъл') return 'tier-warm';
        return 'tier-cold';
    }

    activityColor(type: string): string {
        switch (type) {
            case 'product': return '#2f80ff';
            case 'category': return '#8a4cff';
            case 'cart': return '#18b96b';
            case 'checkout': return '#f97316';
            case 'order': return '#12b36a';
            case 'leave': return '#ef3d4d';
            default: return '#64748b';
        }
    }

    perVisit(d: CustomerBehavior): string {
        const v = d.totalVisits || 0;
        if (!v) return '0';
        return (d.pageviews / v).toFixed(1);
    }
}
