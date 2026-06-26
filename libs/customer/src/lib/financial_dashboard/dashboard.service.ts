import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WebSocketService } from 'xl-util';
import { ROUTES } from '../api.routes';
import { IFinancialCard, IFinancialDashboard } from './interfaces';

/**
 * Сервиз за финансовия дашборд.
 * - Зарежда показателите от бекенда (живи данни).
 * - Преизчислява автоматично при промяна на поръчка (WebSocket topic 'orders').
 * - Периодично опреснява за "живите" карти (Днес / Последни 7 дни).
 */
@Injectable({ providedIn: 'root' })
export class FinancialDashboardService implements OnDestroy {
    private http = inject(HttpClient);
    private ws = inject(WebSocketService);

    data = signal<IFinancialDashboard | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);

    // Карта за произволен период (третата карта с избор на дати)
    customCard = signal<IFinancialCard | null>(null);
    customLoading = signal(false);

    // Часовата зона на браузъра (бекендът смята границите на деня спрямо нея).
    private timeZone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Sofia';

    private wsSub?: Subscription;
    private pollTimer?: ReturnType<typeof setInterval>;
    private readonly POLL_MS = 60_000;

    /** Еднократно зареждане на данните. */
    load(): void {
        this.loading.set(true);
        const path = `/${ROUTES.financialDashboard.get}`;
        this.http
            .get<IFinancialDashboard>(path, { params: { timeZone: this.timeZone } })
            .subscribe({
                next: (d) => {
                    this.data.set(d);
                    this.error.set(null);
                    this.loading.set(false);
                },
                error: () => {
                    this.error.set('error');
                    this.loading.set(false);
                }
            });
    }

    /** Зарежда карта за произволен период (формат на датите: YYYY-MM-DD). */
    loadCustom(from: string, to: string): void {
        this.customLoading.set(true);
        const path = `/${ROUTES.financialDashboard.period}`;
        this.http
            .get<IFinancialCard>(path, { params: { from, to, timeZone: this.timeZone } })
            .subscribe({
                next: (c) => {
                    this.customCard.set(c);
                    this.customLoading.set(false);
                },
                error: () => {
                    this.customLoading.set(false);
                }
            });
    }

    /** Стартира живия режим: зарежда + слуша за промени + периодично опресняване. */
    startLive(): void {
        this.load();

        // Преизчисляване при промяна на поръчка
        this.wsSub = this.ws.listen('orders').subscribe(() => this.load());

        // Периодично опресняване за живите карти
        this.stopPolling();
        this.pollTimer = setInterval(() => this.load(), this.POLL_MS);
    }

    /** Спира живия режим. */
    stopLive(): void {
        this.wsSub?.unsubscribe();
        this.wsSub = undefined;
        this.stopPolling();
    }

    private stopPolling(): void {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = undefined;
        }
    }

    ngOnDestroy(): void {
        this.stopLive();
    }
}
