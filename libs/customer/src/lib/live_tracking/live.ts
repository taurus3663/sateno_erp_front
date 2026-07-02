import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiveTrackingService, LiveAbandonedView } from './live.service';
import { OrderDetailService } from '../wp_order/detail.service';
import { OrderDetailComponent } from '../wp_order/detail';
import { IOrder } from '../wp_order/interfaces';

/**
 * Live проследяване — табло в реално време за активността на сайта.
 * Данните идват от backend-а: снапшот (GET /live/snapshot) + WebSocket /topic/live,
 * а „най-разглеждани продукти" — от GET /live/products/most-viewed.
 *
 * Два режима:
 *  - „На живо (днес)" — моментно състояние (посетители/колички/каси) + днешните списъци.
 *  - „История" — за избран минал период показва само трайните списъци
 *    (напуснати каси, количка без каса, каса без данни, най-разглеждани).
 */
@Component({
    selector: 'live-tracking',
    standalone: true,
    imports: [CommonModule, FormsModule, OrderDetailComponent],
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
            .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 18px; flex-wrap: wrap; }
            .title { display: flex; gap: 16px; align-items: center; }
            .signal { font-size: 42px; color: var(--purple); line-height: 1; }
            .title h1 { font-size: 26px; margin: 0 0 8px; font-weight: 800; }
            .live { display: inline-flex; gap: 8px; align-items: center; color: #05a357; font-weight: 700; font-size: 14px; margin-left: 10px; }
            .live.off { color: #b04a4a; }
            .dot { width: 7px; height: 7px; background: #24c76a; border-radius: 50%; display: inline-block; }
            .dot.off { background: #d98a8a; }
            .sub { color: var(--muted); font-size: 15px; }

            /* --- Контрол за режим/период --- */
            .controls { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
            .mode-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
            .tab { height: 38px; padding: 0 14px; border: 1px solid var(--border); background: #fff; border-radius: 8px; font-weight: 750; color: #344967; cursor: pointer; }
            .tab.active { background: var(--blue); color: #fff; border-color: var(--blue); }
            .range { display: inline-flex; gap: 8px; align-items: center; color: var(--muted); font-size: 14px; flex-wrap: wrap; }
            .date-in { height: 38px; border: 1px solid var(--border); border-radius: 8px; padding: 0 10px; color: #344967; }
            .hist-note { color: var(--muted); font-size: 14px; background: #fff7ec; border: 1px solid #ffe3bd; border-radius: 8px; padding: 10px 14px; margin-bottom: 20px; }

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

            /* Редове с боксове: 2 на ред, всеки бокс с достатъчно ширина за всички колони. */
            .row { display: grid; gap: 22px; margin-bottom: 22px; align-items: start; }
            .row.two { grid-template-columns: 1fr 1fr; }
            .row.viewed { grid-template-columns: 2.1fr 0.9fr; }
            .box { background: white; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
            .box-scroll { overflow-x: auto; overflow-y: auto; max-height: 460px; }
            /* По-компактен скрол за двата списъка (количка без каса / каса без данни) + залепен хедър. */
            .box-scroll.list { max-height: 320px; }
            .box-scroll.list .table th { position: sticky; top: 0; z-index: 1; }
            .box-head { min-height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #e5eef7; background: #fff; gap: 8px; flex-wrap: wrap; }
            .box-title { font-size: 18px; font-weight: 850; display: flex; gap: 10px; align-items: center; }
            .box-sub { font-size: 13px; color: var(--muted); font-weight: 700; }

            .table { width: 100%; border-collapse: collapse; font-size: 14px; }
            .table th { height: 42px; text-align: left; color: #536887; font-weight: 750; background: #fbfdff; border-bottom: 1px solid #e6eef7; padding: 0 14px; white-space: nowrap; }
            .table td { padding: 12px 14px; border-bottom: 1px solid #e6eef7; vertical-align: middle; }
            .table tr:last-child td { border-bottom: 0; }
            .col-num { width: 44px; }
            .nowrap { white-space: nowrap; }
            .price { font-size: 16px; font-weight: 850; white-space: nowrap; }
            .count { font-weight: 800; color: #243a59; white-space: nowrap; }

            /* Миниатюри с ограничена ширина + преливане „+N" — да не изтласкват другите колони. */
            .thumbs { display: flex; align-items: center; gap: 6px; margin-top: 6px; flex-wrap: wrap; max-width: 220px; }
            .thumb { width: 38px; height: 32px; border-radius: 5px; border: 1px solid #d8e2ee; background: linear-gradient(135deg, #eee, #d1d9e5); object-fit: cover; flex: 0 0 auto; }
            .thumb-more { min-width: 38px; height: 32px; padding: 0 6px; border-radius: 5px; border: 1px solid #d8e2ee; background: #eef3f9; color: #4a5f7d; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; }

            .status { display: inline-flex; padding: 6px 9px; border-radius: 8px; background: #eafbf2; color: #13a65d; font-size: 12px; font-weight: 800; white-space: nowrap; }
            .status.gray { background: #eef2f7; color: #5b6c82; }
            .contacts { font-size: 13px; line-height: 1.5; }

            .activity { background: white; border: 1px solid var(--border); border-radius: 10px; padding: 16px; max-height: 460px; overflow-y: auto; }
            .activity h3 { margin: -16px -16px 16px; padding: 16px; font-size: 18px; position: sticky; top: -16px; background: #fff; z-index: 1; }
            .act-row { display: grid; grid-template-columns: 44px 1fr auto; gap: 10px; align-items: center; padding: 12px; border: 1px solid #e5eef7; border-radius: 8px; margin-bottom: 10px; }
            .act-ico { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; font-weight: 900; }
            .bg-blue { background: #eaf3ff; color: var(--blue); }
            .bg-green { background: #e8fbf1; color: var(--green); }
            .bg-red { background: #ffecef; color: var(--red); }
            .act-title { font-size: 14px; font-weight: 750; }
            .act-sub { font-size: 13px; color: var(--muted); margin-top: 3px; }
            .time { font-size: 13px; color: #536887; }
            .filters { display: flex; gap: 10px; align-items: center; }
            .select { height: 36px; border: 1px solid var(--border); border-radius: 8px; background: #fff; padding: 0 12px; color: #344967; font-weight: 700; }
            .product-cell { display: flex; gap: 12px; align-items: center; }
            .pimg { width: 55px; height: 42px; border-radius: 6px; object-fit: cover; background: linear-gradient(135deg, #eee, #cfd7e1); border: 1px solid #dbe5ef; }
            .pname { font-weight: 750; color: #243a59; }
            .sku { font-size: 12px; color: #6a7d98; margin-top: 3px; }
            .muted { color: var(--muted); }
            .btn { height: 44px; border: 1px solid var(--border); background: white; border-radius: 8px; padding: 0 18px; font-weight: 700; color: #30445f; display: flex; align-items: center; gap: 9px; cursor: pointer; }

            @media (max-width: 1100px) {
                .cards { grid-template-columns: 1fr 1fr; }
                .card.primary { grid-column: 1 / -1; }
                .row.two, .row.viewed { grid-template-columns: 1fr; }
            }
            @media (max-width: 760px) {
                :host { margin-left: -2rem; margin-right: -2rem; }
                .top { display: block; }
                .controls { margin-top: 15px; }
                .cards { grid-template-columns: 1fr !important; }
                .wrap { padding-left: 6px; padding-right: 6px; }
                .panel { padding: 12px 6px; }
                .cards .card { padding: 14px; height: auto; min-height: 0; }
                .card.primary { flex-direction: column; align-items: stretch; gap: 14px; }
                .card.primary .kpi-extra { border-left: 0; padding-left: 0; border-top: 1px solid var(--border); padding-top: 12px; gap: 20px; }
                .box-scroll .table { min-width: 560px; }
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
                                <span class="live" [class.off]="!connected()" *ngIf="mode() === 'live'">
                                    <span class="dot" [class.off]="!connected()"></span>{{ connected() ? 'На живо' : 'Изчаква връзка' }}
                                </span>
                            </h1>
                            <div class="sub" *ngIf="mode() === 'live'">Реално време: {{ now() }}</div>
                            <div class="sub" *ngIf="mode() === 'history'">История: {{ fromDate }} – {{ toDate }}</div>
                        </div>
                    </div>
                    <div class="controls">
                        <div class="mode-tabs">
                            <button class="tab" [class.active]="mode() === 'live'" (click)="setLive()">На живо (днес)</button>
                            <button class="tab" [class.active]="isPreset('yesterday')" (click)="preset('yesterday')">Вчера</button>
                            <button class="tab" [class.active]="isPreset('7d')" (click)="preset('7d')">7 дни</button>
                            <button class="tab" [class.active]="isPreset('month')" (click)="preset('month')">Този месец</button>
                        </div>
                        <div class="range">
                            от <input type="date" class="date-in" [(ngModel)]="fromDate" [max]="today">
                            до <input type="date" class="date-in" [(ngModel)]="toDate" [max]="today">
                            <button class="tab" (click)="applyCustom()">Покажи</button>
                        </div>
                    </div>
                </div>

                <div class="hist-note" *ngIf="mode() === 'history'">
                    Показани са трайните данни за периода. Моментното състояние (активни посетители, колички и каси в момента) се вижда само в режим „На живо (днес)".
                </div>

                <!-- KPI карти + активни колички/каси — само на живо -->
                <ng-container *ngIf="mode() === 'live'">
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
                                    <div class="metric-value">{{ abandonedList().length }}</div>
                                    <div class="metric-note">клиенти</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row two">
                        <div class="box">
                            <div class="box-head"><div class="box-title"><span style="color:#2f80ff">&#128722;</span> Активни колички</div></div>
                            <div class="box-scroll">
                                <table class="table">
                                    <tr><th class="col-num">#</th><th>Стойност</th><th>Продукти</th><th>Статус</th><th>Активност</th></tr>
                                    <tr *ngFor="let c of carts()">
                                        <td>{{ c.id }}</td>
                                        <td class="price">{{ money(c.value, c.currency) }}</td>
                                        <td>
                                            <span class="count">{{ c.productsCount }} продукта</span>
                                            <div class="thumbs">
                                                <img class="thumb" *ngFor="let im of thumbs(c.images)" [src]="im" alt="" loading="lazy" />
                                                <span class="thumb-more" *ngIf="more(c.images) as m">+{{ m }}</span>
                                            </div>
                                        </td>
                                        <td><span class="status" *ngIf="c.status">{{ c.status }}</span><span class="muted" *ngIf="!c.status">—</span></td>
                                        <td class="nowrap">{{ c.lastActivity }} <span class="dot"></span></td>
                                    </tr>
                                    <tr *ngIf="carts().length === 0"><td colspan="5" class="muted">Няма активни колички</td></tr>
                                </table>
                            </div>
                        </div>

                        <div class="box">
                            <div class="box-head"><div class="box-title"><span style="color:#8a4cff">&#9635;</span> Активни каси</div></div>
                            <div class="box-scroll">
                                <table class="table">
                                    <tr><th class="col-num">#</th><th>Стойност</th><th>Продукти</th><th>Статус</th><th>Активност</th></tr>
                                    <tr *ngFor="let k of checkouts()">
                                        <td>{{ k.id }}</td>
                                        <td class="price">{{ money(k.value, k.currency) }}</td>
                                        <td>
                                            <span class="count">{{ k.productsCount }} продукта</span>
                                            <div class="thumbs">
                                                <img class="thumb" *ngFor="let im of thumbs(k.images)" [src]="im" alt="" loading="lazy" />
                                                <span class="thumb-more" *ngIf="more(k.images) as m">+{{ m }}</span>
                                            </div>
                                        </td>
                                        <td><span class="status">{{ k.status }}</span></td>
                                        <td class="nowrap">{{ k.lastActivity }}</td>
                                    </tr>
                                    <tr *ngIf="checkouts().length === 0"><td colspan="5" class="muted">Няма активни каси</td></tr>
                                </table>
                            </div>
                        </div>
                    </div>
                </ng-container>

                <!-- Напуснати каси (със снимки на продуктите) — на цял ред -->
                <div class="row">
                    <div class="box">
                        <div class="box-head">
                            <div class="box-title"><span style="color:#ff9d28">&#8618;</span> Напуснати каси
                                <span class="muted" *ngIf="mode() === 'live'">(днес)</span></div>
                            <div class="box-sub">{{ abandonedList().length }} клиенти</div>
                        </div>
                        <div class="box-scroll">
                            <table class="table">
                                <tr><th>Име</th><th>Контакти</th><th>Стойност</th><th>Продукти</th><th class="nowrap">Напуснал</th><th></th></tr>
                                <tr *ngFor="let a of abandonedList()">
                                    <td class="nowrap">{{ a.name || '—' }}</td>
                                    <td class="contacts">{{ a.email || '—' }}<br>{{ a.phone || '—' }}</td>
                                    <td class="price">{{ money(a.value, a.currency) }}</td>
                                    <td>
                                        <span class="count">{{ itemsCount(a.items) }} продукта</span>
                                        <div class="thumbs">
                                            <img class="thumb" *ngFor="let im of thumbs(imgUrls(a.items))" [src]="im" alt="" loading="lazy" />
                                            <span class="thumb-more" *ngIf="more(imgUrls(a.items)) as m">+{{ m }}</span>
                                        </div>
                                    </td>
                                    <td class="nowrap">{{ a.leftAt }}</td>
                                    <td>
                                        <div style="display:flex;flex-direction:column;gap:6px;align-items:stretch;min-width:120px">
                                            <button class="btn" style="font-size:12px;padding:0 10px;height:30px;color:#246bfe;border-color:#d0e2ff;white-space:nowrap;justify-content:center"
                                                    (click)="completeAbandonedOrder(a)">▶ Приключи</button>
                                            <button class="btn" style="font-size:12px;padding:0 10px;height:30px;color:#8a97a8;border-color:#e0e6ee;white-space:nowrap;justify-content:center"
                                                    (click)="dismissAbandoned(a)">Отказ</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr *ngIf="abandonedList().length === 0"><td colspan="6" class="muted">Няма напуснати каси за периода</td></tr>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Двата нови списъка: количка без каса + каса без данни -->
                <div class="row two">
                    <div class="box">
                        <div class="box-head">
                            <div class="box-title"><span style="color:#2f80ff">&#128722;</span> Продукти в количка (без каса)</div>
                            <div class="box-sub">{{ cartsNoCheckout().length }}</div>
                        </div>
                        <div class="box-scroll list">
                            <table class="table">
                                <tr><th class="col-num">#</th><th>Стойност</th><th>Продукти</th><th>Устройство</th><th class="nowrap">Кога</th></tr>
                                <tr *ngFor="let b of cartsNoCheckout()">
                                    <td>{{ b.id }}</td>
                                    <td class="price">{{ money(b.cartValue, b.currency) }}</td>
                                    <td>
                                        <span class="count">{{ b.productsCount }} продукта</span>
                                        <div class="thumbs">
                                            <img class="thumb" *ngFor="let im of thumbs(imgUrls(b.items))" [src]="im" alt="" loading="lazy" />
                                            <span class="thumb-more" *ngIf="more(imgUrls(b.items)) as m">+{{ m }}</span>
                                        </div>
                                    </td>
                                    <td class="nowrap">{{ b.device || '—' }}</td>
                                    <td class="nowrap">{{ b.lastActivity }}</td>
                                </tr>
                                <tr *ngIf="cartsNoCheckout().length === 0"><td colspan="5" class="muted">Няма такива колички за периода</td></tr>
                            </table>
                        </div>
                    </div>

                    <div class="box">
                        <div class="box-head">
                            <div class="box-title"><span style="color:#8a4cff">&#9635;</span> Каси без въведени данни</div>
                            <div class="box-sub">{{ checkoutsNoData().length }}</div>
                        </div>
                        <div class="box-scroll list">
                            <table class="table">
                                <tr><th class="col-num">#</th><th>Стойност</th><th>Продукти</th><th>Устройство</th><th class="nowrap">Кога</th></tr>
                                <tr *ngFor="let b of checkoutsNoData()">
                                    <td>{{ b.id }}</td>
                                    <td class="price">{{ money(b.cartValue, b.currency) }}</td>
                                    <td>
                                        <span class="count">{{ b.productsCount }} продукта</span>
                                        <div class="thumbs">
                                            <img class="thumb" *ngFor="let im of thumbs(imgUrls(b.items))" [src]="im" alt="" loading="lazy" />
                                            <span class="thumb-more" *ngIf="more(imgUrls(b.items)) as m">+{{ m }}</span>
                                        </div>
                                    </td>
                                    <td class="nowrap">{{ b.device || '—' }}</td>
                                    <td class="nowrap">{{ b.lastActivity }}</td>
                                </tr>
                                <tr *ngIf="checkoutsNoData().length === 0"><td colspan="5" class="muted">Няма такива каси за периода</td></tr>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Най-разглеждани продукти + последна активност -->
                <div class="row viewed" style="margin-bottom: 0;">
                    <div class="box">
                        <div class="box-head">
                            <div class="box-title"><span style="color:#2f80ff">&#128065;</span> Най-разглеждани продукти</div>
                            <div class="filters" *ngIf="mode() === 'live'">
                                <select class="select" [(ngModel)]="period" (ngModelChange)="onPeriodChange($event)">
                                    <option value="today">Днес</option>
                                    <option value="yesterday">Вчера</option>
                                    <option value="7d">Последни 7 дни</option>
                                    <option value="month">Този месец</option>
                                </select>
                            </div>
                            <div class="box-sub" *ngIf="mode() === 'history'">{{ fromDate }} – {{ toDate }}</div>
                        </div>
                        <div class="box-scroll">
                            <table class="table">
                                <tr>
                                    <th class="col-num">#</th><th>Продукт</th><th>Разглеждания</th>
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
                    </div>

                    <div class="activity" *ngIf="mode() === 'live'">
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
        <site-detail></site-detail>
    `
})
export class LiveTrackingComponent implements OnInit, OnDestroy {
    private live = inject(LiveTrackingService);
    private orderDetailService = inject(OrderDetailService);

    period = 'today';
    now = signal<string>(new Date().toLocaleString('bg-BG'));
    private clockTimer?: ReturnType<typeof setInterval>;

    // Режим на изгледа: живо (днес) или история (минал период).
    mode = signal<'live' | 'history'>('live');
    today = this.iso(new Date());
    fromDate = this.today;
    toDate = this.today;

    // живо състояние от сервиза
    private snap = this.live.snapshot;
    connected = computed(() => this.snap() !== null);
    visitors = computed(() => this.snap()?.visitors ?? 0);
    visitorsToday = computed(() => this.snap()?.visitorsToday ?? 0);
    ordersToday = computed(() => this.snap()?.ordersToday ?? 0);
    conversion = computed(() => { const v = this.visitorsToday(); return v > 0 ? (this.ordersToday() / v) * 100 : 0; });
    carts = computed(() => this.snap()?.carts ?? []);
    checkouts = computed(() => this.snap()?.checkouts ?? []);
    // id-та на напуснати каси, скрити локално от списъка (само от изгледа, не от базата)
    private dismissedIds = signal<Set<number>>(new Set<number>());
    private abandonedLive = computed(() => (this.snap()?.abandonedToday ?? []).filter(a => !this.dismissedIds().has(a.id)));
    // Напуснати каси според режима: живо (снапшот) или история (за периода).
    abandonedList = computed(() => this.mode() === 'history' ? this.live.abandonedHistory() : this.abandonedLive());
    activity = computed(() => this.snap()?.activity ?? []);
    topProducts = this.live.topProducts;

    // Двата нови списъка (общи за двата режима — пълнят се според избора).
    cartsNoCheckout = this.live.cartsNoCheckout;
    checkoutsNoData = this.live.checkoutsNoData;

    ngOnInit(): void {
        this.live.start();
        this.live.loadProducts(this.period);
        this.clockTimer = setInterval(() => this.now.set(new Date().toLocaleString('bg-BG')), 1000);
    }

    onPeriodChange(p: string): void {
        this.live.loadProducts(p);
    }

    // --- превключване между живо и история ---
    setLive(): void {
        this.mode.set('live');
        this.period = 'today';
        this.fromDate = this.today;
        this.toDate = this.today;
        this.live.loadTodayLists();
        this.live.loadProducts('today');
    }

    /** Бутон-пресет: Вчера / 7 дни / Този месец. */
    preset(kind: 'yesterday' | '7d' | 'month'): void {
        const now = new Date();
        let from: Date;
        let to = new Date();
        if (kind === 'yesterday') {
            from = new Date(now); from.setDate(now.getDate() - 1);
            to = new Date(from);
        } else if (kind === '7d') {
            from = new Date(now); from.setDate(now.getDate() - 6);
        } else {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        this.fromDate = this.iso(from);
        this.toDate = this.iso(to);
        this.applyHistory();
    }

    /** Прилага ръчно въведения диапазон „от/до". */
    applyCustom(): void {
        if (!this.fromDate || !this.toDate) return;
        if (this.fromDate > this.toDate) { const t = this.fromDate; this.fromDate = this.toDate; this.toDate = t; }
        this.applyHistory();
    }

    private applyHistory(): void {
        this.mode.set('history');
        this.live.loadHistory(this.fromDate, this.toDate);
        this.live.loadProducts('custom', this.fromDate, this.toDate);
    }

    /** Активен ли е даден пресет (за подсветка на бутона). */
    isPreset(kind: 'yesterday' | '7d' | 'month'): boolean {
        if (this.mode() !== 'history') return false;
        const now = new Date();
        let from: Date; let to = new Date();
        if (kind === 'yesterday') { from = new Date(now); from.setDate(now.getDate() - 1); to = new Date(from); }
        else if (kind === '7d') { from = new Date(now); from.setDate(now.getDate() - 6); }
        else { from = new Date(now.getFullYear(), now.getMonth(), 1); }
        return this.fromDate === this.iso(from) && this.toDate === this.iso(to);
    }

    completeAbandonedOrder(a: LiveAbandonedView): void {
        const parts = (a.name || '').trim().split(' ');
        this.orderDetailService.prefillMode.set(true);
        this.orderDetailService.pendingSiteId.set(a.siteId);
        this.orderDetailService.pendingSkuItems.set(
            (a.items || []).map(it => ({ sku: it.sku, qty: it.qty, cartPrice: it.price || undefined }))
        );
        this.orderDetailService.selectedItem.set({
            billing: {
                first_name: parts[0] || '',
                last_name: parts.slice(1).join(' '),
                phone: a.phone || '',
                email: a.email || '',
                address_1: '', address_2: '', city: '',
                company: '', country: '', postcode: '', state: ''
            },
            orderLine: []
        } as unknown as IOrder);
        this.orderDetailService.isVisible.set(true);
    }

    /**
     * Отказ: маха касата от таблото и я скрива ТРАЙНО в базата (soft-dismiss),
     * така че да не се връща след опресняване. Данните в базата ОСТАВАТ.
     */
    dismissAbandoned(a: LiveAbandonedView): void {
        // моментален feedback — махаме я веднага от изгледа
        const s = new Set(this.dismissedIds());
        s.add(a.id);
        this.dismissedIds.set(s);
        // трайно в базата; при грешка връщаме записа, за да не изглежда скрит без да е
        this.live.dismissAbandoned(a.id).subscribe({
            error: () => {
                const s2 = new Set(this.dismissedIds());
                s2.delete(a.id);
                this.dismissedIds.set(s2);
            }
        });
    }

    // --- помощни за миниатюрите ---
    /** URL-и на снимките от списък продукти (без празни). */
    imgUrls(items?: { image: string | null }[]): string[] {
        return (items || []).map(i => i.image).filter((x): x is string => !!x);
    }

    /** Първите max миниатюри (останалите се показват като „+N"). */
    thumbs(imgs?: (string | null)[] | null, max = 5): string[] {
        return (imgs || []).filter((x): x is string => !!x).slice(0, max);
    }

    /** Колко снимки остават над показаните max (0 = без „+N"). */
    more(imgs?: (string | null)[] | null, max = 5): number {
        const n = (imgs || []).filter(Boolean).length;
        return n > max ? n - max : 0;
    }

    /** Общ брой продукти (сума на количествата) в списък. */
    itemsCount(items?: { qty: number }[]): number {
        return (items || []).reduce((sum, i) => sum + (i.qty || 1), 0);
    }

    private iso(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
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
