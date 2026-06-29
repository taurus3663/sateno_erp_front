import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePicker } from 'primeng/datepicker';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tooltip } from 'primeng/tooltip';
import { ProductAnalysisService } from './list.service';
import { IProductAnalysisItem } from './interfaces';
import { WpProductDetailService } from '../wp_product/detail.service';
import { WpCategoryDetailComponent } from '../wp_product/detail';
import { ROUTES } from '../api.routes';
import { IWpProduct } from '../wp_product/interfaces';

type RatingFilter = 'ALL' | 'A' | 'B' | 'C' | 'D';

@Component({
    selector: 'product-analysis-list',
    standalone: true,
    imports: [CommonModule, FormsModule, DatePicker, Button, InputNumber, ProgressSpinner, Tooltip, WpCategoryDetailComponent],
    styles: [`
        :host { display: block; padding: 16px; font-family: inherit; }
        h1 { margin: 0 0 18px; font-size: 22px; font-weight: 900; color: #071832; }

        .toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; margin-bottom: 18px; }
        .field { display: flex; flex-direction: column; gap: 4px; }
        .field label { font-size: 12px; font-weight: 700; color: #526582; }

        .threshold-row { display: flex; gap: 6px; align-items: stretch; }
        .threshold-slot { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .threshold-letter { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; }
        .threshold-letter.D { background: #f1f5f9; color: #94a3b8; }
        .threshold-letter.C { background: #dbeafe; color: #1e40af; }
        .threshold-letter.B { background: #ffedd5; color: #9a3412; }
        .threshold-letter.A { background: #d1fae5; color: #065f46; }
        .threshold-label { font-size: 10px; font-weight: 700; color: #94a3b8; white-space: nowrap; }
        .threshold-input-wrap { width: 60px; }
        .threshold-a-val { font-size: 14px; font-weight: 900; color: #065f46; background: #d1fae5; border-radius: 8px; padding: 4px 8px; }
        .threshold-arrow { color: #cbd5e1; font-size: 16px; align-self: center; margin-top: 14px; }

        .filter-btns { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
        .filter-btn { border: none; border-radius: 999px; padding: 5px 16px; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
        .filter-btn:not(.active) { opacity: .55; }
        .filter-btn.all  { background: #e2e8f0; color: #1e334f; }
        .filter-btn.rA   { background: #d1fae5; color: #065f46; }
        .filter-btn.rB   { background: #ffedd5; color: #9a3412; }
        .filter-btn.rC   { background: #dbeafe; color: #1e40af; }
        .filter-btn.rD   { background: #f1f5f9; color: #475569; }

        table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
        th { background: #f8fafc; color: #526582; font-size: 12px; font-weight: 700; text-align: left; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
        td { padding: 9px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; color: #1e334f; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #f8fafc; }

        .badge { display: inline-flex; align-items: center; justify-content: center;
                 width: 32px; height: 32px; border-radius: 8px;
                 font-size: 15px; font-weight: 900; }
        .badge.A { background: #d1fae5; color: #065f46; }
        .badge.B { background: #ffedd5; color: #9a3412; }
        .badge.C { background: #dbeafe; color: #1e40af; }
        .badge.D { background: #f1f5f9; color: #94a3b8; }

        .empty { text-align: center; padding: 48px; color: #94a3b8; font-size: 15px; }
        .spinner-wrap { display: flex; justify-content: center; padding: 48px; }
    `],
    template: `
        <h1>Анализ на продукти</h1>

        <div class="toolbar">
            <div class="field">
                <label>От дата</label>
                <p-datepicker [(ngModel)]="fromDate" dateFormat="dd.mm.yy" [showIcon]="true" appendTo="body" />
            </div>
            <div class="field">
                <label>До дата</label>
                <p-datepicker [(ngModel)]="toDate" dateFormat="dd.mm.yy" [showIcon]="true" appendTo="body" />
            </div>

            <div class="field">
                <label>Прагове за рейтинг</label>
                <div class="threshold-row">
                    <div class="threshold-slot">
                        <span class="threshold-letter D">D</span>
                        <div class="threshold-input-wrap">
                            <p-inputnumber [(ngModel)]="dMax" [min]="0" [max]="99" [showButtons]="false" inputStyleClass="text-center w-full" />
                        </div>
                        <span class="threshold-label">0 – {{ dMax }}</span>
                    </div>
                    <span class="threshold-arrow">›</span>
                    <div class="threshold-slot">
                        <span class="threshold-letter C">C</span>
                        <div class="threshold-input-wrap">
                            <p-inputnumber [(ngModel)]="cMax" [min]="0" [max]="99" [showButtons]="false" inputStyleClass="text-center w-full" />
                        </div>
                        <span class="threshold-label">{{ dMax + 1 }} – {{ cMax }}</span>
                    </div>
                    <span class="threshold-arrow">›</span>
                    <div class="threshold-slot">
                        <span class="threshold-letter B">B</span>
                        <div class="threshold-input-wrap">
                            <p-inputnumber [(ngModel)]="bMax" [min]="0" [max]="99" [showButtons]="false" inputStyleClass="text-center w-full" />
                        </div>
                        <span class="threshold-label">{{ cMax + 1 }} – {{ bMax }}</span>
                    </div>
                    <span class="threshold-arrow">›</span>
                    <div class="threshold-slot">
                        <span class="threshold-letter A">A</span>
                        <span class="threshold-a-val">{{ bMax + 1 }}+</span>
                        <span class="threshold-label">над {{ bMax }}</span>
                    </div>
                </div>
            </div>

            <p-button label="Анализирай" icon="pi pi-chart-bar" (onClick)="load()" [loading]="svc.loading()" />
        </div>

        <div class="filter-btns">
            <button class="filter-btn all" [class.active]="ratingFilter() === 'ALL'" (click)="ratingFilter.set('ALL')">
                Всички ({{ svc.items().length }})
            </button>
            <button class="filter-btn rA" [class.active]="ratingFilter() === 'A'" (click)="ratingFilter.set('A')">
                A — над {{ bMax }} поръчки ({{ countByRating()['A'] }})
            </button>
            <button class="filter-btn rB" [class.active]="ratingFilter() === 'B'" (click)="ratingFilter.set('B')">
                B — до {{ bMax }} поръчки ({{ countByRating()['B'] }})
            </button>
            <button class="filter-btn rC" [class.active]="ratingFilter() === 'C'" (click)="ratingFilter.set('C')">
                C — до {{ cMax }} поръчки ({{ countByRating()['C'] }})
            </button>
            <button class="filter-btn rD" [class.active]="ratingFilter() === 'D'" (click)="ratingFilter.set('D')">
                D — до {{ dMax }} поръчки ({{ countByRating()['D'] }})
            </button>
        </div>

        @if (svc.loading()) {
            <div class="spinner-wrap"><p-progress-spinner strokeWidth="4" [style]="{width:'48px',height:'48px'}" /></div>
        } @else if (filtered().length === 0 && svc.items().length === 0) {
            <div class="empty">Изберете период и натиснете „Анализирай"</div>
        } @else if (filtered().length === 0) {
            <div class="empty">Няма продукти за избрания филтър</div>
        } @else {
            <table>
                <thead>
                    <tr>
                        <th style="width:48px">Рейтинг</th>
                        <th>Продукт</th>
                        <th>SKU</th>
                        <th style="width:110px;text-align:right">Поръчки</th>
                        <th style="width:52px"></th>
                    </tr>
                </thead>
                <tbody>
                    @for (item of filtered(); track item.sku) {
                        <tr>
                            <td><span class="badge {{ item.rating }}">{{ item.rating }}</span></td>
                            <td>{{ item.productName }}</td>
                            <td style="color:#94a3b8;font-family:monospace">{{ item.sku }}</td>
                            <td style="text-align:right;font-weight:700">{{ item.orderCount }}</td>
                            <td>
                                <p-button
                                    icon="pi pi-pencil"
                                    [rounded]="true"
                                    [text]="true"
                                    severity="secondary"
                                    [loading]="openingSku() === item.sku"
                                    (onClick)="openProduct(item)"
                                    pTooltip="Отвори продукт" />
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        }

        <wp_product-detail></wp_product-detail>
    `,
})
export class ProductAnalysisListComponent implements OnInit {
    svc = inject(ProductAnalysisService);
    detailService = inject(WpProductDetailService);
    private http = inject(HttpClient);

    fromDate: Date;
    toDate: Date;

    dMax = 0;
    cMax = 1;
    bMax = 2;

    ratingFilter = signal<RatingFilter>('ALL');
    openingSku = signal<string | null>(null);

    filtered = computed<IProductAnalysisItem[]>(() => {
        const f = this.ratingFilter();
        return f === 'ALL' ? this.svc.items() : this.svc.items().filter(i => i.rating === f);
    });

    countByRating = computed<Record<string, number>>(() => {
        const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
        for (const item of this.svc.items()) counts[item.rating] = (counts[item.rating] ?? 0) + 1;
        return counts;
    });

    constructor() {
        const today = new Date();
        this.toDate = new Date(today);
        const from = new Date(today);
        from.setDate(from.getDate() - 60);
        this.fromDate = from;
    }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.svc.load(this.formatDate(this.fromDate), this.formatDate(this.toDate), {
            dMax: this.dMax,
            cMax: this.cMax,
            bMax: this.bMax,
        });
    }

    openProduct(item: IProductAnalysisItem): void {
        this.openingSku.set(item.sku);
        this.http
            .get<{ content: IWpProduct[] }>(`/${ROUTES.wp_product.list}`, {
                params: { name_sku: item.sku, size: 10 },
            })
            .subscribe({
                next: (page) => {
                    const match = page.content.find(p => p.sku === item.sku);
                    if (match) {
                        this.detailService.openEditDialog(match);
                    }
                    this.openingSku.set(null);
                },
                error: () => this.openingSku.set(null),
            });
    }

    private formatDate(d: Date): string {
        return d.toISOString().slice(0, 10);
    }
}
