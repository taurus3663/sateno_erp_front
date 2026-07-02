import { inject, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WebSocketService } from 'xl-util';

export interface LiveCartView {
    id: number;
    value: number;
    currency: string;
    productsCount: number;
    lastActivity: string;
    images?: string[];
    status?: string;
}
export interface LiveCheckoutView {
    id: number;
    value: number;
    currency: string;
    productsCount: number;
    status: string;
    lastActivity: string;
    images?: string[];
}
export interface LiveAbandonedItem {
    productId: number;
    sku: string;
    name: string;
    image: string | null;
    qty: number;
    price: number;
}
export interface LiveAbandonedView {
    id: number;
    siteId: number;
    name: string;
    email: string;
    phone: string;
    value: number;
    currency: string;
    leftAt: string;
    items: LiveAbandonedItem[];
}
export interface LiveActivityView {
    type: string;
    title: string;
    sub?: string;
    time: string;
}
export interface LiveBasketItem {
    productId: number;
    sku: string;
    name: string;
    image: string | null;
    qty: number;
    price: number;
}
export interface LiveBasketView {
    id: number;
    siteId: number;
    device: string | null;
    cartValue: number;
    currency: string;
    productsCount: number;
    lastActivity: string;
    items: LiveBasketItem[];
}
export interface LiveSnapshot {
    visitors: number;
    visitorsToday: number;
    ordersToday: number;
    carts: LiveCartView[];
    checkouts: LiveCheckoutView[];
    abandonedToday: LiveAbandonedView[];
    activity: LiveActivityView[];
}
export interface MostViewedProduct {
    rank: number;
    productWpId: number;
    sku: string;
    name: string;
    imageUrl: string | null;
    views: number;
    addToCart: number;
    checkoutStarts: number;
    orders: number;
}

/**
 * Сервиз за Live проследяването.
 *  - Зарежда снапшот на живото състояние (GET /live/snapshot).
 *  - Слуша WebSocket topic 'live' за обновяване в реално време.
 *  - Има polling резерв, ако WebSocket падне.
 *  - Тегли „най-разглеждани продукти" за период (GET /live/products/most-viewed).
 */
@Injectable({ providedIn: 'root' })
export class LiveTrackingService implements OnDestroy {
    private http = inject(HttpClient);
    private ws = inject(WebSocketService);

    snapshot = signal<LiveSnapshot | null>(null);
    topProducts = signal<MostViewedProduct[]>([]);
    productsLoading = signal(false);

    // Списъци по кошница/сесия — за днешния и за историческия изглед.
    cartsNoCheckout = signal<LiveBasketView[]>([]);
    checkoutsNoData = signal<LiveBasketView[]>([]);
    // Напуснати каси за избран минал период (историческият изглед).
    abandonedHistory = signal<LiveAbandonedView[]>([]);

    private wsSub?: Subscription;
    private pollTimer?: ReturnType<typeof setInterval>;
    private listsTimer?: ReturnType<typeof setInterval>;
    private readonly POLL_MS = 10_000;
    private readonly LISTS_MS = 30_000;
    // В „история" не опресняваме списъците с днешни данни (пазим избрания период).
    private historyMode = false;

    // Текущ избран период + троттъл за живото опресняване на „най-разглеждани"
    private currentPeriod = '7d';
    private lastProductsRefresh = 0;
    private readonly PRODUCTS_REFRESH_MS = 4000;

    /** Стартира живото проследяване: снапшот + WebSocket + polling резерв. */
    start(): void {
        this.loadSnapshot();
        this.loadTodayLists();

        // Реално време през WebSocket — бекендът бута целия снапшот на /topic/live.
        // При всяко живо събитие опресняваме и „най-разглеждани" (троттълнато, тихо).
        this.wsSub = this.ws.listen('live').subscribe((snap: LiveSnapshot) => {
            if (snap) this.snapshot.set(snap);
            this.refreshProductsThrottled();
        });

        // Резерв: ако WebSocket не работи, дърпаме снапшота периодично
        this.pollTimer = setInterval(() => this.loadSnapshot(), this.POLL_MS);
        // Списъците по кошница/сесия не идват по WebSocket — опресняваме ги на лек интервал,
        // но само в „живия" режим (в история не пипаме избрания период).
        this.listsTimer = setInterval(() => { if (!this.historyMode) this.loadTodayLists(); }, this.LISTS_MS);
    }

    /** Зарежда двата списъка за ДНЕС (без период → бекендът връща днешните). */
    loadTodayLists(): void {
        this.historyMode = false;
        this.fetchBaskets('/live/carts-no-checkout', undefined, undefined, this.cartsNoCheckout);
        this.fetchBaskets('/live/checkouts-no-data', undefined, undefined, this.checkoutsNoData);
    }

    /** Зарежда двата списъка + напуснати каси за избран минал период (историческият изглед). */
    loadHistory(from: string, to: string): void {
        this.historyMode = true;
        this.fetchBaskets('/live/carts-no-checkout', from, to, this.cartsNoCheckout);
        this.fetchBaskets('/live/checkouts-no-data', from, to, this.checkoutsNoData);
        this.http.get<LiveAbandonedView[]>('/live/abandoned', { params: { from, to } })
            .subscribe({ next: (l) => this.abandonedHistory.set(l || []), error: () => this.abandonedHistory.set([]) });
    }

    private fetchBaskets(url: string, from: string | undefined, to: string | undefined, target: WritableSignal<LiveBasketView[]>): void {
        const params: Record<string, string> = {};
        if (from) params['from'] = from;
        if (to) params['to'] = to;
        this.http.get<LiveBasketView[]>(url, { params }).subscribe({
            next: (l) => target.set(l || []),
            error: () => { /* тихо */ }
        });
    }

    loadSnapshot(): void {
        this.http.get<LiveSnapshot>('/live/snapshot').subscribe({
            next: (s) => this.snapshot.set(s),
            error: () => { /* тихо — резервът ще опита пак */ }
        });
    }

    // Диапазон за историческия режим на „най-разглеждани" (period=custom).
    private customFrom?: string;
    private customTo?: string;

    /** Зарежда „най-разглеждани" за период (с индикатор). period = today | yesterday | 7d | month | custom */
    loadProducts(period: string, from?: string, to?: string): void {
        this.currentPeriod = period;
        this.customFrom = from;
        this.customTo = to;
        this.fetchProducts(period, false);
    }

    /** Тихо живо опресняване при ново събитие — не по-често от PRODUCTS_REFRESH_MS. */
    private refreshProductsThrottled(): void {
        const now = Date.now();
        if (now - this.lastProductsRefresh < this.PRODUCTS_REFRESH_MS) return;
        this.fetchProducts(this.currentPeriod, true);
    }

    private fetchProducts(period: string, silent: boolean): void {
        if (!silent) this.productsLoading.set(true);
        this.lastProductsRefresh = Date.now();
        const params: Record<string, string> = { period };
        if (period === 'custom') {
            if (this.customFrom) params['from'] = this.customFrom;
            if (this.customTo) params['to'] = this.customTo;
        }
        this.http
            .get<MostViewedProduct[]>('/live/products/most-viewed', { params })
            .subscribe({
                next: (list) => {
                    this.topProducts.set(list || []);
                    if (!silent) this.productsLoading.set(false);
                },
                error: () => {
                    if (!silent) this.productsLoading.set(false);
                }
            });
    }

    /**
     * „Отказ" — трайно скрива напусната каса в базата (soft-dismiss).
     * Данните ОСТАВАТ; записът само не се връща повече в таблото.
     */
    dismissAbandoned(id: number) {
        return this.http.post<void>(`/live/abandoned/${id}/dismiss`, {});
    }

    stop(): void {
        this.wsSub?.unsubscribe();
        if (this.pollTimer) clearInterval(this.pollTimer);
        if (this.listsTimer) clearInterval(this.listsTimer);
    }

    ngOnDestroy(): void {
        this.stop();
    }
}
