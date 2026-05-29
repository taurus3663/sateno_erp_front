import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ChartModule } from 'primeng/chart';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';

@Component({
    selector: 'app-ads-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, SelectButtonModule, ChartModule, ButtonDirective, InputText, TranslatePipe, Select, DatePicker],
    styles: [`
        .card-container { margin: 1rem; }
        .val { font-size: 1.5rem; font-weight: 700; color: #212121; }
        .text-secondary { color: #6c757d; font-size: 0.9rem; margin-bottom: 0.2rem; }
        .stat-box { background: #f8f9fa; border-radius: 8px; padding: 1rem; border: 1px solid #e9ecef; }
            .filter-section {
                background: #ffffff;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                border: 1px solid #e2e8f0;
                border-radius: 12px; /* По-заоблени ъгли за модерна визия */
            }

            /* Намаляваме леко шрифта на label-ите за по-елегантен вид */
            .text-700 { color: #475569 !important; }




    `],
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
                                <input pInputText [readonly]="true" [placeholder]="'Empty' | translate" class="w-3x" />
                                <button type="button" pButton icon="pi pi-search" (click)="selectMetaAds()" severity="secondary"></button>
                            </div>
                        </div>

                        <!-- Site Select -->
                        <div class="col-12 lg:col-4">
                            <label class="block font-semibold mb-2 text-sm text-700">{{ 'select' | translate }}</label>
                            <p-select [options]="[]" optionLabel="name" [placeholder]="'Select_Site' | translate" class="w-3xs"></p-select>
                        </div>

                        <!-- Dates (на един ред) -->
                        <div class="col-6 lg:col-2">
                            <label class="block font-semibold mb-2 text-sm text-700">От дата</label>
                            <p-datepicker
                                [(ngModel)]="dateFrom"
                                [showIcon]="true"
                                [showButtonBar]="true"
                                [appendTo]="'body'"
                                panelStyleClass="w-full md:w-[320px]"
                                class="w-3xs">
                            </p-datepicker>
                        </div>
                        <div class="col-6 lg:col-2">
                            <label class="block font-semibold mb-2 text-sm text-700">От дата</label>
                            <p-datepicker
                                [(ngModel)]="dateFrom"
                                [showIcon]="true"
                                [showButtonBar]="true"
                                [appendTo]="'body'"
                                panelStyleClass="w-full md:w-[320px]"
                                class="w-3xs">
                            </p-datepicker>
                        </div>
                    </div>
                </div>

                <!-- KPI Квадрати -->
                <!-- Промененият грид -->
                <div class="flex flex-wrap gap-2 mb-5">
                    <div class="flex-auto p-2" *ngFor="let item of metrics">
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

    viewOptions = [{ label: 'Час', value: 'hour' }, { label: 'Ден', value: 'day' }, { label: 'Месец', value: 'month' }];
    selectedView: string = 'hour';

    dateFrom: Date | undefined;
    dateHasta: Date | undefined;

    metrics = [
        { label: 'Spend', value: '€ 1,240.50' },
        { label: 'Clicks', value: '3,450' },
        { label: 'Impressions', value: '45,200' },
        { label: 'CTR', value: '2.4%' },
        { label: 'CPC', value: '€ 0.36' },
        { label: 'CPM', value: '€ 27.45' }
    ];

    data: any;
    options: any;

    ngOnInit() { this.initChart(); }

    initChart() {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            this.data = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                    { label: 'Spend (€)', backgroundColor: '#3b82f6', data: [65, 59, 80, 81, 56, 55, 40] },
                    { label: 'Clicks', backgroundColor: '#64748b', data: [28, 48, 40, 19, 86, 27, 90] }
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

    onViewChange(event: any) { console.log('Period:', event.value); }
    protected selectMetaAds() { /* Логика за диалог */ }
}
