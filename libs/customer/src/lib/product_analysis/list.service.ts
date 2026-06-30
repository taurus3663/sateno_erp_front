import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ROUTES } from '../api.routes';
import { IProductAnalysisItem, IProductAnalysisThresholds } from './interfaces';

@Injectable({ providedIn: 'root' })
export class ProductAnalysisService {
    private http = inject(HttpClient);

    items = signal<IProductAnalysisItem[]>([]);
    loading = signal(false);

    load(from: string, to: string, thresholds: IProductAnalysisThresholds): void {
        this.loading.set(true);
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Sofia';
        this.http
            .get<IProductAnalysisItem[]>(`/${ROUTES.productAnalysis.get}`, {
                params: {
                    from,
                    to,
                    dMax: thresholds.dMax,
                    cMax: thresholds.cMax,
                    bMax: thresholds.bMax,
                    timeZone,
                },
            })
            .subscribe({
                next: (data) => {
                    this.items.set(data);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false),
            });
    }
}
