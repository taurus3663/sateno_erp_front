import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef, signal, WritableSignal, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ChartModule } from 'primeng/chart';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { DialogService } from 'primeng/dynamicdialog';
import { AdvertisementsDetailService } from './detail.service';
import { MetaAdsListComponent } from '../meta/list';
import { MultiSelect } from 'primeng/multiselect';

@Component({
    selector: 'app-ads-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, SelectButtonModule, ChartModule, ButtonDirective, InputText, TranslatePipe, DatePicker, MultiSelect, Button],
    styles: [
        `
            .card-container {
                margin: 1rem;
            }
            .val {
                font-size: 1.5rem;
                font-weight: 700;
                color: #212121;
            }
            .text-secondary {
                color: #6c757d;
                font-size: 0.9rem;
                margin-bottom: 0.2rem;
            }
            .stat-box {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 1rem;
                border: 1px solid #e9ecef;
            }
            .filter-section {
                background: #ffffff;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                border: 1px solid #e2e8f0;
                border-radius: 12px; /* По-заоблени ъгли за модерна визия */
            }

            /* Намаляваме леко шрифта на label-ите за по-елегантен вид */
            .text-700 {
                color: #475569 !important;
            }
        `
    ],
    template: `
        <div class="card-container">
            <p-card>
                <ng-template pTemplate="header">
                    <div class="flex justify-content-between align-items-center p-4">
                        <span class="text-xl font-bold">Meta Ads Performance</span>
                        <!--                        <p-selectButton [options]="viewOptions" [(ngModel)]="selectedView" (onChange)="onViewChange($event)"></p-selectButton>-->
                    </div>
                </ng-template>

                <!-- Филтри -->
                <div class="filter-section p-4 bg-white border-1 surface-border border-round-lg mb-4">
                    <div class="">
                        <!-- Meta Ads -->
                        <div class="col-12 lg:col-6">
                            <label class="block font-semibold mb-2 text-sm text-700">{{ 'Select_meta_ads' | translate }}</label>
                            <div class="p-inputgroup">
                                <input pInputText [readonly]="true" [value]="this.selectedMetaAds()?.name" [placeholder]="'Empty' | translate" class="w-3x" />
                                <button type="button" pButton icon="pi pi-search" (click)="selectMetaAds()" severity="secondary"></button>
                            </div>
                        </div>

                        <!-- Site Select -->
                        <div class="col-12 lg:col-4">
                            <label class="block font-semibold mb-2 text-sm text-700">{{ 'Select_campaign' | translate }}</label>
                            <p-multi-select [options]="this.campaigns()" [(ngModel)]="selectedCampaigns" [disabled]="!this.selectedMetaAds()" optionLabel="name" optionValue="id" class="w-3xs">
                                <ng-template pTemplate="header">
                                    <div class="flex p-2 gap-2">
                                        <p-button label="{{ 'Select_all' | translate }}" size="small" (click)="selectAll()" />
                                        <p-button label="{{ 'Clear_all' | translate }}" size="small" severity="secondary" (click)="clearAll()" />
                                    </div>
                                </ng-template>
                            </p-multi-select>
                        </div>

                        <!-- Dates (на един ред) -->
                        <div class="col-6 lg:col-2">
                            <label class="block font-semibold mb-2 text-sm text-700">{{ 'from' | translate }}</label>
                            <p-date-picker [(ngModel)]="dateFrom" [showIcon]="true" [showButtonBar]="true" [appendTo]="'body'" panelStyleClass="w-full md:w-[320px]" class="w-3xs"> </p-date-picker>
                        </div>
                        <div class="col-6 lg:col-2">
                            <label class="block font-semibold mb-2 text-sm text-700">{{ 'to' | translate }}</label>
                            <p-date-picker [(ngModel)]="dateHasta" [showIcon]="true" [showButtonBar]="true" [appendTo]="'body'" panelStyleClass="w-full md:w-[320px]" class="w-3xs"> </p-date-picker>
                        </div>

                        <div class="col-12 lg:col-2">
                            <button pButton label="Приложи" icon="pi pi-check" class="w-3xs mt-3" (click)="submitQ()" [disabled]="!this.selectedCampaigns"></button>
                        </div>
                    </div>
                </div>

                <!-- KPI Квадрати -->
                <!-- Промененият грид -->
                <div class="flex flex-wrap gap-2 mb-5">
                    <div class="flex-auto p-2" *ngFor="let item of metrics()">
                        <div class="stat-box shadow-sm w-full">
                            <div class="text-secondary">{{ item.label }}</div>
                            <div class="val">{{ item.value }}</div>
                        </div>
                    </div>
                </div>

                <!-- Графика -->
                <div class="card">
                    <p-chart type="bar" [data]="data" [options]="options" class="h-[30rem]" />
                </div>
            </p-card>
        </div>
    `
})
export class AdvertisementDetailComponent implements OnInit {
    private platformId = inject(PLATFORM_ID);
    private cd = inject(ChangeDetectorRef);
    private dialogService = inject(DialogService);
    private tr = inject(TranslateService);
    private detailService = inject(AdvertisementsDetailService);

    viewOptions = [
        { label: 'Час', value: 'hour' },
        { label: 'Ден', value: 'day' },
        { label: 'Месец', value: 'month' }
    ];
    selectedView: string = 'hour';

    dateFrom: Date | undefined;
    dateHasta: Date | undefined;

    // metrics = [
    //     { label: 'Spend', value: '€ 1,240.50' },
    //     { label: 'Clicks', value: '3,450' },
    //     { label: 'Impressions', value: '45,200' },
    //     { label: 'CTR', value: '2.4%' },
    //     { label: 'CPC', value: '€ 0.36' },
    //     { label: 'CPM', value: '€ 27.45' }
    // ];
    // Замени статичния `metrics` с това:
    metrics = signal<any[]>([]);

    data: any;
    options: any;

    readonly selectedMetaAds: WritableSignal<any> = signal(null);
    readonly campaigns: WritableSignal<any> = signal(null);
    // Променлива за масив от избрани ID-та
    selectedCampaigns: any[] = [];

// Метод за избор на всички
    protected selectAll() {
        // Взимаме всички налични IDs от сигнала campaigns()
        this.selectedCampaigns = this.campaigns().map((c: any) => c.id);
    }

// Метод за изчистване
    protected clearAll() {
        this.selectedCampaigns = [];
    }

    constructor() {
        effect(() => {
            if (this.selectedMetaAds()) {
                this.detailService.getCampaigns(this.selectedMetaAds()!.id).subscribe((value) => this.campaigns.set(value));
            }
        });
    }

    ngOnInit() {
        this.initChart();
    }

    initChart() {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            this.data = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                    // { label: 'Spend (€)', backgroundColor: '#3b82f6', data: [65, 59, 80, 81, 56, 55, 40] },
                    // { label: 'Clicks', backgroundColor: '#64748b', data: [28, 48, 40, 19, 86, 27, 90] }
                ]
            };
            this.options = {
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: documentStyle.getPropertyValue('--p-text-color') } } },
                scales: {
                    x: { grid: { color: documentStyle.getPropertyValue('--p-content-border-color') } },
                    y: { beginAtZero: true, grid: { color: documentStyle.getPropertyValue('--p-content-border-color') } }
                }
            };
            this.cd.markForCheck();
        }
    }

    onViewChange(event: any) {
        console.log('Period:', event.value);
    }

    protected selectMetaAds() {
        const ref = this.dialogService.open(MetaAdsListComponent, {
            header: this.tr.instant('Choose'),
            width: '80%',
            closable: true,
            closeOnEscape: true,
            data: { mode: 'lookup' }
        });
        ref?.onClose.subscribe(async (metaAds) => {
            console.log(metaAds);
            if (metaAds) {
                this.selectedMetaAds.set(metaAds);
            }
        });
    }

    protected submitQ() {
        // Помощна функция за форматиране на дата
        const formatDate = (date: Date | undefined) => {
            if (!date) return undefined;
            // Взимаме годината, месеца и деня ръчно, без да ползваме toISOString()
            const y = date.getFullYear();
            const m = (date.getMonth() + 1).toString().padStart(2, '0');
            const d = date.getDate().toString().padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        this.detailService
            .getAdsRecord({
                ids: this.selectedCampaigns,
                from: formatDate(this.dateFrom),
                to: formatDate(this.dateHasta),
                timeZone: timeZone
            })
            .subscribe((data: any) => {
                this.calculateMetrics(data);
                this.updateChart(data);
            });
    }

    private updateChart(data: any) {
        const documentStyle = getComputedStyle(document.documentElement);
        const labels = Object.keys(data);
            console.log(labels);
        // Функция за сумиране на конкретно поле
        const getSum = (key: string, field: string) => data[key].reduce((acc: number, r: any) => acc + (r[field] || 0), 0);

        this.data = {
            labels: labels,
            datasets: [
                { label: this.tr.instant('SPEND'), backgroundColor: '#3b82f6', data: labels.map((k) => getSum(k, 'spend')) },
                { label: this.tr.instant('CLICKS'), backgroundColor: '#64748b', data: labels.map((k) => getSum(k, 'clicks')) },
                { label: this.tr.instant('IMPRESSIONS'), backgroundColor: '#ef4444', data: labels.map((k) => getSum(k, 'impressions')) },
                { label: this.tr.instant('CTR'), backgroundColor: '#f59e0b', data: labels.map((k) => getSum(k, 'ctr')) },
                { label: this.tr.instant('CPC'), backgroundColor: '#10b981', data: labels.map((k) => getSum(k, 'cpc')) },
                { label: this.tr.instant('CPM'), backgroundColor: '#8b5cf6', data: labels.map((k) => getSum(k, 'cpm')) }
            ]
        };

        this.data = { ...this.data };
        this.cd.markForCheck();
    }

    private calculateMetrics(data: any) {
        let totalSpend = 0;
        let totalClicks = 0;
        let totalImpressions = 0;

        Object.values(data).forEach((records: any) => {
            records.forEach((r: any) => {
                totalSpend += r.spend || 0;
                totalClicks += r.clicks || 0;
                totalImpressions += r.impressions || 0;
            });
        });

        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
        const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;

        // Използваме this.tr.instant() за всеки етикет
        this.metrics.set([
            { label: this.tr.instant('SPEND'), value: `€ ${totalSpend.toFixed(2)}` },
            { label: this.tr.instant('CLICKS'), value: totalClicks.toLocaleString() },
            { label: this.tr.instant('IMPRESSIONS'), value: totalImpressions.toLocaleString() },
            { label: this.tr.instant('CTR'), value: `${ctr.toFixed(2)}%` },
            { label: this.tr.instant('CPC'), value: `€ ${cpc.toFixed(2)}` },
            { label: this.tr.instant('CPM'), value: `€ ${cpm.toFixed(2)}` }
        ]);
    }
}
