import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiveTrackingService } from './live.service';

/**
 * Live проследяване — табло в реално време за активността на сайта.
 * Данните идват от backend-а: снапшот (GET /live/snapshot) + WebSocket /topic/live,
 * а „най-разглеждани продукти" — от GET /live/products/most-viewed.
 */
@Component({
    selector: 'live-tracking',
    standalone: true,
    imports: [CommonModule, FormsModule],
    styles: [
        `
            :host {
                --bg: #f3f8fc;
                --card: #fff;
                --border: #d9e8f5;
                --text: #061935;
                --muted: #526987;
                --blue: #2f80ff;
                --green: #18b96b;
                --purple: #8a4cff;
                --orange: #ff9d28;
                --red: #ff5468;
                --shadow: 0 10px 28px rgba(12, 33, 64, 0.05);
                display: block;
                color: var(--text);
            }
            .wrap { padding: 8px; }
            .panel { background: rgba(255, 255, 255, 0.92); border: 1px solid var(--border); border-radius: 14px; padding: 24px; box-shadow: var(--shadow); }
            .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
            .title { display: flex; gap: 16px; align-items: center; }
            .signal { font-size: 42px; color: var(--purple); line-height: 1; }
            .title h1 { font-size: 26px; margin: 0 0 8px; font-weight: 800; }
            .live { display: inline-flex; gap: 8px; align-items: center; color: #05a357; font-weight: 700; font-size: 14px; margin-left: 10px; }
            .live.off { color: #b04a4a; }
            .dot { width: 7px; height: 7px; background: #24c76a; border-radius: 50%; display: inline-block; }
            .dot.off { background: #d98a8a; }
            .sub { color: var(--muted); font-size: 15px; }
            .actions { display: flex; gap: 14px; }
            .btn { height: 44px; border: 1px solid var(--border); background: white; border-radius: 8px; padding: 0 18px; font-weight: 700; color: #30445f; display: flex; align-items: center; gap: 9px; cursor: pointer; }
            .cards { display: grid; grid-template-columns: 2.2fr 1fr 1fr 1fr; gap: 22px; margin-bottom: 24px; }
            .cards .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 20px 22px; height: 160px; display: flex; align-items: flex-start; box-sizing: border-box; }
            .card.primary { align-items: center; gap: 22px; }
            .card.primary .metric-head { flex: 1 1 auto; align-items: center; }
            .kpi-extra { display: flex; gap: 26px; padding-left: 22px; border-left: 1px solid var(--border); }
            .kpi-stat-val { font-size: 26px; font-weight: 850; color: #243a59; line-height: 1.1; }
            .kpi-stat-lbl { font-size: 13px; color: var(--muted); margin-top: 4px; }
            .metric-head { display: flex; gap: 18px; align-items: flex-start; }
            .ico { width: 54px; height: 54px; border-radius: 12px; color: white; display: grid; place-items: center; font-size: 26px; font-weight: 900; }
            .green { background: var(--green); }
            .blue { background: var(--blue); }
            .purple { background: var(--purple); }
            .orange { background: var(--orange); }
            .metric-title { font-size: 17px; color: #344967; font-weight: 800; margin-top: 8px; }
            .metric-value { font-size: 34px; font-weight: 850; margin-top: 6px; }
            .metric-note { font-size: 15px; color: var(--muted); margin-top: 2px; }
            .grid-mid { display: grid; grid-template-columns: 1.05fr 1.05fr 0.95fr; gap: 22px; margin-bottom: 22px; align-items: start; }
            .box { background: white; border: 1px solid var(--border); border-radius: 10px; overflow-x: hidden; overflow-y: auto; max-height: 420px; }
            .box-head { height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #e5eef7; position: sticky; top: 0; z-index: 2; background: #fff; }
            .box-title { font-size: 18px; font-weight: 850; display: flex; gap: 10px; align-items: center; }
            .table { width: 100%; border-collapse: collapse; font-size: 14px; }
            .table th { height: 42px; text-align: left; color: #536887; font-weight: 750; background: #fbfdff; border-bottom: 1px solid #e6eef7; padding: 0 14px; position: sticky; top: 56px; z-index: 1; }
            .table td { padding: 14px; border-bottom: 1px solid #e6eef7; vertical-align: middle; }
            .table tr:last-child td { border-bottom: 0; }
            .price { font-size: 16px; font-weight: 850; }
            .thumbs { display: flex; align-items: center; gap: 7px; margin-top: 4px; }
            .thumb { width: 36px; height: 30px; border-radius: 4px; border: 1px solid #d8e2ee; background: linear-gradient(135deg, #eee, #d1d9e5); object-fit: cover; }
            .status { display: inline-flex; padding: 6px 9px; border-radius: 8px; background: #eafbf2; color: #13a65d; font-size: 12px; font-weight: 800; }
            .activity { background: white; border: 1px solid var(--border); border-radius: 10px; padding: 16px; max-height: 420px; overflow-y: auto; }
            .activity h3 { margin: -16px -16px 16px; padding: 16px; font-size: 18px; position: sticky; top: -16px; background: #fff; z-index: 1; }
            .act-row { display: grid; grid-template-columns: 44px 1fr auto; gap: 10px; align-items: center; padding: 12px; border: 1px solid #e5eef7; border-radius: 8px; margin-bottom: 10px; }
            .act-ico { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; font-weight: 900; }
            .bg-blue { background: #eaf3ff; color: var(--blue); }
            .bg-green { background: #e8fbf1; color: var(--green); }
            .bg-red { background: #ffecef; color: var(--red); }
            .act-title { font-size: 14px; font-weight: 750; }
            .act-sub { font-size: 13px; color: var(--muted); margin-top: 3px; }
            .time { font-size: 13px; color: #536887; }
            .products-box { margin-top: 0; }
            .filters { display: flex; gap: 10px; align-items: center; }
            .select { height: 36px; border: 1px solid var(--border); border-radius: 8px; background: #fff; padding: 0 12px; color: #344967; font-weight: 700; }
            .product-cell { display: flex; gap: 12px; align-items: center; }
            .pimg { width: 55px; height: 42px; border-radius: 6px; object-fit: cover; background: linear-gradient(135deg, #eee, #cfd7e1); border: 1px solid #dbe5ef; }
            .pname { font-weight: 750; color: #243a59; }
            .sku { font-size: 12px; color: #6a7d98; margin-top: 3px; }
            .muted { color: var(--muted); }
            @media (max-width: 1100px) {
                .cards, .grid-mid { grid-template-columns: 1fr 1fr; }
                .grid-mid .activity { grid-column: 1 / -1; }
                .card.primary { grid-column: 1 / -1; }
            }
            @media (max-width: 760px) {
                .top { display: block; }
                .actions { margin-top: 15px; }
                .cards, .grid-mid { grid-template-columns: 1fr; }
            }
        `
    ],
    template: `
        <div class="wrap">
            <section class="panel">
                <div class="top">
                    <div class="title">
                        <div class="signal">&#9089;</div>
                        <div>
                            <h1>Live проследяване
                                <span class="live" [class.off]="!connected()">
                                    <span class="dot" [class.off]="!connected()"></span>{{ connected() ? 'На живо' : 'Изчаква връзка' }}
                                </span>
                            </h1>
                            <div class="sub">Реално време: {{ now() }}</div>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="btn">&#8635; Обновяване: Автоматично <span class="dot"></span></button>
                    </div>
                </div>

                <!-- KPI карти -->
                <div class="cards">
                    <div class="card primary">
                        <div class="metric-head">
                            <div class="ico green">&#9817;</div>
                            <div>
                                <div class="metric-title">Активни посетители</div>
                                <div class="metric-value">{{ visitors() }}</div>
                                <div class="metric-note">в сайта в момента</div>
                            </div>
                        </div>
                        <div class="kpi-extra">
                            <div>
                                <div class="kpi-stat-val">{{ visitorsToday() }}</div>
                                <div class="kpi-stat-lbl">уникални клиенти днес</div>
                            </div>
                            <div>
                                <div class="kpi-stat-val">{{ conversion() | number:'1.0-1' }}%</div>
                                <div class="kpi-stat-lbl">conversion (днес)</div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="metric-head">
                            <div class="ico blue">&#128722;</div>
                            <div>
                                <div class="metric-title">Активни колички</div>
                                <div class="metric-value">{{ carts().length }}</div>
                                <div class="metric-note">общо активни</div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="metric-head">
                            <div class="ico purple">&#129534;</div>
                            <div>
                                <div class="metric-title">Активни каси</div>
                                <div class="metric-value">{{ checkouts().length }}</div>
                                <div class="metric-note">на касата в момента</div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="metric-head">
                            <div class="ico orange">&#8618;</div>
                            <div>
                                <div class="metric-title">Напуснати каси (днес)</div>
                                <div class="metric-value">{{ abandoned().length }}</div>
                                <div class="metric-note">клиенти</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Среден ред: колички / каси / напуснати -->
                <div class="grid-mid">
                    <div class="box">
                        <div class="box-head">
                            <div class="box-title"><span style="color:#2f80ff">&#128722;</span> Активни колички</div>
                        </div>
                        <table class="table">
                            <tr><th>#</th><th>Стойност</th><th>Продукти</th><th>Статус</th><th>Последна активност</th></tr>
                            <tr *ngFor="let c of carts()">
                                <td>{{ c.id }}</td>
                                <td class="price">{{ money(c.value, c.currency) }}</td>
                                <td>
                                    <b>{{ c.productsCount }} продукта</b>
                                    <div class="thumbs">
                                        <ng-container *ngIf="c.images?.length; else cartPh">
                                            <img class="thumb" *ngFor="let im of c.images" [src]="im" alt="" loading="lazy" />
                                        </ng-container>
                                        <ng-template #cartPh>
                                            <span class="thumb" *ngFor="let t of counter(c.productsCount)"></span>
                                        </ng-template>
                                    </div>
                                </td>
                                <td><span class="status" *ngIf="c.status">{{ c.status }}</span></td>
                                <td>{{ c.lastActivity }} <span class="dot"></span></td>
                            </tr>
                            <tr *ngIf="carts().length === 0"><td colspan="5" class="muted">Няма активни колички</td></tr>
                        </table>
                    </div>

                    <div class="box">
                        <div class="box-head">
                            <div class="box-title"><span style="color:#8a4cff">&#9635;</span> Активни каси</div>
                        </div>
                        <table class="table">
                            <tr><th>#</th><th>Стойност</th><th>Продукти</th><th>Статус</th><th>Активност</th></tr>
                            <tr *ngFor="let k of checkouts()">
                                <td>{{ k.id }}</td>
                                <td class="price">{{ money(k.value, k.currency) }}</td>
                                <td>
                                    <b>{{ k.productsCount }} продукта</b>
                                    <div class="thumbs" *ngIf="k.images?.length">
                                        <img class="thumb" *ngFor="let im of k.images" [src]="im" alt="" loading="lazy" />
                                    </div>
                                </td>
                                <td><span class="status">{{ k.status }}</span></td>
                                <td>{{ k.lastActivity }}</td>
                            </tr>
                            <tr *ngIf="checkouts().length === 0"><td colspan="5" class="muted">Няма активни каси</td></tr>
                        </table>
                    </div>

                    <div class="box">
                        <div class="box-head">
                            <div class="box-title"><span style="color:#ff9d28">&#128722;</span> Напуснати каси <span class="muted">(днес)</span></div>
                        </div>
                        <table class="table">
                            <tr><th>Име</th><th>Контакти</th><th>Стойност</th><th>Напуснал</th></tr>
                            <tr *ngFor="let a of abandoned()">
                                <td>{{ a.name || '—' }}</td>
                                <td>{{ a.email }}<br>{{ a.phone }}</td>
                                <td>{{ money(a.value, a.currency) }}</td>
                                <td>{{ a.leftAt }}</td>
                            </tr>
                            <tr *ngIf="abandoned().length === 0"><td colspan="4" class="muted">Няма напуснати каси днес</td></tr>
                        </table>
                    </div>
                </div>

                <!-- Долен ред: най-разглеждани продукти + последна активност -->
                <div class="grid-mid" style="grid-template-columns: 2.1fr 0.9fr; margin-bottom: 0;">
                    <div class="box products-box">
                        <div class="box-head">
                            <div class="box-title"><span style="color:#2f80ff">&#128065;</span> Най-разглеждани продукти</div>
                            <div class="filters">
                                <select class="select" [(ngModel)]="period" (ngModelChange)="onPeriodChange($event)">
                                    <option value="today">Днес</option>
                                    <option value="yesterday">Вчера</option>
                                    <option value="7d">Последни 7 дни</option>
                                    <option value="month">Този месец</option>
                                </select>
                            </div>
                        </div>
                        <table class="table">
                            <tr>
                                <th>#</th><th>Продукт</th><th>Разглеждания</th>
                                <th>Добавяния</th><th>Започнати каси</th><th>Поръчки</th>
                            </tr>
                            <tr *ngFor="let p of topProducts()">
                                <td>{{ p.rank }}</td>
                                <td>
                                    <div class="product-cell">
                                        <img class="pimg" *ngIf="p.imageUrl" [src]="p.imageUrl" alt="">
                                        <span class="pimg" *ngIf="!p.imageUrl"></span>
                                        <div>
                                            <div class="pname">{{ p.name || ('SKU ' + (p.sku || p.productWpId)) }}</div>
                                            <div class="sku">SKU: {{ p.sku || '—' }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><b>{{ p.views }}</b></td>
                                <td><b>{{ p.addToCart }}</b></td>
                                <td><b>{{ p.checkoutStarts }}</b></td>
                                <td><b>{{ p.orders }}</b></td>
                            </tr>
                            <tr *ngIf="topProducts().length === 0">
                                <td colspan="6" class="muted">Няма данни за избрания период</td>
                            </tr>
                        </table>
                    </div>

                    <div class="activity">
                        <h3>Последна активност</h3>
                        <div class="act-row" *ngFor="let r of activity()">
                            <div class="act-ico"
                                 [class.bg-blue]="r.type === 'visitor' || r.type === 'cart'"
                                 [class.bg-green]="r.type === 'checkout' || r.type === 'order'"
                                 [class.bg-red]="r.type === 'abandon'">
                                <span [ngSwitch]="r.type">
                                    <span *ngSwitchCase="'visitor'">&#9817;</span>
                                    <span *ngSwitchCase="'cart'">&#128722;</span>
                                    <span *ngSwitchCase="'checkout'">&#9635;</span>
                                    <span *ngSwitchCase="'abandon'">&#8618;</span>
                                    <span *ngSwitchCase="'order'">&#10003;</span>
                                </span>
                            </div>
                            <div>
                                <div class="act-title">{{ r.title }}</div>
                                <div class="act-sub" *ngIf="r.sub">{{ r.sub }}</div>
                            </div>
                            <div class="time">{{ r.time }}</div>
                        </div>
                        <div class="act-row" *ngIf="activity().length === 0">
                            <div></div><div class="act-sub">Все още няма активност</div><div></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `
})
export class LiveTrackingComponent implements OnInit, OnDestroy {
    private live = inject(LiveTrackingService);

    period = '7d';
    now = signal<string>(new Date().toLocaleString('bg-BG'));
    private clockTimer?: ReturnType<typeof setInterval>;

    // живо състояние от сервиза
    private snap = this.live.snapshot;
    connected = computed(() => this.snap() !== null);
    visitors = computed(() => this.snap()?.visitors ?? 0);
    visitorsToday = computed(() => this.snap()?.visitorsToday ?? 0);
    ordersToday = computed(() => this.snap()?.ordersToday ?? 0);
    conversion = computed(() => { const v = this.visitorsToday(); return v > 0 ? (this.ordersToday() / v) * 100 : 0; });
    carts = computed(() => this.snap()?.carts ?? []);
    checkouts = computed(() => this.snap()?.checkouts ?? []);
    abandoned = computed(() => this.snap()?.abandonedToday ?? []);
    activity = computed(() => this.snap()?.activity ?? []);
    topProducts = this.live.topProducts;

    ngOnInit(): void {
        this.live.start();
        this.live.loadProducts(this.period);
        this.clockTimer = setInterval(() => this.now.set(new Date().toLocaleString('bg-BG')), 1000);
    }

    onPeriodChange(p: string): void {
        this.live.loadProducts(p);
    }

    counter(n: number): number[] {
        const k = Math.min(Math.max(n || 0, 0), 4);
        return Array.from({ length: k }, (_, i) => i);
    }

    money(value: number | null | undefined, currency?: string): string {
        if (value == null) return '—';
        const v = Number(value).toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `${v} ${this.sym(currency)}`;
    }

    private sym(currency?: string): string {
        switch ((currency || '').toUpperCase()) {
            case 'EUR': return '€';
            case 'BGN': return 'лв';
            case 'RON': return 'lei';
            case 'PLN': return 'zł';
            default: return currency || '';
        }
    }

    ngOnDestroy(): void {
        this.live.stop();
        if (this.clockTimer) clearInterval(this.clockTimer);
    }
}
