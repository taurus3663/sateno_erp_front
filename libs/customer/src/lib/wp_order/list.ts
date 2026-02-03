import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderListService } from './list.service';
import { OrderDetailService } from './detail.service';
import { IOrder, OrderStatus, OrderStatusLabels, PaymentMethod, PaymentMethodLabels } from './interfaces';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { OrderDetailComponent } from './detail';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { HttpClient } from '@angular/common/http';
import { SiteSelectorComponent } from '../_reusables/SiteSelectorComponent';
import { Tooltip } from 'primeng/tooltip';


@Component({
    selector: 'site-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, Toolbar, OrderDetailComponent, TranslatePipe, Tooltip],
    template: `
        <p-toolbar class="mb-6" *ngIf="config?.data?.mode !== 'lookup'">
            <ng-template #start>
                <p-button [label]="'New' | translate" icon="pi pi-plus" severity="primary" class="mr-2" (onClick)="detailService.openCreateDialog()"></p-button>
                <p-button severity="warn" [label]="'Delete' | translate" icon="pi pi-trash" outlined [disabled]="!selectedItem" />
                <p-button (onClick)="this.openSyncDialog()" [pTooltip]="'Prefered_to_use_when_db_is_empty' | translate" class="ml-5" severity="info" [label]="'Synchronize' | translate" icon="pi pi-sync" outlined></p-button>
            </ng-template>
        </p-toolbar>

        <p-table
            [value]="listService.items()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [paginator]="true"
            [rows]="10"
            [totalRecords]="listService.totalRecords()"
            [loading]="listService.loading()"
            [rowsPerPageOptions]="[10, 20, 50]"
            [tableStyle]="{ 'min-width': '50rem' }"
            [(selection)]="selectedItem"
            [rowHover]="true"
            dataKey="id"
            stripedRows
        >
            <ng-template pTemplate="header">
                <tr>
                    <th>
                        <p-tableHeaderCheckbox />
                    </th>
                    <th>{{'Created' | translate}}</th>
                    <th>{{'Last_Updated' | translate}}</th>
                    <th>{{ 'Id' | translate }}</th>
                    <th>{{ 'Wp_order_id' | translate }}</th>
<!--                    <th>{{ 'Currency' | translate }}</th>-->
<!--                    <th>{{ 'Currency_symbol' | translate }}</th>-->
                    <th>{{ 'Customer' | translate }}</th>
                    <th>{{ 'Customer_agent' | translate }}</th>
                    <th>{{ 'Customer_ip' | translate }}</th>
                    <th>{{ 'Payment_method' | translate }}</th>
                    <th>{{ 'Status' | translate }}</th>
                    <th>{{ 'Total_price' | translate }}</th>





                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item >
                @let order = asCast(item);
                <tr [ngClass]="{ 'cursor-pointer hover:bg-blue-50': this.config?.data?.mode === 'lookup' }">
                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="item"></p-tableCheckbox>
                    </td>

                    <th>{{order.createTime | date: 'dd.MM.yyyy HH:mm'}}</th>
                    <th>{{order.updateTime | date: 'dd.MM.yyyy HH:mm'}}</th>
                    <td>{{ order.id }}</td>
                    <td>{{ order.wpOrderId }}</td>
<!--                    <td>{{ order.currency }}</td>-->
<!--                    <td>{{ order.currencySymbol }}</td>-->
                    <td>{{order.customer.firstName}} {{order.customer.lastName}}</td>
                    <td [pTooltip]="order.customerAgent">{{ order.customerAgent.slice(0, 50) }}</td>
                    <td [pTooltip]="order.customerIp">{{ order.customerIp.slice(0, 10) }}</td>
                    <td>
                        <i class="pi pi-credit-card mr-2 text-color-secondary"></i>
                        {{ getPaymentLabel(order.paymentMethod) | translate}}
                    </td>
                    <td>
                        <p-tag [severity]="getStatusSeverity(order.status)"
                               [value]="getStatusLabel(order.status) | translate"
                               [rounded]="true">
                        </p-tag>
                    </td>
                    <td>
                        <p-tag severity="success" value="{{ order.totalPrice }} {{order.currency}}" />
                    </td>

                    <td>
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" (onClick)="detailService.openEditDialog(item)"></p-button>
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="onDelete(item.id)"></p-button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <site-detail *ngIf="config?.data?.mode !== 'lookup'"></site-detail>
    `
})
export class OrderListComponent {
    public listService = inject(OrderListService);
    public detailService = inject(OrderDetailService);
    private tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });

    selectedItem!: IOrder[] | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }

    onDelete(id: any) {
        if (confirm(this.tr.instant('Are_you_sure?'))) {
            this.listService.deleteItem(id);
        }
    }

    constructor() {
        // this.syncCategories(1);
    }

    protected http = inject(HttpClient);

    private dialogService = inject(DialogService);
    openSyncDialog() {
        const ref = this.dialogService.open(SiteSelectorComponent, {
            header: this.tr.instant('Choose'),
            width: '450px',
            data: { label: 'Sync_From_Which_Site' }
        });
        ref?.onClose.subscribe((siteId: number) => {
            if (siteId) {
                // alert(siteId);
                this.listService.syncBrands(siteId);
            }
        });
    }

    protected asCast(item: any): IOrder {
        return item as IOrder;
    }

    protected paymentLabels = PaymentMethodLabels;
    public getPaymentLabel(method: any): string {
        // Кастваме към PaymentMethod, за да спрем грешката
        const key = method as PaymentMethod;
        return PaymentMethodLabels[key] || 'Неизвестен метод';
    }

    // В list.component.ts
    protected statusLabels = OrderStatusLabels;
    getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        switch (status) {
            case OrderStatus.SENT:
                return 'contrast';
            case OrderStatus.COMPLETED:
                return 'success';
            case OrderStatus.PROCESSING: return 'info';
            case OrderStatus.PENDING:
            case OrderStatus.ON_HOLD: return 'warn';
            case OrderStatus.CANCELLED:
            case OrderStatus.ABANDONED:
            case OrderStatus.FAILED: return 'danger';
            case OrderStatus.REFUNDED: return 'secondary';
            default: return 'secondary';
        }
    }
    public getStatusLabel(status: any): string {
        // Проверяваме дали статусът съществува в нашия Enum
        const key = status as OrderStatus;
        return this.statusLabels[key] || 'STATUS.UNKNOWN';
    }

}
