import { inject, Injectable, OnDestroy, signal } from '@angular/core';
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
export interface LiveAbandonedView {
    name: string;
    email: string;
    phone: string;
    value: number;
    currency: string;
    leftAt: string;
}
export interface LiveActivityView {
    type: string;
    title: string;
    sub?: string;
    time: string;
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

    private wsSub?: Subscription;
    private pollTimer?: ReturnType<typeof setInterval>;
    private readonly POLL_MS = 10_000;

    // Текущ избран период + троттъл за живото опресняване на „най-разглеждани"
    private currentPeriod = '7d';
    private lastProductsRefresh = 0;
    private readonly PRODUCTS_REFRESH_MS = 4000;

    /** Стартира живото проследяване: снапшот + WebSocket + polling резерв. */
    start(): void {
        this.loadSnapshot();

        // Реално време през WebSocket — бекендът бута целия снапшот на /topic/live.
        // При всяко живо събитие опресняваме и „най-разглеждани" (троттълнато, тихо).
        this.wsSub = this.ws.listen('live').subscribe((snap: LiveSnapshot) => {
            if (snap) this.snapshot.set(snap);
            this.refreshProductsThrottled();
        });

        // Резерв: ако WebSocket не работи, дърпаме снапшота периодично
        this.pollTimer = setInterval(() => this.loadSnapshot(), this.POLL_MS);
    }

    loadSnapshot(): void {
        this.http.get<LiveSnapshot>('/live/snapshot').subscribe({
            next: (s) => this.snapshot.set(s),
            error: () => { /* тихо — резервът ще опита пак */ }
        });
    }

    /** Зарежда „най-разглеждани" за период (с индикатор). period = today | yesterday | 7d | month */
    loadProducts(period: string): void {
        this.currentPeriod = period;
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
        this.http
            .get<MostViewedProduct[]>('/live/products/most-viewed', { params: { period } })
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

    stop(): void {
        this.wsSub?.unsubscribe();
        if (this.pollTimer) clearInterval(this.pollTimer);
    }

    ngOnDestroy(): void {
        this.stop();
    }
}
