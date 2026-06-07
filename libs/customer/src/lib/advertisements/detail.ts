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
import { MetaAdsListComponent } from '../meta_ads/list';
import { MultiSelect } from 'primeng/multiselect';
import { GoogleAdsListComponent } from '../google_ads/list';

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
                            <p-multi-select [options]="this.metaCampaigns()" [(ngModel)]="selectedMetaCampaigns" [disabled]="!this.selectedMetaAds()" optionLabel="name" optionValue="id" class="w-3xs">
                                <ng-template pTemplate="header">
                                    <div class="flex p-2 gap-2">
                                        <p-button label="{{ 'Select_all' | translate }}" size="small" (click)="metaSelectAll()" />
                                        <p-button label="{{ 'Clear_all' | translate }}" size="small" severity="secondary" (click)="metaClearAll()" />
                                    </div>
                                </ng-template>
                            </p-multi-select>
                        </div>

                        <!-- Dates (на един ред) -->
                        <div class="col-6 lg:col-2">
                            <label class="block font-semibold mb-2 text-sm text-700">{{ 'from' | translate }}</label>
                            <p-date-picker [(ngModel)]="metaDateFrom" [showIcon]="true" [showButtonBar]="true" [appendTo]="'body'" panelStyleClass="w-full md:w-[320px]" class="w-3xs"></p-date-picker>
                        </div>
                        <div class="col-6 lg:col-2">
                            <label class="block font-semibold mb-2 text-sm text-700">{{ 'to' | translate }}</label>
                            <p-date-picker [(ngModel)]="metaDateHasta" [showIcon]="true" [showButtonBar]="true" [appendTo]="'body'" panelStyleClass="w-full md:w-[320px]" class="w-3xs"></p-date-picker>
                        </div>

                        <div class="col-12 lg:col-2">
                            <button pButton label="Приложи" icon="pi pi-check" class="w-3xs mt-3" (click)="submitQ()" [disabled]="!this.selectedMetaCampaigns"></button>
                        </div>
                    </div>
                </div>

                <!-- KPI Квадрати -->
                <!-- Промененият грид -->
                <div class="flex flex-wrap gap-2 mb-5">
                    <div class="flex-auto p-2" *ngFor="let item of metaMetrics()">
                        <div class="stat-box shadow-sm w-full">
                            <div class="text-secondary">{{ item.label }}</div>
                            <div class="val">{{ item.value }}</div>
                        </div>
                    </div>
                </div>

                <!-- Графика -->
                <div class="card">
                    <p-chart type="bar" [data]="metaData" [options]="metaOptions" class="h-[30rem]" />
                </div>
            </p-card>
        </div>

        <div class="card-container">
            <p-card>
                <ng-template pTemplate="header">
                    <div class="flex justify-content-between align-items-center p-4">
                        <span class="text-xl font-bold">Google Ads Performance</span>
                        <!--                        <p-selectButton [options]="viewOptions" [(ngModel)]="selectedView" (onChange)="onViewChange($event)"></p-selectButton>-->
                    </div>
                </ng-template>

                <!-- Филтри -->
                <div class="filter-section p-4 bg-white border-1 surface-border border-round-lg mb-4">
                    <div class="">
                        <!-- Meta Ads -->
                        <div class="col-12 lg:col-6">
                            <label class="block font-semibold mb-2 text-sm text-700">{{ 'Select_google_ads' | translate }}</label>
                            <div class="p-inputgroup">
                                <input pInputText [readonly]="true" [value]="this.selectedGoogleAds()?.name" [placeholder]="'Empty' | translate" class="w-3x" />
                                <button type="button" pButton icon="pi pi-search" (click)="selectGoogleAds()" severity="secondary"></button>
                            </div>
                        </div>

                        <!-- Site Select -->
                        <div class="col-12 lg:col-4">
                            <label class="block font-semibold mb-2 text-sm text-700">{{ 'Select_campaign' | translate }}</label>
                            <p-multi-select [options]="this.googleCampaigns()" [(ngModel)]="selectedGoogleCampaigns" [disabled]="!this.selectedGoogleAds()" optionLabel="name" optionValue="id" class="w-3xs">
                                <ng-template pTemplate="header">
                                    <div class="flex p-2 gap-2">
                                        <p-button label="{{ 'Select_all' | translate }}" size="small" (click)="googleSelectAll()" />
                                        <p-button label="{{ 'Clear_all' | translate }}" size="small" severity="secondary" (click)="googleClearAll()" />
                                    </div>
                                </ng-template>
                            </p-multi-select>
                        </div>

                        <!-- Dates (на един ред) -->
                        <div class="col-6 lg:col-2">
                            <label class="block font-semibold mb-2 text-sm text-700">{{ 'from' | translate }}</label>
                            <p-date-picker [(ngModel)]="googleDateFrom" [showIcon]="true" [showButtonBar]="true" [appendTo]="'body'" panelStyleClass="w-full md:w-[320px]" class="w-3xs"></p-date-picker>
                        </div>
                        <div class="col-6 lg:col-2">
                            <label class="block font-semibold mb-2 text-sm text-700">{{ 'to' | translate }}</label>
                            <p-date-picker [(ngModel)]="googleDateHasta" [showIcon]="true" [showButtonBar]="true" [appendTo]="'body'" panelStyleClass="w-full md:w-[320px]" class="w-3xs"></p-date-picker>
                        </div>

                        <div class="col-12 lg:col-2">
                            <button pButton label="Приложи" icon="pi pi-check" class="w-3xs mt-3" (click)="submitQGoogle()" [disabled]="!this.selectedGoogleCampaigns"></button>
                        </div>
                    </div>
                </div>

                <!-- KPI Квадрати -->
                <!-- Промененият грид -->
                <div class="flex flex-wrap gap-2 mb-5">
                    <div class="flex-auto p-2" *ngFor="let item of googleMetrics()">
                        <div class="stat-box shadow-sm w-full">
                            <div class="text-secondary">{{ item.label }}</div>
                            <div class="val">{{ item.value }}</div>
                        </div>
                    </div>
                </div>

                <!-- Графика -->
                <div class="card">
                    <p-chart type="bar" [data]="googleData" [options]="googleOptions" class="h-[30rem]" />
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

    metaDateFrom: Date | undefined;
    metaDateHasta: Date | undefined;
    metaMetrics = signal<any[]>([]);
    metaData: any;
    metaOptions: any;
    readonly selectedMetaAds: WritableSignal<any> = signal(null);
    readonly metaCampaigns: WritableSignal<any> = signal(null);
    selectedMetaCampaigns: any[] = [];

    googleDateFrom: Date | undefined;
    googleDateHasta: Date | undefined;
    googleMetrics = signal<any[]>([]);
    googleData: any;
    googleOptions: any;
    readonly selectedGoogleAds: WritableSignal<any> = signal(null);
    readonly googleCampaigns: WritableSignal<any> = signal(null);
    selectedGoogleCampaigns: any[] = [];

    // Метод за избор на всички
    protected metaSelectAll() {
        // Взимаме всички налични IDs от сигнала campaigns()
        this.selectedMetaCampaigns = this.metaCampaigns().map((c: any) => c.id);
    }
    protected googleSelectAll() {
        // Взимаме всички налични IDs от сигнала campaigns()
        this.selectedGoogleCampaigns = this.googleCampaigns().map((c: any) => c.id);
    }

    // Метод за изчистване
    protected metaClearAll() {
        this.selectedMetaCampaigns = [];
    }
    protected googleClearAll() {
        this.selectedGoogleCampaigns = [];
    }

    constructor() {
        effect(() => {
            if (this.selectedMetaAds()) {
                this.detailService.getCampaigns(this.selectedMetaAds()!.id).subscribe((value) => this.metaCampaigns.set(value));
            }
            if(this.selectedGoogleAds()) {
                this.detailService.getGoogleCampaigns(this.selectedGoogleAds()!.id).subscribe((value) => this.googleCampaigns.set(value));
            }
        });
    }

    ngOnInit() {
        this.initChart();
    }

    initChart() {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color').trim() || '#495057';
            const borderColor = documentStyle.getPropertyValue('--p-content-border-color').trim() || '#dee2e6';

            this.googleData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: []
            };
            this.metaData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: []
            };

            this.metaOptions = {
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor } } },
                scales: {
                    x: { grid: { color: borderColor } },
                    y: { beginAtZero: true, grid: { color: borderColor } }
                }
            };
            this.googleOptions = {
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor } } },
                scales: {
                    x: { grid: { color: borderColor } },
                    y: { beginAtZero: true, grid: { color: borderColor } }
                }
            };
            this.cd.markForCheck();
        }
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
    protected selectGoogleAds() {
        const ref = this.dialogService.open(GoogleAdsListComponent, {
            header: this.tr.instant('Choose'),
            width: '80%',
            closable: true,
            closeOnEscape: true,
            data: { mode: 'lookup' }
        });
        ref?.onClose.subscribe(async (metaAds) => {
            console.log(metaAds);
            if (metaAds) {
                this.selectedGoogleAds.set(metaAds);
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
                ids: this.selectedMetaCampaigns,
                from: formatDate(this.metaDateFrom),
                to: formatDate(this.metaDateHasta),
                timeZone: timeZone
            })
            .subscribe((data: any) => {
                this.calculateMetrics(data);
                this.updateChart(data);
            });
    }
    protected submitQGoogle() {
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
            .getGoogleAdsRecord({
                ids: this.selectedGoogleCampaigns,
                from: formatDate(this.googleDateFrom),
                to: formatDate(this.googleDateHasta),
                timeZone: timeZone
            })
            .subscribe((data: any) => {
                this.calculateGoogleMetrics(data);
                this.updateGoogleChart(data);
            });
    }

    private updateChart(data: any) {
        const labels = Object.keys(data);
        console.log(labels);
        const getSum = (key: string, field: string) => data[key].reduce((acc: number, r: any) => acc + (r[field] || 0), 0);

        this.metaData = {
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

        this.metaData = { ...this.metaData };
        this.cd.markForCheck();
    }
    private updateGoogleChart(data: any) {
        const documentStyle = getComputedStyle(document.documentElement);
        const labels = Object.keys(data);
        console.log(labels);
        // Функция за сумиране на конкретно поле
        const getSum = (key: string, field: string) => data[key].reduce((acc: number, r: any) => acc + (r[field] || 0), 0);

        this.googleData = {
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

        this.googleData = { ...this.googleData };
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
        this.metaMetrics.set([
            { label: this.tr.instant('SPEND'), value: `€ ${totalSpend.toFixed(2)}` },
            { label: this.tr.instant('CLICKS'), value: totalClicks.toLocaleString() },
            { label: this.tr.instant('IMPRESSIONS'), value: totalImpressions.toLocaleString() },
            { label: this.tr.instant('CTR'), value: `${ctr.toFixed(2)}%` },
            { label: this.tr.instant('CPC'), value: `€ ${cpc.toFixed(2)}` },
            { label: this.tr.instant('CPM'), value: `€ ${cpm.toFixed(2)}` }
        ]);
    }
    private calculateGoogleMetrics(data: any) {
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
        this.googleMetrics.set([
            { label: this.tr.instant('SPEND'), value: `€ ${totalSpend.toFixed(2)}` },
            { label: this.tr.instant('CLICKS'), value: totalClicks.toLocaleString() },
            { label: this.tr.instant('IMPRESSIONS'), value: totalImpressions.toLocaleString() },
            { label: this.tr.instant('CTR'), value: `${ctr.toFixed(2)}%` },
            { label: this.tr.instant('CPC'), value: `€ ${cpc.toFixed(2)}` },
            { label: this.tr.instant('CPM'), value: `€ ${cpm.toFixed(2)}` }
        ]);
    }
}
