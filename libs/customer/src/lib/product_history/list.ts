import { Component, inject } from '@angular/core';
import { WpProductHistoryListService } from './list.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'wp_product_history_list',
    standalone: true,
    imports: [TableModule, ButtonModule, CommonModule, TooltipModule, TagModule, TranslatePipe, IconField, InputIcon, InputText, FormsModule],
    template: `
        <p-table
            [value]="listService.items()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [paginator]="true"
            [(rows)]=rows
            [totalRecords]="listService.totalRecords()"
            [rowsPerPageOptions]="[10, 20, 50, 100]"
            [loading]="listService.loading()"
            [rowHover]="true"
            dataKey="id"
            paginatorPosition="bottom"
        >
            <ng-template #caption>
                <div class="flex-1 flex justify-content-center">
                    <p-iconfield iconPosition="left">
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" [(ngModel)]="searchValue" (keyup.enter)="onSearch($event)" [placeholder]="'Search_by_name_or_sku...' | translate" class="p-inputtext-sm w-full md:w-25rem border-round-xl shadow-1" />
                        <p-inputicon *ngIf="searchValue" styleClass="pi pi-times cursor-pointer" (click)="clearSearch()" />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template pTemplate="header">
                <tr>
                    <th style="width: 20%">{{ 'Created' | translate }}</th>
                    <th style="width: 20%">{{ 'Old_quantity' | translate }}</th>
                    <th style="width: 20%">{{ 'New_quantity' | translate }}</th>
                    <th style="width: 15%">{{ 'Quantity' | translate }}</th>
                    <th style="width: 10%">{{ 'Reason' | translate }}</th>
                    <th style="width: 10%">{{ 'Changed_by' | translate }}</th>
                    <th style="width: 20%">{{ 'Order' | translate }}</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-hist>
                <tr>
                    <td>{{ hist.createTime | date: 'dd.MM.yyyy HH:mm' }}</td>

                    <td>{{ hist.oldQuantity }}</td>
                    <td>{{ hist.newQuantity }}</td>
                    <td>
                        <span
                            [ngClass]="{
                                'text-green-600 font-bold': hist.newQuantity > hist.oldQuantity,
                                'text-red-600 font-bold': hist.newQuantity < hist.oldQuantity,
                                'text-gray-600 font-bold': hist.newQuantity === hist.oldQuantity || hist.oldQuantity == null
                            }"
                        >
                            <ng-container *ngIf="hist.oldQuantity != null && hist.newQuantity != null && hist.oldQuantity !== hist.newQuantity">
                                {{ hist.newQuantity > hist.oldQuantity ? '+' : '-' }}
                            </ng-container>

                            {{ hist.quantity }}
                        </span>
                    </td>

                    <td>{{ hist.reason }}</td>
                    <td>{{ hist.changerName }}</td>

                    <td>
                        <div class="flex flex-col gap-1.5">
                            <div *ngIf="hist.orderId" class="flex items-center gap-2 text-blue-600 font-medium text-sm" pTooltip="Системна поръчка">
                                <i class="pi pi-shopping-cart text-xs"></i>
                                <span>#{{ hist.orderId }}</span>
                            </div>

                            <div *ngIf="hist.wpOrderId" class="flex items-center gap-2 text-purple-600 font-medium text-sm" pTooltip="WP Поръчка">
                                <i class="pi pi-shopping-bag text-xs"></i>
                                <span>WP: #{{ hist.wpOrderId }}</span>
                            </div>

                            <div *ngIf="hist.productId" class="flex items-center gap-2 text-gray-600 font-medium text-sm" pTooltip="ID на продукта">
                                <i class="pi pi-box text-xs"></i>
                                <span>ID: {{ hist.productId }}</span>
                            </div>

                            <div *ngIf="hist.productSku" class="flex items-center gap-2 text-teal-600 font-medium text-sm" pTooltip="Артикулен номер (SKU)">
                                <i class="pi pi-barcode text-xs"></i>
                                <span>SKU: {{ hist.productSku }}</span>
                            </div>

                            <span *ngIf="!hist.orderId && !hist.wpOrderId && !hist.productId && !hist.productSku" class="text-gray-400">-</span>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `
})
export class WpProductHistoryListComponent {
    protected listService = inject(WpProductHistoryListService);
    protected tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });
    protected rows = 50;
    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters, event.sortField, event.sortOrder);
    }

    // Определя цвета на разликата
    getDiffClass(hist: any) {
        if (hist.oldQuantity == null || hist.newQuantity == null || hist.oldQuantity === hist.newQuantity) {
            return 'text-gray-600 font-bold';
        }
        return hist.newQuantity > hist.oldQuantity ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
    }

    // Определя знака (+/-)
    getDiffSign(hist: any) {
        if (hist.oldQuantity == null || hist.newQuantity == null || hist.oldQuantity === hist.newQuantity) {
            return '';
        }
        return hist.newQuantity > hist.oldQuantity ? '+' : '-';
    }

    // Определя цвета на причината (Tag severity)
    getReasonSeverity(reason: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        if (!reason) return 'secondary';
        const r = reason.toLowerCase();
        if (r.includes('order') || r.includes('sale')) return 'info';
        if (r.includes('cancel') || r.includes('return')) return 'warn';
        if (r.includes('manual')) return 'success';
        return 'secondary';
    }

    protected searchValue: string = '';
    private searchTimeout: any;
    private lastParams: any = { first: 0, rows: 200, filters: {} };
    private executeSearch(value: string) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            // Копираме текущите филтри, за да не загубим избрания статус
            let filters = { ...this.lastParams.filters };

            if (value && value.trim() !== '') {
                // 'customer' е името на параметъра, който Java-та ще очаква
                filters['name_sku'] = { value: value.trim(), matchMode: 'contains' };
            } else {
                // Ако няма текст, премахваме глобалния филтър
                delete filters['name_sku'];
            }

            // Винаги връщаме на страница 0 (първа), когато правим ново търсене
            this.listService.loadList(0, this.rows, filters);
            // this.listService.loadStatusStats();

            // Обновяваме локалното състояние
            this.lastParams.filters = filters;
            this.lastParams.first = 0;
        }, 1000); // 400ms е златната среда за изчакване
    }

    onSearch(event: any) {
        // Взимаме стойността независимо дали е събитие или директен низ
        const value = event?.target?.value !== undefined ? event.target.value : event;

        this.executeSearch(value);
    }
    clearSearch() {
        this.searchValue = '';
        this.executeSearch('');
    }
}
