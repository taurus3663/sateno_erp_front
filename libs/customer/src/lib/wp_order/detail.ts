import { ChangeDetectorRef, Component, computed, effect, inject, signal } from '@angular/core';
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
import { IOrder, IOrderLineItem, OrderStatus, OrderStatusLabels, PaymentMethod, PaymentMethodLabels } from './interfaces';
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
import { IWpProduct, IWpProductAddonConfig } from '../wp_product/interfaces';
import { ROUTES } from '../api.routes';
import { ProductAddonSelectComponent } from '../_reusables/ProductAddonSelectComponent';
import { lastValueFrom } from 'rxjs';
import { SiteSelectorComponent } from '../_reusables/SiteSelectorComponent';
import { SiteObjectSelectorComponent } from '../_reusables/SiteObjectSelectorComponent';
import { OrderListService } from './list.service';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { CourierType } from '../courier/interfaces';
import { Popover } from 'primeng/popover';
import { Timeline } from 'primeng/timeline';
import { ShipmentService } from './shipment.service';
import { ISite } from '../site/interfaces';
import { SiteDetailService } from '../site/detail.service';

@Component({
    selector: 'site-detail',
    standalone: true,
    imports: [Dialog, Button, FormsModule, CommonModule, TranslatePipe, Tooltip, Avatar, Select, Tag, InputText, Textarea, ButtonDirective, InputNumber, Image, Popover, Timeline, PrimeTemplate],
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
                                            <input pInputText [(ngModel)]="item.billing.first_name" [disabled]="isReadOnly" class="w-full p-inputtext-sm font-bold" />
                                        </div>
                                        <div class="flex flex-column">
                                            <span class="text-secondary text-xs font-bold uppercase">{{ 'last_name' | translate }}</span>
                                            <input pInputText [(ngModel)]="item.billing.last_name" [disabled]="isReadOnly" class="w-full p-inputtext-sm font-bold" />
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-2">
                                    <div class="p-3 border-round surface-100 flex flex-column gap-1">
                                        <span class="text-secondary text-xs font-bold uppercase">{{ 'Phone' | translate }}</span>
                                        <div class="p-inputgroup">
                                            <span class="p-inputgroup-addon"><i class="pi pi-phone"></i></span>
                                            <input pInputText [(ngModel)]="item.billing.phone" [disabled]="isReadOnly" class="w-full p-inputtext-sm font-bold text-blue-600" />
                                        </div>
                                    </div>
                                    <div class="p-3 border-round surface-100 flex flex-column gap-1">
                                        <span class="text-secondary text-xs font-bold uppercase">{{ 'Email' | translate }}</span>
                                        <div class="p-inputgroup">
                                            <span class="p-inputgroup-addon"><i class="pi pi-envelope"></i></span>
                                            <input pInputText [(ngModel)]="item.billing.email" [disabled]="isReadOnly" class="w-full p-inputtext-sm font-medium" />
                                        </div>
                                    </div>
                                </div>

                                <div class="p-3 border-round flex flex-column gap-2" [ngClass]="item.savedCourierBilling ? 'bg-blue-50 border-left-3 border-blue-500 shadow-1' : 'bg-orange-50 border-left-3 border-orange-500'">
                                    <ng-container *ngIf="item.savedCourierBilling; else originalAddress">
                                        <div class="flex align-items-center justify-content-between mb-1">
                                            <div class="flex align-items-center gap-2">
                                                <i class="pi pi-check-circle text-blue-600 font-bold"></i>
                                                <span class="text-blue-700 font-bold uppercase text-xs">{{ 'Changed_Address' | translate }}</span>
                                            </div>
                                            <p-tag [value]="item.savedCourierBilling.courierType" severity="info" [rounded]="true"></p-tag>
                                        </div>

                                        <div class="text-900 line-height-3 font-bold bg-white-alpha-50 p-2 border-round">
                                            <div *ngIf="item.savedCourierBilling.courierShipmentType !== 'ADDRESS'" class="flex flex-column">
                                                <span class="text-primary text-sm"> <i class="pi pi-building mr-1"></i> {{ $any(item.savedCourierBilling.office)?.name }} </span>
                                                <small class="text-secondary font-normal italic">
                                                    {{ $any(item.savedCourierBilling.office)?.address }}
                                                </small>
                                            </div>

                                            <div *ngIf="item.savedCourierBilling.courierShipmentType === 'ADDRESS'"><i class="pi pi-home mr-1 text-blue-600"></i> {{ item.savedCourierBilling.street }}</div>

                                            <div class="text-xs mt-1 border-top-1 surface-border pt-1 font-medium text-700">
                                                <i class="pi pi-map mr-1"></i>
                                                {{ $any(item.savedCourierBilling.city)?.name }}, {{ $any(item.savedCourierBilling.city)?.postCode }}
                                            </div>
                                        </div>

                                        <div class="flex gap-3 mt-1 px-1">
                                            <p-tag severity="secondary" [value]="item.savedCourierBilling.weight + ' кг'" icon="pi pi-box"></p-tag>
                                            <p-tag severity="secondary" [value]="item.savedCourierBilling.packCount + ' бр.'" icon="pi pi-clone"></p-tag>
                                            <!--                                            <i *ngIf="item.savedCourierBilling.fiscalReceipt" class="pi pi-print text-green-600" pTooltip="Fiscal Receipt Requested"></i>-->
                                        </div>
                                    </ng-container>

                                    <ng-template #originalAddress>
                                        <div class="flex align-items-center gap-2">
                                            <i class="pi pi-map-marker text-orange-600 font-bold"></i>
                                            <span class="text-orange-700 font-bold">{{ 'Shipping_Address' | translate }}</span>
                                        </div>
                                        <div class="text-900 line-height-3 font-medium bg-white-alpha-50 p-2 border-round">
                                            {{ item?.billing?.address_1 }}
                                        </div>
                                    </ng-template>
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
                            <label class="text-secondary text-xs font-bold uppercase mb-2">{{ 'Payment_method' | translate }}</label>
                            <p-select [options]="paymentMethods" [disabled]="isReadOnly" [(ngModel)]="item.paymentMethod" optionLabel="label" optionValue="value" class="w-full mt-1" placeholder="{{ 'Payment_method' | translate }}" appendTo="body">
                                <ng-template #selectedItem let-selectedOption>
                                    <div class="flex align-items-center gap-2" *ngIf="selectedOption">
                                        <i class="pi pi-credit-card text-primary"></i>
                                        <span class="font-bold">{{ selectedOption.label | translate }}</span>
                                    </div>
                                </ng-template>

                                <ng-template #item let-option>
                                    <div class="flex align-items-center gap-2">
                                        <i class="pi pi-credit-card text-400"></i>
                                        <span>{{ option.label | translate }}</span>
                                    </div>
                                </ng-template>
                            </p-select>
                        </div>

                        <div class="col-span-12 md:col-span-6 pl-4 border-left-1 surface-border">
                            <label class="block font-bold mb-2">{{ 'Status' | translate }} ({{ 'Order' | translate }})</label>
                            <p-select [options]="orderStatus()" [(ngModel)]="item.status" optionLabel="label" optionValue="value" class="w-full mt-1 custom-status-select" appendTo="body">
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

                        <div class="mb-4">
                            <div class="flex align-items-center gap-2" *ngIf="selectedSiteName()">
                                <h5 class="text-900 font-bold border-bottom-1 pb-2 flex-grow-1">
                                    {{ 'Site' | translate }}:
                                    <p-tag [value]="selectedSiteName()" severity="info" class="ml-2"></p-tag>
                                </h5>
                                <p-button icon="pi pi-times" [text]="true" [rounded]="true" severity="danger" (onClick)="selectedSiteName.set('')" pTooltip="Clear selection"></p-button>
                            </div>

                            <div *ngIf="!selectedSiteName()" class="flex align-items-center gap-2 border-bottom-1 pb-2">
                                <h5 class="text-900 font-bold m-0">{{ 'Site' | translate }}</h5>
                                <p-button icon="pi pi-search" [text]="true" size="small" (onClick)="openSiteDialog()"> </p-button>
                            </div>
                        </div>

                        <div class="mb-4 flex align-items-center gap-4 p-3  border-round border-1 surface-border">
                            <div class="flex flex-column align-items-center gap-2">
                                <p-button
                                    icon="pi pi-truck"
                                    severity="info"
                                    [rounded]="true"
                                    (onClick)="openShipmentDialog(item)"
                                    [pTooltip]="'Generate_Waybill' | translate"
                                    styleClass="p-button-raised p-button-lg shadow-3"
                                    [style]="{ width: '4.5rem', height: '4.5rem', 'font-size': '1.5rem' }"
                                    [disabled]="!item.id || isReadOnly"
                                >
                                </p-button>

                            </div>

                            <div class="flex flex-column align-items-center gap-2" *ngIf="item.wayBillShipmentNumber">
                                <div class="relative">
                                    <p-button
                                        icon="pi pi-truck"
                                        severity="danger"
                                        [rounded]="true"
                                        (onClick)="onCancelShipment($event, item)"
                                        [pTooltip]="'Cancel_Waybill' | translate"
                                        styleClass="p-button-raised shadow-3"
                                        [style]="{ width: '4.5rem', height: '4.5rem', 'font-size': '1.5rem' }"
                                        [disabled]="isReadOnly"
                                    >
                                    </p-button>
                                </div>
                            </div>

                            <div *ngIf="item.wayBillShipmentNumber" class="flex align-items-center gap-3 border-left-1 surface-border pl-4">
                                <div class="flex flex-column align-items-center gap-2">
                                    <p-button icon="pi pi-file-pdf" severity="secondary" [rounded]="true" [pTooltip]="'Принтирай A6'" (onClick)="handlePrint(item, undefined, 'A6', item.parcelIds)" styleClass="p-button-outlined"> </p-button>
                                    <span class="text-xs font-bold uppercase">A6</span>
                                </div>

                                <div class="flex flex-column align-items-center gap-2">
                                    <p-button icon="pi pi-map" severity="secondary" [rounded]="true" [pTooltip]="'Track' | translate" (onClick)="handleTrack(item)" styleClass="p-button-outlined"> </p-button>
                                    <span class="text-xs font-bold uppercase">{{ 'Track' | translate }}</span>
                                </div>

                                <div class="flex flex-column align-items-center gap-2" *ngIf="item.courierHistory?.length">
                                    <p-button icon="pi pi-history" severity="info" [rounded]="true" [pTooltip]="'History' | translate" (onClick)="opHistoryDetail.toggle($event)" styleClass="p-button-outlined"> </p-button>
                                    <span class="text-xs font-bold uppercase">{{ 'History' | translate }}</span>
                                </div>

                                <p-popover #opHistoryDetail>
                                    <div class="p-3" style="min-width: 300px">
                                        <div class="flex align-items-center gap-2 border-bottom-1 surface-border pb-2 mb-3">
                                            <i class="pi pi-truck text-primary"></i>
                                            <span class="font-bold text-900">Хронология на доставката</span>
                                        </div>

                                        <p-timeline [value]="item.courierHistory" layout="vertical" styleClass="history-timeline">
                                            <ng-template pTemplate="marker" let-event>
                                                <span
                                                    class="border-circle flex align-items-center justify-content-center shadow-1"
                                                    [style.background-color]="getTimelineColor(event.statusDescription)"
                                                    style="width: 12px; height: 12px; border: 2px solid white;"
                                                >
                                                </span>
                                            </ng-template>

                                            <ng-template pTemplate="content" let-event>
                                                <div class="flex flex-column mb-3">
                                                    <span class="text-sm font-bold text-900 line-height-1">{{ event.statusDescription }}</span>
                                                    <small class="text-500 mt-1">
                                                        <i class="pi pi-calendar-plus mr-1" style="font-size: 0.7rem"></i>
                                                        {{ event.eventTime | date: 'dd.MM.yyyy HH:mm' }}
                                                    </small>
                                                </div>
                                            </ng-template>
                                        </p-timeline>
                                    </div>
                                </p-popover>
                            </div>

                            <div *ngIf="!item.id" class="flex align-items-center gap-2 mt-2 p-2 bg-orange-50 border-round border-1 border-orange-200 text-orange-700 w-fit">
                                <i class="pi pi-exclamation-triangle font-bold"></i>
                                <span class="text-xs font-semibold">
            {{ 'You_must_first_save_the_order_so_you_can_generate_a_waybill' | translate }}
        </span>
                            </div>
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

                                            <!--                                            <td class="p-3 text-right font-medium text-900">{{ line.totalPrice | number: '1.2-2' }} {{ item.currency }}</td>-->
                                            <td class="p-3 text-right">
                                                <!--                                                <div class="flex align-items-center justify-content-end gap-2">-->
                                                <p-inputNumber
                                                    [(ngModel)]="line.totalPrice"
                                                    (ngModelChange)="updateGrandTotal()"
                                                    mode="decimal"
                                                    [minFractionDigits]="2"
                                                    [maxFractionDigits]="2"
                                                    [inputSize]="5"
                                                    inputStyleClass="w-5rem text-right p-inputtext-sm font-bold surface-100 border-round text-primary"
                                                ></p-inputNumber>
                                                <span class="text-900 font-medium">{{ item.currency }}</span>
                                                <!--                                                </div>-->
                                            </td>
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
                                                <span class="text-900 font-bold" [class.opacity-50]="isCalculatingShipping()">[{{ realSippingPrice() }} {{ item.currency }}]</span>
                                                <p-tag *ngIf="tP.value === 0" value="БЕЗПЛАТНА" severity="success" [rounded]="true" class="font-bold mr-2"></p-tag>
                                                <p-inputNumber
                                                    #tP
                                                    mode="decimal"
                                                    [minFractionDigits]="2"
                                                    [maxFractionDigits]="2"
                                                    [min]="0"
                                                    [inputSize]="5"
                                                    [disabled]="isCalculatingShipping2()"
                                                    inputStyleClass="w-3rem text-right p-inputtext-sm font-bold surface-100 border-round"
                                                    placeholder="0.00"
                                                    [(ngModel)]="item.customShippingTotal"
                                                    (onInput)="isManualShipping = true"
                                                    (ngModelChange)="updateGrandTotal()"
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

                            <div class="flex align-items-center gap-2 mt-2">
                                <!-- Бутонът се деактивира, ако !item.id -->
                                <p-button
                                    (onClick)="this.openProductSelector()"
                                    [label]="'Add_Product' | translate"
                                    icon="pi pi-plus"
                                    severity="success"
                                    [text]="true"
                                    size="small"
                                    [disabled]="!item.id"
                                > </p-button>

                                <!-- Текстът се показва САМО ако поръчката няма ID (нова поръчка) -->
                                <span *ngIf="!item.id" class="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 border-round border-1 border-orange-200">
        <i class="pi pi-exclamation-triangle mr-1"></i>
                                    {{ 'You_must_first_save_the_order_to_add_products.' | translate }}
    </span>
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
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <span *ngIf="detailService.selectedItem()?.ordersToMerge?.length" class="mr-3 text-green-600 font-bold"> <i class="pi pi-info-circle"></i> Ще бъдат обединени {{ detailService.selectedItem()?.ordersToMerge?.length }} поръчки </span>
                <p-button [label]="'Cancel' | translate" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button [label]="'Save' | translate" icon="pi pi-check" [loading]="detailService.isSaving()"  (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
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
    protected shipmentService = inject(ShipmentService);
    protected siteService = inject(SiteDetailService);

    private authConfig = inject(XL_AUTH_CONFIG);
    protected readonly baseUrl = this.authConfig.apiUrl;
    // 1. ДОБАВЯМЕ САМО ТОВА: Малък тригер за сигналите
    private refreshTrigger = signal(0);
    protected realSippingPrice = signal(0);

    private originalStatus: string | null = null;
    // В OrderDetailComponent
    get isReadOnly(): boolean {
        const item = this.detailService.selectedItem();
        if (!item) return false;
        // Списък със статуси, които позволяват редактиране
        const allowedStatuses = ['processing', 'approved', 'pending'];

        // ВАЖНО: Проверяваме оригиналния статус от базата
        const statusToCheck = this.originalStatus || item.status;

        return !allowedStatuses.includes(statusToCheck);
        // return false;
    }

    protected isManualShipping = false;

    constructor() {
        // this.generateStatusOptions();
        this.generatePaymentMethodOptions();
        // this.tr.onLangChange.subscribe(() => {
        //     this.generateStatusOptions();
        // });

        this.isManualShipping = false;

        effect(() => {
            const item = this.detailService.selectedItem();
            if (item && this.detailService.isVisible()) {
                // Когато поръчката се зареди и диалогът е видим,
                // запазваме статуса й САМО ако originalStatus още не е сетнат
                if (!this.originalStatus) {
                    this.originalStatus = item.status;
                }
            }
            else if (!this.detailService.isVisible()) {
                // Когато затворим диалога, чистим оригиналния статус
                this.originalStatus = null;
            }
        }, { allowSignalWrites: true });

        effect(
            () => {
                const item = this.detailService.selectedItem();
                if(!item) return;

                if(!item.id) {
                    item.status = OrderStatus.PROCESSING;
                    this.siteService.getDefaultSite().subscribe(value => {
                        if(value){
                            this.selectedSiteName.set(value.url);
                            this.detailService.selectedItem()!.site = value;
                        }
                    });

                }

                if (!item.billing) {
                    item.billing = {
                        address_1: '',
                        address_2: '',
                        city: '',
                        company: '',
                        country: '',
                        email: '',
                        first_name: '',
                        last_name: '',
                        phone: '',
                        postcode: '',
                        state: ''
                    };
                }

                if (item?.site) {
                    // Използвай url, name или slug - според това какво искаш да виждаш
                    this.selectedSiteName.set(item.site.url || item.site.name || '');
                } else {
                    this.selectedSiteName.set('');
                }
            },
            { allowSignalWrites: true }
        );

        effect(
            async () => {
                // Регистрираме зависимост към тригера
                this.refreshTrigger();

                const item = this.detailService.selectedItem();
                if (item && item.orderLine && item.orderLine.length > 0) {
                    await this.runShippingCalculation(item);
                    if (!this.isManualShipping) {
                        await this.runCustomShippingCalculation(item);
                    }
                }
            },
            { allowSignalWrites: true }
        );
    }
    private shippingTimeout: any;
    private shippingTimeout2: any;
    protected isCalculatingShipping = signal(false);
    protected isCalculatingShipping2 = signal(false);
    private async runShippingCalculation(item: IOrder) {
        if (this.shippingTimeout) clearTimeout(this.shippingTimeout);

        this.shippingTimeout = setTimeout(async () => {
            try {
                this.isCalculatingShipping.set(true);
                this.cdr.detectChanges();

                // Извикваме сервиза, който съдържа Regex логиката
                const newPrice = await this.detailService.calculateShipping(item);

                if (newPrice !== undefined && newPrice !== null) {
                    // if(item.customShippingTotal === )
                    // item.customShippingTotal = newPrice;
                    this.realSippingPrice.set(newPrice);

                    // Тук не обновяваме refreshTrigger, за да избегнем цикъл!
                    this.cdr.detectChanges();
                }
            } catch (err) {
                console.error('Shipping calculation failed:', err);
            } finally {
                this.isCalculatingShipping.set(false);
                this.cdr.detectChanges();
            }
        }, 600); // Изчакваме 600ms след последната промяна
    }
    private async runCustomShippingCalculation(item: IOrder) {
        if (this.shippingTimeout2) clearTimeout(this.shippingTimeout2);

        this.shippingTimeout2 = setTimeout(async () => {
            try {
                this.isCalculatingShipping2.set(true);
                this.cdr.detectChanges();

                const newPrice = await this.detailService.calculateCustomShippingField(item);

                if (newPrice !== undefined && newPrice !== null) {
                    item.customShippingTotal = newPrice;

                    // Тук не обновяваме refreshTrigger, за да избегнем цикъл!
                    this.cdr.detectChanges();
                }
            } catch (err) {
                console.error('Shipping2 calculation failed:', err);
            } finally {
                this.isCalculatingShipping2.set(false);
                this.cdr.detectChanges();
            }
        }, 600);
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

    // Променяме го на изчисляем сигнал, който следи състоянието на поръчката в реално време
    protected readonly orderStatus = computed(() => {
        const item = this.detailService.selectedItem();
        // Извикваме refreshTrigger, за да сме сигурни, че се преизчислява при всяка промяна на статус
        this.refreshTrigger();

        if (!item) return [];

        // Глобалният списък с всички възможни статуси (без JOINT)
        const allOptions = Object.keys(OrderStatus)
            .filter((key) => isNaN(Number(key)))
            .filter((key) => key !== 'JOINT')
            .map((key) => ({
                label: this.tr.instant(`STATUS.${key}`),
                value: OrderStatus[key as keyof typeof OrderStatus]
            }));

        // === ТУК НАЛАГАМЕ ОГРАНИЧЕНИЕТО ЗА ОТКАЗАНА ПОРЪЧКА ===
        if (item.status === 'cancelled') {
            // Ако е отказана, връщаме само нея самата И опцията за Обработка (processing)
            return allOptions.filter(opt =>
                opt.value === 'processing' || opt.value === 'cancelled'
            );
        }

        // Във всички останали случаи връщаме пълния списък
        return allOptions;
    });
    // private generateStatusOptions() {
    //     this.orderStatus = Object.keys(OrderStatus)
    //         .filter((key) => isNaN(Number(key)))
    //         .filter((key) => key !== 'JOINT')
    //         .map((key) => ({
    //             label: this.tr.instant(`STATUS.${key}`),
    //             value: OrderStatus[key as keyof typeof OrderStatus]
    //         }));
    // }

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
            width: '100%',
            height: '100%',
            closeOnEscape: true,
            closable: true,
            data: { siteId: this.detailService.selectedItem()?.site?.id, mode: 'lookup', rows: 10 }
        });

        ref?.onClose.subscribe(async (product: any) => {
            const fullProduct = await this.detailService.getProduct(product);

            if (fullProduct?.addonConfigs && fullProduct.addonConfigs.length > 0) {
                // Отваряме конфигуратора и чакаме той да върне ИЗБРАНИЯ адон
                this.openAddonConfigurator(fullProduct, (selectedAddon) => {
                    // Когато потребителят потвърди адона, добавяме продукта с него
                    this.addProductToOrder(fullProduct, selectedAddon);
                });
            } else if (fullProduct) {
                // console.log(fullProduct);
                // console.log(product);
                // Ако няма адони, добавяме продукта директно
                this.addProductToOrder(fullProduct);
            }
        });
    }

    // НОВ МЕТОД ЗА КОНФИГУРАЦИЯ
    private openAddonConfigurator(product: any, onConfirm: (addon: any) => void) {
        const ref = this.dialogService.open(ProductAddonSelectComponent, {
            header: product.name,
            width: '500px',
            data: {
                items: product.addonConfigs,
                label: this.tr.instant('Choose') + '    ' + this.tr.instant('Addon')
            }
        });

        ref?.onClose.subscribe((selectedAddon: any) => {
            if (selectedAddon) {
                // Връщаме избрания адон обратно към повикващия метод
                onConfirm(selectedAddon);
            }
        });
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

        let selectedItem = this.detailService.selectedItem();
        const shipping = selectedItem!.customShippingTotal;
        selectedItem!.totalPrice = subtotal + shipping;
        return subtotal + shipping;
    });

    private addProductToOrder(product: any, selectedAddon?: any) {
        const item = this.detailService.selectedItem();
        if (!item) return;

        //  this.selectedSiteName.set(site.url);
        const siteId = this.detailService.selectedItem()!.site.id;
        let bPrice = product.siteConfig.find((c: { site: { id: number } }) => c.site.id === siteId);

        // 1. Първо вземаме базовата цена от конфигурацията на сайта
        // let basePrice = parseFloat(product.siteConfig?.[0]?.price || 0);
        let basePrice = parseFloat(bPrice.regularPrice > 0? bPrice.regularPrice: bPrice.price);
        let finalPrice = basePrice;
        let paoValues: any[] = [];

        // 2. Ако има избран адон, изчисляваме новата цена и пълним структурата
        if (selectedAddon) {
            const addonPrice = parseFloat(selectedAddon.priceModifier || 0);
            finalPrice = basePrice + addonPrice;

            const groupLabel = selectedAddon.label || this.tr.instant('Option');
            const addonValueLabel = this.getTranslationForAddon(selectedAddon);

            // Тук правим точно структурата, която ми показа
            paoValues = [
                {
                    id: Math.floor(Math.random() * 100000),
                    key: '_pao_ids',
                    value: [
                        {
                            id: selectedAddon.id || Math.floor(Math.random() * 1000000000),
                            key: groupLabel,
                            value: addonValueLabel,
                            rawPrice: addonPrice.toString(),
                            rawValue: addonValueLabel,
                            priceType: 'flat_fee'
                        }
                    ]
                }
            ];
        }
        let foundPath = '';
        if (product.images && product.images.length > 0) {
            // Търсим първо основната снимка
            const primaryImg = product.images.find((img: any) => img.isPrimary === true);

            if (primaryImg && primaryImg.localSrc) {
                foundPath = primaryImg.localSrc;
            } else {
                // Ако няма основна, вземаме първата налична
                foundPath = product.images[0]?.localSrc || '';
            }
        }

        let langCode = this.detailService.selectedItem()!.site.language as any;
        const dd = product.translations.find((en: any) => en.language.code === langCode.code);
        // 3. Сглобяваме новия ред (NewLine)
        const newLine: IOrderLineItem = {
            productName: product.name || product.productName || product.names || dd.name,
            sku: product.sku,
            quantity: 1,
            price: finalPrice, // Вече включва адона
            totalPrice: finalPrice, // Цена за 1 бройка
            weight: product.weight || '0.5',
            image: {
                src: foundPath? (this.baseUrl + foundPath): '',
                id: 0
            },
            orderId: item.wpOrderId,
            dimensions: { length: '', width: '', height: '' },
            paoIdValue: paoValues, // Подаваме масива, който сглобихме горе
            productId: product.id,
            wpOrderId: item.wpOrderId
        };

        console.log(newLine);

        // 4. Обновяваме UI-то
        setTimeout(() => {
            item.orderLine = [...(item.orderLine || []), newLine];
            this.refreshTrigger.update((v) => v + 1);
            this.updateGrandTotal();
            this.cdr.detectChanges();
        });
    }

    private getTranslationForAddon(option: any): string {
        if (!option?.addonValue?.translations) return '';

        // Вземаме кода на езика от обекта на сайта (напр. 'bg')
        // Ако по някаква причина липсва, слагаме 'bg' по подразбиране
        const siteLangCode = option.site?.language?.code || 'bg';

        // Търсим превод, който съвпада с езика на сайта
        const translation = option.addonValue.translations.find((t: any) => t.language.code === siteLangCode);

        // Връщаме намерения превод или първия наличен като резервен вариант (fallback)
        return translation ? translation.label : option.addonValue.translations[0]?.label || 'No label';
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

    public selectedSiteName = signal<string>('');
    openSiteDialog(): void {
        const ref = this.dialogService.open(SiteObjectSelectorComponent, {
            header: this.tr.instant('Choose'),
            width: '450px'
        });
        ref?.onClose.subscribe((site: any) => {
            this.selectedSiteName.set(site.url);
            this.detailService.selectedItem()!.site = site;
        });
    }

    protected paymentMethods: any[] = [];

    private generatePaymentMethodOptions() {
        this.paymentMethods = Object.entries(PaymentMethodLabels).map(([value, labelKey]) => ({
            label: this.tr.instant(labelKey),
            value: value
        }));
    }

    public listService = inject(OrderListService);
    openShipmentDialog(order: IOrder) {
        this.listService.openShipmentDialog(order);
        const checkClosed = setInterval(() => {
            // Проверяваме променливата visible в ShipmentService
            if (!this.shipmentService.visible) {

                // 3. Щом видим, че visible е станало false (прозорецът е затворен)
                clearInterval(checkClosed); // Спираме таймера

                console.log('Прозорецът беше затворен, опреснявам данните...');
                this.refresh(); // Викаме твоя метод за презареждане
            }
        }, 500); // 500ms е идеален интервал - не товари процесора и реагира бързо

    }

    private confirmationService = inject(ConfirmationService);

   async onCancelShipment(event: Event, order: IOrder) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: `${this.tr.instant('Сигурни ли сте, че искате да анулирате товарителница №')} ${order.wayBillShipmentNumber}?`,
            header: this.tr.instant('Внимание'),
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: this.tr.instant('Отказ'),
            acceptLabel: this.tr.instant('Анулирай'),
            acceptButtonProps: {
                label: this.tr.instant('Анулирай'),
                severity: 'danger'
            },
            accept: async () => {
                this.listService.cancelShipment(order);
                await this.waitForService();
                this.refresh();
                // Викаме бекенда само при потвърждение
                // this.http.post(`${window.location.origin.replace(':4200', ':9494')}/orders/cancel-shipment/${order.id}`, {})
                //     .subscribe({
                //         next: () => {
                //             this.reload();
                //             // Можеш да добавиш toast съобщение тук
                //         },
                //         error: (err) => {
                //             alert("Грешка при анулиране: " + (err.error || err.message));
                //         }
                //     });
            }
        });
    }

    private waitForService(): Promise<void> {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!this.listService.blockUI) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100); // Проверява на всеки 100ms
        });
    }

    // Вътре в class OrderDetailComponent добави:

    handleTrack(order: IOrder) {
        if (order.courierType === CourierType.ECONT) {
            window.open(`https://www.econt.com/services/track-shipment/${order.wayBillShipmentNumber}`, '_blank');
        } else if (order.courierType === CourierType.SPEEDY) {
            window.open(`https://www.speedy.bg/bg/track-shipment?shipmentNumber=${order.wayBillShipmentNumber}`, '_blank');
        } else if (String(order.courierType).includes('BOX')) {
            const id = order.parcelIds?.[0] || order.wayBillShipmentNumber;
            window.open(`https://www.boxnow.bg/?track=${id}`, '_blank');
        }
    }

    handlePrint(order: IOrder, waybillId?: string, format?: 'A4' | 'A6', waybillIds?: string[]) {
        if (order.courierType === CourierType.ECONT) {
            window.open(order.wayBillUrl, '_blank');
        } else {
            this.listService.printWayBill(order, waybillId ?? waybillIds ?? order.wayBillShipmentNumber.toString(), format ?? 'A6');
        }
    }

    getTimelineColor(status: string): string {
        if (!status) return '#94A3B8';
        const s = status.toLowerCase();
        if (s.includes('доставена') || s.includes('получена') || s.includes('delivered')) return '#22C55E';
        if (s.includes('анулирана') || s.includes('отказана') || s.includes('canceled')) return '#EF4444';
        if (s.includes('връщане') || s.includes('returning')) return '#F59E0B';
        return '#3B82F6';
    }


    // В OrderDetailComponent
    refresh() {
        const currentId = this.detailService.selectedItem()?.id;
        if (currentId) {
            // Използваме метода от базовия сървис, за да заредим данните наново
            this.detailService.loadData(currentId);
        }
    }
}
