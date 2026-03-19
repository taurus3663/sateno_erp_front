import { ChangeDetectorRef, Component, computed, inject, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { OrderDetailService } from './detail.service';
import { CurrencyListService } from '../currency/list.service';
import { LanguageListService } from '../language/list.service';
import { Tooltip } from 'primeng/tooltip';
import { Avatar } from 'primeng/avatar';
import { IOrderLineItem, OrderStatus, OrderStatusLabels, PaymentMethod, PaymentMethodLabels } from './interfaces';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { ProductSelectorComponent } from '../_reusables/ProductSelectorComponent';
import { DialogService } from 'primeng/dynamicdialog';
import { WpProductListComponent } from '../wp_product/list';
import { XL_AUTH_CONFIG } from 'xl-auth';
import { Image } from 'primeng/image';

@Component({
    selector: 'site-detail',
    standalone: true,
    imports: [Dialog, Button, FormsModule, CommonModule, TranslatePipe, Tooltip, Avatar, Select, Tag, InputText, Textarea, ButtonDirective, InputNumber, Image],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ width: '100%', height: '100vh' }">
            <!--                        [header]="detailService.selectedItem()?.id ? 'Редакция на потребител #' + detailService.selectedItem()?.id : 'Нов потребител'"
-->
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <!--                        {{ detailService.selectedItem()?.id ? 'Редакция на клиент #' + detailService.selectedItem()?.id : 'Нов клиент' }}-->
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Order' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Order' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div class="p-2" *ngIf="detailService.selectedItem() as item">
                    <div class="grid grid-cols-12 gap-6">
                        <!--                        LEFT-->
                        <div class="col-span-12 md:col-span-12 pl-4 border-left-1 surface-border">
                            <h5 class="text-900 font-bold mb-4 flex align-items-center gap-2">
                                <!--                                <i class="pi pi-user text-primary"></i>-->
                                {{ 'Customer_Details' | translate }} | {{ 'New_order' | translate }}
                            </h5>

                            <div class="grid grid-cols-1 gap-3">
                                <div class="p-3 border-round surface-100 flex align-items-center gap-3">
                                    <p-avatar icon="pi pi-user" size="large" shape="circle" class="bg-primary-reverse text-primary"></p-avatar>
                                    <div class="grid grid-cols-2 gap-2 w-full">
                                        <div class="flex flex-column">
                                            <span class="text-secondary text-xs font-bold uppercase">{{ 'first_name' | translate }}</span>
                                            <input pInputText [(ngModel)]="item.billing.first_name" class="w-full p-inputtext-sm font-bold" />
                                        </div>
                                        <div class="flex flex-column">
                                            <span class="text-secondary text-xs font-bold uppercase">{{ 'last_name' | translate }}</span>
                                            <input pInputText [(ngModel)]="item.billing.last_name" class="w-full p-inputtext-sm font-bold" />
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-2">
                                    <div class="p-3 border-round surface-100 flex flex-column gap-1">
                                        <span class="text-secondary text-xs font-bold uppercase">{{ 'Phone' | translate }}</span>
                                        <div class="p-inputgroup">
                                            <span class="p-inputgroup-addon"><i class="pi pi-phone"></i></span>
                                            <input pInputText [(ngModel)]="item.billing.phone" class="w-full p-inputtext-sm font-bold text-blue-600" />
                                        </div>
                                    </div>
                                    <div class="p-3 border-round surface-100 flex flex-column gap-1">
                                        <span class="text-secondary text-xs font-bold uppercase">{{ 'Email' | translate }}</span>
                                        <div class="p-inputgroup">
                                            <span class="p-inputgroup-addon"><i class="pi pi-envelope"></i></span>
                                            <input pInputText [(ngModel)]="item.billing.email" class="w-full p-inputtext-sm font-medium" />
                                        </div>
                                    </div>
                                </div>

                                <div class="p-3 border-round bg-orange-50 border-left-3 border-orange-500 flex flex-column gap-2">
                                    <div class="flex align-items-center gap-2">
                                        <i class="pi pi-map-marker text-orange-600 font-bold"></i>
                                        <span class="text-orange-700 font-bold">{{ 'Shipping_Address' | translate }}</span>
                                    </div>
                                    <div class="text-900 line-height-3 font-medium bg-white-alpha-50 p-2 border-round">
                                        {{ item?.billing?.address_1 }}
                                    </div>
                                </div>

                                <div class="flex gap-2">
                                    <div class="surface-100 p-2 px-3 border-round text-sm">
                                        <span class="text-secondary mr-2">{{ 'City' | translate }}:</span>
                                        <span class="font-bold">{{ item?.billing?.city }}</span>
                                    </div>
                                    <div class="surface-100 p-2 px-3 border-round text-sm">
                                        <span class="text-secondary mr-2">{{ 'Postcode' | translate }}:</span>
                                        <span class="font-bold">{{ item?.billing?.postcode }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-column col-span-12 md:col-span-6 pl-4 border-left-1 surface-border">
                            <span class="text-secondary text-xs font-bold uppercase">{{ 'Payment_method' | translate }}</span>
                            <input pInputText [value]="getPaymentLabel(item.paymentMethod) | translate" readonly class="w-full bg-gray-50 border-none font-bold" />
                        </div>

                        <div class="col-span-12 md:col-span-6 pl-4 border-left-1 surface-border">
                            <label class="block font-bold mb-2">{{ 'Status' | translate }} ({{ 'Order' | translate }})</label>
                            <p-select [options]="orderStatus" [(ngModel)]="item.status" optionLabel="label" optionValue="value" class="w-full mt-1 custom-status-select" appendTo="body">
                                <ng-template #selectedItem let-selectedOption>
                                    <div class="flex align-items-center" *ngIf="selectedOption">
                                        <p-tag [value]="selectedOption.label" [rounded]="true" [style]="{ background: getStatusColor(selectedOption.value), color: '#ffffff' }"> </p-tag>
                                    </div>
                                </ng-template>

                                <ng-template #item let-option>
                                    <div class="flex align-items-center">
                                        <p-tag [value]="option.label" [rounded]="true" [style]="{ background: getStatusColor(option.value), color: '#ffffff' }"> </p-tag>
                                    </div>
                                </ng-template>
                            </p-select>
                        </div>

                        <!--                        <div class="col-span-12 md:col-span-4 pl-4 border-left-1 surface-border">-->
                        <!--                            <span class="text-secondary text-xs font-bold uppercase">{{ 'Last_Updated' | translate }}</span>-->
                        <!--                            <div class="p-inputgroup mt-1">-->
                        <!--                                <span class="p-inputgroup-addon"><i class="pi pi-clock"></i></span>-->
                        <!--                                <input pInputText [value]="item.updateTime | date: 'dd.MM.yyyy HH:mm'" readonly class="w-full bg-gray-50 border-none font-bold" />-->
                        <!--                            </div>-->
                        <!--                        </div>-->

                        <!--                        <div class="grid grid-cols-12 gap-3 col-span-12 mt-3">-->
                        <!--                            <div class="col-span-12 md:col-span-6 pl-4 border-left-1 surface-border">-->
                        <!--                                <span class="text-secondary text-xs font-bold uppercase">{{ 'Customer_ip' | translate }}</span>-->
                        <!--                                <div class="p-inputgroup mt-1">-->
                        <!--                                    <span class="p-inputgroup-addon"><i class="pi pi-desktop"></i></span>-->
                        <!--                                    <input pInputText [value]="item.customerIp" readonly class="w-full bg-gray-50 border-none font-bold" />-->
                        <!--                                </div>-->
                        <!--                            </div>-->

                        <!--                            <div class="col-span-12 md:col-span-6 pl-4 border-left-1 surface-border">-->
                        <!--                                <span class="text-secondary text-xs font-bold uppercase">{{ 'Customer_agent' | translate }}</span>-->
                        <!--                                <div class="p-inputgroup mt-1">-->
                        <!--                                    <span class="p-inputgroup-addon"><i class="pi pi-info-circle"></i></span>-->
                        <!--                                    <input pInputText [value]="item.customerAgent" [pTooltip]="item.customerAgent" readonly class="w-full bg-gray-50 border-none font-medium text-sm" />-->
                        <!--                                </div>-->
                        <!--                            </div>-->
                        <!--                        </div>-->

                        <div class="col-span-12 mt-4">
                            <span class="text-secondary text-xs font-bold uppercase block mb-2"> <i class="pi pi-comment mr-1"></i> {{ 'Order_Comments' | translate }} </span>
                            <textarea
                                rows="3"
                                pTextarea
                                [(ngModel)]="item.comment"
                                [placeholder]="'Comment' | translate"
                                class="w-full p-3 border-round border-1 surface-border surface-50 font-medium text-900 focus:border-primary"
                                style="resize: none;"
                            >
                            </textarea>
                        </div>

                        <div class="col-span-12 mt-4">
                            <h5 class="text-900 font-bold mb-3 border-bottom-1 pb-2">{{ 'Order_Items' | translate }}</h5>

                            <div class="border-round border-1 surface-border overflow-hidden">
                                <table class="w-full text-left border-collapse">
                                    <thead class="surface-100">
                                        <tr>
                                            <th class="p-3 text-sm font-bold text-center" style="width: 50px;"></th>
                                            <th class="p-3 text-sm font-bold">{{ 'Product' | translate }}</th>
                                            <th class="p-3 text-sm font-bold text-center" style="width: 160px;">{{ 'Qty' | translate }}</th>
                                            <th class="p-3 text-sm font-bold text-right">{{ 'Price' | translate }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr *ngFor="let line of item.orderLine; let i = index" class="border-top-1 surface-border">
                                            <td class="p-3 text-center border-right-1 surface-border">
                                                <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-rounded" (click)="removeLine(i)" [pTooltip]="'Delete' | translate"></button>
                                            </td>

                                            <td class="p-3">
                                                <div class="flex align-items-start gap-3">
                                                    <div class="flex-shrink-0">
                                                        <div class="border-round overflow-hidden border-1 surface-border shadow-1 bg-gray-50 flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                                                <p-image [src]="line.image.src" [alt]="line.productName" [preview]="true" class="w-full h-full object-cover cursor-zoom-in" />
                                                            <i *ngIf="!line?.image?.src" class="pi pi-image text-400 text-2xl"></i>
                                                        </div>
                                                    </div>

                                                    <div class="flex-grow-1">
                                                        <div class="font-bold text-900 line-height-3">
                                                            {{ line.productName }} |
                                                            <span class="text-secondary font-normal">{{ 'Base' | translate }}:</span>
                                                            <span class="text-amber-700 bg-green-50 px-2 border-round border-1 border-green-200 ml-1"> {{ getBasePrice(line) | number: '1.2-2' }} {{ item.currency }} </span>
                                                        </div>

                                                        <div class="text-xs text-secondary mt-1 font-medium uppercase tracking-wider">SKU: {{ line.sku }}</div>

                                                        <div *ngIf="line.paoIdValue && line.paoIdValue.length > 0" class="mt-2">
                                                            <div *ngFor="let group of line.paoIdValue">
                                                                <div *ngFor="let v of group.value" class="text-sm italic text-orange-600 flex align-items-center flex-wrap gap-1 mb-1">
                                                                    <span class="text-700">• {{ v.key }}:</span>
                                                                    <span class="font-bold text-orange-900 bg-orange-100 px-2 py-0 border-round shadow-sm">
                                                                        {{ v.value }}
                                                                    </span>
                                                                    <span *ngIf="v.rawPrice && v.rawPrice !== '0'" class="ml-1 font-bold text-green-600 bg-green-50 px-2 border-round border-1 border-green-200 text-xs">
                                                                        +{{ v.rawPrice | number: '1.2-2' }} {{ item.currency }}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td class="p-3 text-center">
                                                <div class="flex align-items-center justify-content-center no-wrap">
                                                    <button
                                                        type="button"
                                                        pButton
                                                        icon="pi pi-minus"
                                                        class="p-button-secondary p-button-outlined p-button-sm border-round-left"
                                                        style="width: 32px; height: 32px; border-right: none;"
                                                        (click)="changeQty(line, -1)"
                                                    ></button>
                                                    <input
                                                        type="text"
                                                        [(ngModel)]="line.quantity"
                                                        (ngModelChange)="onQuantityChange(line)"
                                                        class="text-center font-bold border-1 surface-border appearance-none"
                                                        style="width: 40px; height: 32px; outline: none; border-top: 1px solid #ced4da; border-bottom: 1px solid #ced4da;"
                                                        readonly
                                                    />
                                                    <button
                                                        type="button"
                                                        pButton
                                                        icon="pi pi-plus"
                                                        class="p-button-secondary p-button-outlined p-button-sm border-round-right"
                                                        style="width: 32px; height: 32px; border-left: none;"
                                                        (click)="changeQty(line, 1)"
                                                    ></button>
                                                </div>
                                            </td>

                                            <td class="p-3 text-right font-medium text-900">{{ line.totalPrice | number: '1.2-2' }} {{ item.currency }}</td>
                                        </tr>
                                    </tbody>

                                    <tfoot class="bg-gray-50">
                                        <tr class="border-top-1 surface-border">
                                            <td colspan="3" class="p-3 text-right font-medium text-secondary"><i class="pi pi-box mr-1"></i> {{ 'Total_Weight' | translate }}:</td>
                                            <td class="p-3 text-right text-900 font-bold">{{ totalWeight() | number: '1.2-2' }} кг</td>
                                        </tr>
                                        <tr class="border-top-1 surface-border">
                                            <td colspan="3" class="p- text-right font-medium text-secondary"><i class="pi pi-truck mr-1 text-xs"></i> {{ 'Shipping' | translate }}:</td>

                                            <td class="p-3 text-right">
                                                <span class="text-900 font-bold">[10.00 {{ item.currency }}]</span>
                                                <p-tag value="БЕЗПЛАТНА" severity="success" [rounded]="true" class="font-bold mr-2"></p-tag>
                                                <p-inputNumber
                                                    mode="decimal"
                                                    [minFractionDigits]="2"
                                                    [maxFractionDigits]="2"
                                                    [min]="0"
                                                    [inputSize]="5"
                                                    inputStyleClass="w-3rem text-right p-inputtext-sm font-bold surface-100 border-round"
                                                    placeholder="0.00"
                                                >
                                                </p-inputNumber>
                                                <span class="text-900 font-bold"> {{ item.currency }}</span>
                                            </td>
                                        </tr>
                                        <tr class="border-top-1 surface-border">
                                            <td colspan="3" class="p-3 text-right font-bold text-xl text-900">{{ 'Total' | translate }}:</td>
                                            <td class="p-3 text-right font-bold text-xl text-primary">{{ grandTotal() | number: '1.2-2' }} {{ item.currency }}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div class="col-span-12 mt-5" *ngIf="groupedOtherOrders().length">
                                <h5 class="text-orange-600 font-bold mb-4 flex align-items-center gap-2 border-bottom-1 pb-2">
                                    <i class="pi pi-clone"></i>
                                    {{ 'Pending_Duplicates' | translate }}
                                </h5>

                                <div *ngFor="let group of groupedOtherOrders()" class="mb-6">
                                    <div class="flex justify-content-between align-items-center mb-2 px-2">
                                        <span class="text-900 font-bold">
                                            <i class="pi pi-shopping-cart text-orange-500 mr-2"></i>
                                            {{ 'Order' | translate }} #{{ group.wpOrderId }}
                                        </span>
                                        <button
                                            type="button"
                                            class="p-button p-button-success p-button-sm p-component p-button-raised flex align-items-center gap-2 ml-10"
                                            style="padding: 0.5rem 1rem; width: auto;"
                                            (click)="mergeOrderIntoCurrent(group.orderId); $event.stopPropagation()"
                                        >
                                            <i class="pi pi-plus text-sm"></i>
                                            <span class="font-bold text-sm">Добави към текущата</span>
                                        </button>
                                    </div>

                                    <div class="border-round border-1 border-orange-200 overflow-hidden">
                                        <table class="w-full text-left border-collapse">
                                            <thead class="bg-orange-50">
                                                <tr>
                                                    <th class="p-3 text-sm font-bold">{{ 'Product' | translate }}</th>
                                                    <th class="p-3 text-sm font-bold text-center">{{ 'Qty' | translate }}</th>
                                                    <th class="p-3 text-sm font-bold text-right">{{ 'Price' | translate }}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr *ngFor="let line of group.items" class="border-top-1 border-orange-100">
                                                    <td class="p-3">
                                                        <div class="flex align-items-start gap-3">
                                                            <div class="flex-shrink-0">
                                                                <div class="border-round overflow-hidden border-1 surface-border shadow-1 bg-gray-50 flex align-items-center justify-content-center" style="width: 90px; height: auto;">
                                                                    <a *ngIf="line.image?.src" [href]="line.image.src" target="_blank">
                                                                        <img [src]="line.image.src" class="w-full h-full object-cover" />
                                                                    </a>
                                                                    <i *ngIf="!line.image?.src" class="pi pi-image text-400 text-2xl"></i>
                                                                </div>
                                                            </div>

                                                            <div class="flex-grow-1">
                                                                <div class="font-bold text-900 line-height-3">{{ line.productName }}</div>
                                                                <div class="text-xs text-secondary mt-1 uppercase">SKU: {{ line.sku }}</div>

                                                                <div *ngFor="let meta of line.paoIdValue" class="mt-2">
                                                                    <div *ngFor="let v of meta.value" class="text-xs italic text-orange-600">
                                                                        • {{ v.key }}: <span class="font-bold text-orange-900">{{ v.value }}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <!--                                                    <td class="p-3 text-center align-top">{{ line.quantity }}</td>-->
                                                    <td class="p-3 text-center" style="width: 150px;">
                                                        <div class="flex align-items-center justify-content-center">
                                                            <button
                                                                type="button"
                                                                pButton
                                                                icon="pi pi-minus"
                                                                class="p-button-secondary p-button-outlined p-button-sm border-round-left"
                                                                style="width: 35px; height: 35px; border-right: none;"
                                                                (click)="changeQty(line, -1)"
                                                            ></button>

                                                            <input
                                                                type="text"
                                                                [(ngModel)]="line.quantity"
                                                                (ngModelChange)="onQuantityChange(line)"
                                                                class="text-center font-bold border-1 surface-border appearance-none"
                                                                style="width: 45px; height: 35px; outline: none; border-left: 1px solid #ced4da; border-right: 1px solid #ced4da;"
                                                                readonly
                                                            />

                                                            <button
                                                                type="button"
                                                                pButton
                                                                icon="pi pi-plus"
                                                                class="p-button-secondary p-button-outlined p-button-sm border-round-right"
                                                                style="width: 35px; height: 35px; border-left: none;"
                                                                (click)="changeQty(line, 1)"
                                                            ></button>
                                                        </div>
                                                    </td>
                                                    <td class="p-3 text-right font-medium text-900 align-top">{{ line.totalPrice | number: '1.2-2' }} {{ item.currency }}</td>
                                                </tr>
                                            </tbody>
                                            <tfoot class="bg-orange-50/50">
                                                <tr>
                                                    <td colspan="2" class="p-2 text-right font-bold text-sm text-secondary">{{ 'Total' | translate }}:</td>
                                                    <td class="p-2 text-right font-bold text-orange-700">{{ getSubtotal(group.items) | number: '1.2-2' }} {{ item.currency }}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <p-button (onClick)="this.openProductSelector()" [label]="'Add_Product' | translate" icon="pi pi-plus" severity="success" [text]="true" size="small"> </p-button>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <span *ngIf="detailService.selectedItem()?.ordersToMerge?.length" class="mr-3 text-green-600 font-bold"> <i class="pi pi-info-circle"></i> Ще бъдат обединени {{ detailService.selectedItem()?.ordersToMerge?.length }} поръчки </span>
                <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
            </ng-template>
        </p-dialog>
    `
})
export class OrderDetailComponent {
    activeTab: any = 0;
    protected detailService = inject(OrderDetailService);
    protected currencyService = inject(CurrencyListService);
    protected languageService = inject(LanguageListService);
    private tr = inject(TranslateService);
    private cdr = inject(ChangeDetectorRef);

    private authConfig = inject(XL_AUTH_CONFIG);
    protected readonly baseUrl = this.authConfig.apiUrl;
    // 1. ДОБАВЯМЕ САМО ТОВА: Малък тригер за сигналите
    private refreshTrigger = signal(0);

    constructor() {
        this.generateStatusOptions();
        this.tr.onLangChange.subscribe(() => {
            this.generateStatusOptions();
        });
    }

    getBasePrice(line: any): number {
        let addonsTotal = 0;
        if (line.paoIdValue) {
            line.paoIdValue.forEach((meta: any) => {
                if (meta.value) {
                    meta.value.forEach((v: any) => {
                        addonsTotal += parseFloat(v.rawPrice || 0);
                    });
                }
            });
        }
        return line.price - addonsTotal;
    }

    public getPaymentLabel(method: any): string {
        const key = method as PaymentMethod;
        return PaymentMethodLabels[key] || 'Неизвестен метод';
    }

    protected statusLabels = OrderStatusLabels;
    getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        switch (status) {
            case OrderStatus.SENT:
                return 'contrast';
            case OrderStatus.COMPLETED:
                return 'success';
            case OrderStatus.PROCESSING:
                return 'info';
            case OrderStatus.CANCELLED:
            case OrderStatus.ABANDONED:
                return 'danger';
            default:
                return 'secondary';
        }
    }

    private readonly statusColorMap: Record<string, string> = {
        [OrderStatus.PROCESSING]: '#808080',
        [OrderStatus.ABANDONED]: '#94a3b8',
        [OrderStatus.SENT]: '#e67e22',
        [OrderStatus.COMPLETED]: '#3a9d00',
        [OrderStatus.CANCELLED]: '#000000',
        [OrderStatus.APPROVED]: '#3a9d00',
        [OrderStatus.JOINT]: '#e6ef61',
        [OrderStatus.FAILED]: '#ff0000'
    };

    public getStatusColor(status: string): string {
        return this.statusColorMap[status] || '#94A3B8';
    }

    protected orderStatus: any[] = [];
    private generateStatusOptions() {
        this.orderStatus = Object.keys(OrderStatus)
            .filter((key) => isNaN(Number(key)))
            .filter((key) => key !== 'JOINT')
            .map((key) => ({
                label: this.tr.instant(`STATUS.${key}`),
                value: OrderStatus[key as keyof typeof OrderStatus]
            }));
    }

    readonly groupedOtherOrders = computed(() => {
        const lines = this.detailService.selectedItem()?.orderLineOtherOrders || [];
        if (lines.length === 0) return [];

        const groups = lines.reduce(
            (acc, obj) => {
                const key = obj.orderId;
                if (!acc[key]) acc[key] = [];
                acc[key].push(obj);
                return acc;
            },
            {} as Record<string, any[]>
        );

        return Object.keys(groups).map((id) => {
            const items = groups[id];
            return {
                orderId: id,
                wpOrderId: items[0]?.wpOrderId,
                items: items
            };
        });
    });

    public getSubtotal(items: any[]): number {
        return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    }

    public mergeOrderIntoCurrent(sourceOrderId: any) {
        let parseInt = Number.isInteger(sourceOrderId) ? sourceOrderId : Number.parseInt(sourceOrderId);
        const currentOrder = this.detailService.selectedItem();
        if (!currentOrder) return;

        if (!currentOrder.ordersToMerge) {
            currentOrder.ordersToMerge = [];
        }

        if (!currentOrder.ordersToMerge.includes(parseInt)) {
            currentOrder.ordersToMerge.push(parseInt);
        }

        currentOrder.orderLineOtherOrders = currentOrder.orderLineOtherOrders.filter((line) => line.orderId !== parseInt);
        this.refreshTrigger.update((v) => v + 1); // Обновяваме тригера
    }

    private dialogService = inject(DialogService);
    openProductSelector() {
        const ref = this.dialogService.open(WpProductListComponent, {
            header: this.tr.instant('Product'),
            width: '',
            closeOnEscape: true,
            closable: true,
            data: { siteId: this.detailService.selectedItem()?.site?.id, mode: 'lookup' }
        });

        ref?.onClose.subscribe((product: any) => {
            this.openAddonConfigurator(product);
            if (product) {
                this.addProductToOrder(product);
            }
        });
    }

    // НОВ МЕТОД ЗА КОНФИГУРАЦИЯ
    private openAddonConfigurator(product: any) {



        // const ref = this.dialogService.open(ProductSelectorComponent, {
        //     header: this.tr.instant('Configure_Product') + ': ' + product.name,
        //     width: '500px',
        //     data: { product: product }
        // });

        // ref?.onClose.subscribe((configuredProduct: any) => {
        //     if (configuredProduct) {
        //         Тук configuredProduct трябва да съдържа избраните паоIdValue
                // this.addProductToOrder(configuredProduct);
            // }
        // });
    }

    // 2. ОБНОВЯВАМЕ ТУК: Добавяме refreshTrigger() вътре
    readonly totalWeight = computed(() => {
        this.refreshTrigger(); // Важно: кара сигнала да се преизчисли
        const lines = this.detailService.selectedItem()?.orderLine || [];
        return lines.reduce((sum, line) => sum + parseFloat(line.weight || '0') * (line.quantity || 1), 0);
    });

    // 3. ОБНОВЯВАМЕ ТУК: Добавяме refreshTrigger() вътре
    readonly grandTotal = computed(() => {
        this.refreshTrigger(); // Важно: кара сигнала да се преизчисли
        const lines = this.detailService.selectedItem()?.orderLine || [];
        const subtotal = lines.reduce((sum, line) => sum + (line.totalPrice || 0), 0);
        const shipping = 5.0;
        return subtotal + shipping;
    });

    private addProductToOrder(product: any) {
        const item = this.detailService.selectedItem();
        if (!item) return;

        let price = product.siteConfig[0].price;
        //                                 <p-image *ngIf="item.m_image" [src]="this.baseUrl + item.m_image" [alt]="item.names" width="85" [preview]="true" imageClass="border-circle shadow-1" (onImageError)="item.m_image = null"></p-image>
        const newLine: IOrderLineItem = {
            productName: product.name || product.productName,
            sku: product.sku,
            quantity: 1,
            price: parseFloat(price),
            totalPrice: parseFloat(price),
            weight: product.weight || '0.5',
            image: {
                src: this.baseUrl + product.m_image,
                id: product.image?.id || 0
            },
            orderId: item.wpOrderId,
            dimensions: { length: '', width: '', height: '' },
            paoIdValue: [],
            productId: product.id,
            wpOrderId: item.wpOrderId
        };

        setTimeout(() => {
            item.orderLine = [...(item.orderLine || []), newLine];
            this.refreshTrigger.update((v) => v + 1); // БУТАМЕ ТРИГЕРА
            this.updateGrandTotal();
            this.cdr.detectChanges();
        });
    }

    changeQty(line: any, delta: number) {
        let currentQty = parseInt(line.quantity) || 1;
        let newQty = currentQty + delta;

        if (newQty >= 1) {
            line.quantity = newQty;
            this.onQuantityChange(line);
        }
    }

    onQuantityChange(line: any) {
        const item = this.detailService.selectedItem();
        if (!item) return;

        const unitPrice = parseFloat(line.price) || 0;
        const qty = parseInt(line.quantity) || 1;
        line.totalPrice = unitPrice * qty;

        item.orderLine = [...item.orderLine];
        this.refreshTrigger.update((v) => v + 1); // БУТАМЕ ТРИГЕРА
        this.updateGrandTotal();
    }

    updateGrandTotal() {
        const item = this.detailService.selectedItem();
        if (!item) return;

        const productsSubtotal = item.orderLine.reduce((sum: number, l: any) => sum + (l.totalPrice || 0), 0);
        const shipping = 5.0;
        item.totalPrice = productsSubtotal + shipping;

        this.refreshTrigger.update((v) => v + 1); // БУТАМЕ ТРИГЕРА
        this.cdr.detectChanges();
    }

    removeLine(index: number) {
        const confirmDelete = confirm(this.tr.instant('Are_you_sure?'));
        if (confirmDelete) {
            const item = this.detailService.selectedItem();
            if (item) {
                const updatedLines = [...item.orderLine];
                updatedLines.splice(index, 1);
                item.orderLine = updatedLines;

                this.refreshTrigger.update((v) => v + 1); // БУТАМЕ ТРИГЕРА
                this.updateGrandTotal();
                this.cdr.detectChanges();
            }
        }
    }
}
