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
import { ConfirmPopup } from 'primeng/confirmpopup';
import { ShipmentService } from './shipment.service';
import { ISite } from '../site/interfaces';
import { SiteDetailService } from '../site/detail.service';

@Component({
    selector: 'site-detail',
    standalone: true,
    imports: [Dialog, Button, FormsModule, CommonModule, TranslatePipe, Tooltip, Avatar, Select, Tag, InputText, Textarea, ButtonDirective, InputNumber, Image, Popover, Timeline, PrimeTemplate, ConfirmPopup],
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
                <div class="oe-root" *ngIf="detailService.selectedItem() as item">
                    <div class="oe-grid">
                        <div class="oe-col-12">
                        <div class="oe-quad">
                        <!-- КЛИЕНТ -->
                        <section class="oe-card oe-col-6">
                            <div class="oe-card-head">
                                <div class="oe-card-title"><span class="oe-ico"><i class="pi pi-user"></i></span> {{ 'Customer_Details' | translate }}</div>
                            </div>
                            <div class="oe-fields-2">
                                <div class="oe-field">
                                    <label>{{ 'first_name' | translate }}</label>
                                    <div class="oe-control"><input type="text" [(ngModel)]="item.billing.first_name" [disabled]="isReadOnly" /></div>
                                </div>
                                <div class="oe-field">
                                    <label>{{ 'last_name' | translate }}</label>
                                    <div class="oe-control"><input type="text" [(ngModel)]="item.billing.last_name" [disabled]="isReadOnly" /></div>
                                </div>
                                <div class="oe-field">
                                    <label>{{ 'Phone' | translate }}</label>
                                    <div class="oe-control oe-has-pre"><span class="oe-pre"><i class="pi pi-phone"></i></span><input type="tel" [(ngModel)]="item.billing.phone" [disabled]="isReadOnly" /></div>
                                </div>
                                <div class="oe-field">
                                    <label>{{ 'Email' | translate }}</label>
                                    <div class="oe-control oe-has-pre"><span class="oe-pre"><i class="pi pi-envelope"></i></span><input type="email" [(ngModel)]="item.billing.email" [disabled]="isReadOnly" /></div>
                                </div>
                            </div>
                        </section>

                        <!-- ДОСТАВКА (адрес) -->
                        <section class="oe-card oe-col-6">
                            <div class="oe-card-head">
                                <div class="oe-card-title"><span class="oe-ico"><i class="pi pi-map-marker"></i></span> {{ 'Shipping_Address' | translate }}</div>
                            </div>
                            <div class="oe-address-box" *ngIf="item.savedCourierBilling; else origAddr2">
                                <img [src]="listService.courierLogos[item.savedCourierBilling.courierType]" [alt]="item.savedCourierBilling.courierType" style="height: 30px; width: auto; max-width: 76px; object-fit: contain; flex: none;" />
                                <div style="flex: 1; min-width: 0;">
                                    <div class="oe-addr-main" *ngIf="item.savedCourierBilling.courierShipmentType !== 'ADDRESS'">{{ $any(item.savedCourierBilling.office)?.name }} — {{ $any(item.savedCourierBilling.office)?.address }}</div>
                                    <div class="oe-addr-main" *ngIf="item.savedCourierBilling.courierShipmentType === 'ADDRESS'">{{ item.savedCourierBilling.street }}</div>
                                    <div class="oe-addr-sub">
                                        <span class="oe-tag oe-green">{{ item.savedCourierBilling.courierShipmentType }}</span>
                                        <span class="oe-tag">{{ item.savedCourierBilling.weight }} кг · {{ item.savedCourierBilling.packCount }} бр.</span>
                                    </div>
                                </div>
                            </div>
                            <ng-template #origAddr2>
                                <div class="oe-address-box">
                                    <div class="oe-courier"><i class="pi pi-map-marker"></i></div>
                                    <div><div class="oe-addr-main">{{ item?.billing?.address_1 }}</div></div>
                                </div>
                            </ng-template>
                            <div class="oe-fields-2">
                                <div class="oe-field">
                                    <label>{{ 'City' | translate }}</label>
                                    <div class="oe-control"><input type="text" [value]="item?.billing?.city" disabled /></div>
                                </div>
                                <div class="oe-field">
                                    <label>{{ 'Postcode' | translate }}</label>
                                    <div class="oe-control"><input type="text" [value]="item?.billing?.postcode" disabled /></div>
                                </div>
                            </div>
                        </section>

                        <!-- ПОРЪЧКА (обединена: статус / метод / сайт + коментар) -->
                        <section class="oe-card oe-col-6">
                            <div class="oe-card-head">
                                <div class="oe-card-title"><span class="oe-ico"><i class="pi pi-receipt"></i></span> {{ 'Order' | translate }}</div>
                            </div>
                            <div style="display: grid; grid-template-columns: 150px 1fr; gap: 18px; flex: 1; align-items: stretch;">
                                <div class="oe-order-left" style="display: flex; flex-direction: column; gap: 10px;">
                                    <div class="oe-field">
                                        <p-select [options]="orderStatus()" [(ngModel)]="item.status" optionLabel="label" optionValue="value" class="w-full custom-status-select" appendTo="body">
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
                                    <div class="oe-field">
                                        <p-select [options]="paymentMethods" [disabled]="isReadOnly" [(ngModel)]="item.paymentMethod" optionLabel="label" optionValue="value" class="w-full" placeholder="{{ 'Payment_method' | translate }}" appendTo="body">
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
                                    <div class="oe-field">
                                        <div class="oe-site-chip" *ngIf="selectedSiteName()">
                                            <span class="oe-dot">S</span><b>{{ selectedSiteName() }}</b>
                                            <span style="margin-left: auto; cursor: pointer; color: var(--oe-text3);" (click)="selectedSiteName.set('')"><i class="pi pi-times"></i></span>
                                        </div>
                                        <div *ngIf="!selectedSiteName()" class="flex align-items-center gap-2">
                                            <p-button icon="pi pi-search" [label]="'Site' | translate" [text]="true" size="small" (onClick)="openSiteDialog()"></p-button>
                                        </div>
                                    </div>
                                </div>
                                <div class="oe-field" style="display: flex; flex-direction: column;">
                                    <label>{{ 'Order_Comments' | translate }}</label>
                                    <textarea [(ngModel)]="item.comment" [placeholder]="'Comment' | translate" style="flex: 1; min-height: 0; resize: none;"></textarea>
                                </div>
                            </div>
                        </section>

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


                        <div class="oe-col-6 oe-card">
                            <div class="oe-card-head">
                                <div class="oe-card-title"><span class="oe-ico"><i class="pi pi-truck"></i></span> Товарителница</div>
                            </div>
                            <div class="flex-wrap" style="flex: 1; display: flex; align-items: center; justify-content: space-evenly; width: 100%; padding: 6px 0;">
                                <div style="display: flex; flex-direction: column; align-items: stretch; gap: 8px; text-align: center;">
                                    <span style="font-size: 12px; font-weight: 600; color: var(--oe-text2); line-height: 1.2; max-width: 100px; margin: 0 auto;">Генерирай Товарителница</span>
                                    <div style="display: flex; justify-content: center;">
                                        <p-button
                                            icon="pi pi-plus"
                                            severity="info"
                                            [rounded]="false"
                                            (onClick)="openShipmentDialog(item)"
                                            [pTooltip]="'Generate_Waybill' | translate"
                                            [style]="{ width: '52px', height: '52px', 'border-radius': '12px' }"
                                            [disabled]="!item.id || isReadOnly"
                                        >
                                        </p-button>
                                    </div>
                                </div>

                                <div *ngIf="item.wayBillShipmentNumber" style="display: flex; flex-direction: column; align-items: stretch; gap: 8px; text-align: center;">
                                    <span style="font-size: 12px; font-weight: 600; color: var(--oe-text2); line-height: 1.2; max-width: 100px; margin: 0 auto;">Анулирай Товарителница</span>
                                    <div style="display: flex; justify-content: center;">
                                        <p-button
                                            icon="pi pi-ban"
                                            severity="danger"
                                            [rounded]="false"
                                            (onClick)="onCancelShipment($event, item)"
                                            [pTooltip]="'Cancel_Waybill' | translate"
                                            [style]="{ width: '52px', height: '52px', 'border-radius': '12px' }"
                                        >
                                        </p-button>
                                    </div>
                                </div>

                                <div *ngIf="item.wayBillShipmentNumber" style="display: flex; flex-direction: column; align-items: stretch; gap: 8px; text-align: center;">
                                    <span style="font-size: 12px; font-weight: 600; color: var(--oe-text2); line-height: 1.2; max-width: 100px; margin: 0 auto;">Принтирай Товарителница</span>
                                    <div style="display: flex; justify-content: center;">
                                        <p-button icon="pi pi-print" severity="secondary" [rounded]="false" [outlined]="true" [pTooltip]="'Принтирай A6'" (onClick)="handlePrint(item, undefined, 'A6', item.parcelIds)" [style]="{ width: '52px', height: '52px', 'border-radius': '12px' }"> </p-button>
                                    </div>
                                </div>

                                <div *ngIf="item.wayBillShipmentNumber" style="display: flex; flex-direction: column; align-items: stretch; gap: 8px; text-align: center;">
                                    <span style="font-size: 12px; font-weight: 600; color: var(--oe-text2); line-height: 1.2; max-width: 100px; margin: 0 auto;">Проследяване на пратката</span>
                                    <div style="display: flex; justify-content: center;">
                                        <p-button icon="pi pi-map-marker" severity="secondary" [rounded]="false" [outlined]="true" [pTooltip]="'Track' | translate" (onClick)="handleTrack(item)" [style]="{ width: '52px', height: '52px', 'border-radius': '12px' }"> </p-button>
                                    </div>
                                </div>

                                <div *ngIf="item.wayBillShipmentNumber && item.courierHistory?.length" style="display: flex; flex-direction: column; align-items: stretch; gap: 8px; text-align: center;">
                                    <span style="font-size: 12px; font-weight: 600; color: var(--oe-text2); line-height: 1.2; max-width: 100px; margin: 0 auto;">История на пратката</span>
                                    <div style="display: flex; justify-content: center;">
                                        <p-button icon="pi pi-clock" severity="info" [rounded]="false" [outlined]="true" [pTooltip]="'History' | translate" (onClick)="opHistoryDetail.toggle($event)" [style]="{ width: '52px', height: '52px', 'border-radius': '12px' }"> </p-button>
                                    </div>
                                </div>
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

                            <div *ngIf="!item.id" class="flex align-items-center gap-2 mt-2 p-2 bg-orange-50 border-round border-1 border-orange-200 text-orange-700 w-fit">
                                <i class="pi pi-exclamation-triangle font-bold"></i>
                                <span class="text-xs font-semibold">
                                    {{ 'You_must_first_save_the_order_so_you_can_generate_a_waybill' | translate }}
                                </span>
                            </div>
                        </div>
                        </div>
                        </div>

                        <!-- ТИКЧЕ (временно тук — ще се премести където каже Асан) -->
                        <div class="oe-col-12">
                            <div class="oe-checkbox-card" style="margin-top: 0;">
                                <input type="checkbox" id="freeDelivery" [disabled]="isReadOnly" [(ngModel)]="item.freeDelivery" style="width: 22px; height: 22px; cursor: pointer; flex: none;" />
                                <label for="freeDelivery" style="font-weight: 600; cursor: pointer;"><i class="pi pi-truck mr-1"></i> Безплатна пратка — без наложен платеж, доставка за сметка на магазина</label>
                            </div>
                        </div>

                        <div class="oe-col-12 oe-card">
                            <div class="oe-card-head">
                                <div class="oe-card-title"><span class="oe-ico"><i class="pi pi-box"></i></span> {{ 'Order_Items' | translate }}</div>
                            </div>

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
                                                            <p-image [src]="imgSrc(line)" [alt]="line.productName" [preview]="true" class="w-full h-full object-cover cursor-zoom-in" />
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

                                            <td class="p-3 text-right">
                                                <div class="flex flex-column justify-end gap-1">
                                                    <div class="flex align-items-center gap-1">
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
                                                    </div>
                                                    <div *ngIf="!line.totalPrice && line.effectiveTotalPrice" class="flex align-items-center gap-1" style="font-size: 11px; color: #7c3aed;">
                                                        <i class="pi pi-credit-card" style="font-size: 11px;"></i>
                                                        <span>реална: {{ line.effectiveTotalPrice | number: '1.2-2' }} {{ item.currency }}</span>
                                                    </div>
                                                </div>
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
                                <!-- Бутонът се деактивира само за нова поръчка без prefill режим -->
                                <p-button (onClick)="this.openProductSelector()" [label]="'Add_Product' | translate" icon="pi pi-plus" severity="success" [text]="true" size="small" [disabled]="!item.id && !detailService.prefillMode()"> </p-button>

                                <!-- Предупреждението се показва само за обикновена нова поръчка (без prefill) -->
                                <span *ngIf="!item.id && !detailService.prefillMode()" class="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 border-round border-1 border-orange-200">
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
                                                                    <a *ngIf="line.image?.src" [href]="imgSrc(line)" target="_blank">
                                                                        <img [src]="imgSrc(line)" class="w-full h-full object-cover" />
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
                <p-button [label]="'Save' | translate" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
            </ng-template>
        </p-dialog>

        <p-confirmpopup key="wbCancel"></p-confirmpopup>
    `,
    styles: [
        `
            .oe-root {
                --oe-bg: #f2f5f8;
                --oe-card: #fff;
                --oe-border: #e3e8ee;
                --oe-border-strong: #cfd7e0;
                --oe-text: #17212e;
                --oe-text2: #5b6878;
                --oe-text3: #8a95a3;
                --oe-primary: #12a150;
                --oe-primary-dark: #0e8442;
                --oe-primary-soft: #e8f8ef;
                --oe-warn-soft: #fff4e5;
                --oe-warn: #b45309;
                --oe-danger: #dc2626;
                --oe-danger-soft: #fdeaea;
                --oe-blue: #2563eb;
                --oe-blue-soft: #e9f0fe;
                --oe-radius: 14px;
                --oe-radius-s: 10px;
                --oe-shadow: 0 1px 2px rgba(23, 33, 46, 0.05), 0 4px 16px rgba(23, 33, 46, 0.05);
                background: var(--oe-bg);
                color: var(--oe-text);
                font-size: 14px;
                margin: -1.25rem;
                padding: 24px 28px 40px;
            }
            .oe-grid {
                display: grid;
                grid-template-columns: repeat(12, 1fr);
                gap: 20px;
            }
            .oe-col-6 {
                grid-column: span 6;
            }
            .oe-col-12 {
                grid-column: span 12;
            }
            .oe-card {
                background: var(--oe-card);
                border: 1px solid var(--oe-border);
                border-radius: var(--oe-radius);
                box-shadow: var(--oe-shadow);
                padding: 24px;
                display: flex;
                flex-direction: column;
            }
            .oe-card-head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
            }
            .oe-card-title {
                display: flex;
                align-items: center;
                gap: 11px;
                font-size: 15px;
                font-weight: 700;
            }
            .oe-card-title .oe-ico {
                width: 34px;
                height: 34px;
                border-radius: 9px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                background: var(--oe-primary-soft);
                color: var(--oe-primary);
            }
            .oe-fields-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            .oe-fields-3 {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr;
                gap: 16px;
            }
            .oe-field label {
                display: block;
                font-size: 12.5px;
                font-weight: 600;
                color: var(--oe-text2);
                margin-bottom: 7px;
                letter-spacing: 0.2px;
            }
            .oe-control {
                position: relative;
            }
            .oe-control .oe-pre {
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--oe-text3);
                font-size: 14px;
                pointer-events: none;
                z-index: 1;
            }
            .oe-control input,
            .oe-control select,
            .oe-card textarea {
                width: 100%;
                height: 46px;
                border: 1px solid var(--oe-border-strong);
                border-radius: var(--oe-radius-s);
                padding: 0 14px;
                font-family: inherit;
                font-size: 14.5px;
                font-weight: 500;
                color: var(--oe-text);
                background: var(--oe-card);
                outline: none;
            }
            .oe-control.oe-has-pre input,
            .oe-control.oe-has-pre select {
                padding-left: 40px;
            }
            .oe-control input:focus,
            .oe-control select:focus,
            .oe-card textarea:focus {
                border-color: var(--oe-primary);
                box-shadow: 0 0 0 3px rgba(18, 161, 80, 0.18);
            }
            .oe-card textarea {
                height: auto;
                min-height: 104px;
                padding: 12px 14px;
                resize: vertical;
                line-height: 1.5;
            }
            .oe-address-box {
                border: 1px solid var(--oe-border);
                border-radius: var(--oe-radius-s);
                background: var(--oe-primary-soft);
                border-left: 4px solid var(--oe-primary);
                padding: 14px 16px;
                display: flex;
                align-items: center;
                gap: 14px;
                margin-bottom: 16px;
            }
            .oe-address-box .oe-courier {
                width: 44px;
                height: 44px;
                border-radius: 9px;
                flex: none;
                background: var(--oe-danger-soft);
                color: var(--oe-danger);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 11px;
            }
            .oe-address-box .oe-addr-main {
                font-weight: 600;
                font-size: 14px;
                line-height: 1.4;
            }
            .oe-address-box .oe-addr-sub {
                display: flex;
                gap: 8px;
                margin-top: 6px;
                flex-wrap: wrap;
            }
            .oe-tag {
                font-size: 11.5px;
                font-weight: 600;
                padding: 3px 9px;
                border-radius: 6px;
                background: var(--oe-bg);
                color: var(--oe-text2);
                border: 1px solid var(--oe-border);
            }
            .oe-tag.oe-green {
                background: var(--oe-primary-soft);
                color: var(--oe-primary-dark);
                border-color: transparent;
            }
            .oe-site-chip {
                height: 46px;
                display: flex;
                align-items: center;
                gap: 10px;
                border: 1px solid var(--oe-border-strong);
                border-radius: var(--oe-radius-s);
                padding: 0 14px;
            }
            .oe-site-chip .oe-dot {
                width: 22px;
                height: 22px;
                border-radius: 6px;
                background: var(--oe-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 11px;
                font-weight: 800;
            }
            .oe-table {
                width: 100%;
                border-collapse: collapse;
            }
            .oe-table th {
                text-align: left;
                font-size: 12px;
                font-weight: 700;
                color: var(--oe-text3);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 0 16px 12px;
                border-bottom: 1px solid var(--oe-border);
            }
            .oe-table th.oe-r,
            .oe-table td.oe-r {
                text-align: right;
            }
            .oe-table th.oe-c,
            .oe-table td.oe-c {
                text-align: center;
            }
            .oe-table td {
                padding: 16px;
                border-bottom: 1px solid var(--oe-border);
                vertical-align: middle;
            }
            .oe-price-base {
                display: inline-flex;
                padding: 5px 11px;
                border-radius: 7px;
                font-weight: 700;
                font-size: 13.5px;
                background: var(--oe-primary-soft);
                color: var(--oe-primary-dark);
            }
            .oe-price-base.oe-zero {
                background: var(--oe-warn-soft);
                color: var(--oe-warn);
            }
            .oe-summary {
                width: 380px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-left: auto;
            }
            .oe-sum-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 14px;
            }
            .oe-sum-row .oe-k {
                color: var(--oe-text2);
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 9px;
            }
            .oe-sum-total {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 4px;
                padding: 16px 18px;
                border-radius: var(--oe-radius-s);
                background: var(--oe-primary-soft);
            }
            .oe-sum-total .oe-k {
                font-size: 15px;
                font-weight: 700;
            }
            .oe-sum-total .oe-v {
                font-size: 24px;
                font-weight: 800;
                color: var(--oe-primary-dark);
                letter-spacing: -0.4px;
            }
            .oe-checkbox-card {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 16px;
                border: 1px solid var(--oe-border);
                border-radius: var(--oe-radius-s);
                background: var(--oe-primary-soft);
                margin-top: 16px;
            }
            .oe-quad {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                grid-auto-rows: 1fr;
            }
            .oe-quad > .oe-card {
                grid-column: auto;
            }
            @media (max-width: 1100px) {
                .oe-quad {
                    grid-template-columns: 1fr;
                }
            }
            .oe-order-left .oe-field {
                width: 100%;
            }
            .oe-order-left .oe-site-chip {
                width: 100%;
                height: 46px;
            }
            ::ng-deep .oe-order-left .p-select {
                width: 100%;
                height: 46px;
                display: flex;
                align-items: center;
            }
            @media (max-width: 1100px) {
                .oe-col-6 {
                    grid-column: span 12;
                }
                .oe-fields-3 {
                    grid-template-columns: 1fr 1fr;
                }
                .oe-summary {
                    width: 100%;
                }
            }
        `
    ]
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

    /**
     * Адрес на снимката на ред от поръчката. Локалните пътища (/media/...) — снимки, хоствани от
     * ERP-то (текущата снимка на продукта) — се долепят до ERP адреса. Пълните URL-и (стари
     * уловени WooCommerce адреси) се ползват както са.
     */
    protected imgSrc(line: any): string {
        const s = line?.image?.src;
        if (!s) return '';
        return s.startsWith('/') ? this.baseUrl + s : s;
    }
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

        effect(
            () => {
                const item = this.detailService.selectedItem();
                if (item && this.detailService.isVisible()) {
                    // Когато поръчката се зареди и диалогът е видим,
                    // запазваме статуса й САМО ако originalStatus още не е сетнат
                    if (!this.originalStatus) {
                        this.originalStatus = item.status;
                    }
                } else if (!this.detailService.isVisible()) {
                    // Когато затворим диалога, чистим оригиналния статус
                    this.originalStatus = null;
                }
            },
            { allowSignalWrites: true }
        );

        effect(
            () => {
                const item = this.detailService.selectedItem();
                if (!item) return;

                if (!item.id) {
                    item.status = OrderStatus.PROCESSING;
                    // Skip default site when we'll load a specific site via pendingSiteId
                    if (!this.detailService.pendingSiteId()) {
                        this.siteService.getDefaultSite().subscribe((value) => {
                            if (value) {
                                this.selectedSiteName.set(value.url);
                                this.detailService.selectedItem()!.site = value;
                            }
                        });
                    }
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
            () => {
                const skuItems = this.detailService.pendingSkuItems();
                const siteId = this.detailService.pendingSiteId();
                const visible = this.detailService.isVisible();
                if (!skuItems?.length || siteId === null || !visible) return;
                // Clear immediately to prevent re-run
                this.detailService.pendingSkuItems.set(null);
                this.detailService.pendingSiteId.set(null);
                this.loadAndAddProductsBySkus(siteId, skuItems);
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
                    if (!this.isManualShipping && item.id) {
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
        [OrderStatus.FAILED]: '#ff0000',
        [OrderStatus.REFUSED_AFTER_REVIEW]: '#8b0000'
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
            return allOptions.filter((opt) => opt.value === 'processing' || opt.value === 'cancelled');
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
        return items.reduce((sum, item) => {
            const eff = item.totalPrice && item.totalPrice > 0 ? item.totalPrice : item.effectiveTotalPrice || 0;
            return sum + eff;
        }, 0);
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
        const subtotal = lines.reduce((sum, line) => {
            const eff = line.totalPrice && line.totalPrice > 0 ? line.totalPrice : line.effectiveTotalPrice || 0;
            return sum + eff;
        }, 0);

        let selectedItem = this.detailService.selectedItem();
        const shipping = selectedItem!.customShippingTotal;
        selectedItem!.totalPrice = subtotal + shipping;
        return subtotal + shipping;
    });

    private async loadAndAddProductsBySkus(siteId: number, items: { sku: string; qty: number; cartPrice?: number }[]): Promise<void> {
        const site = await this.detailService.getSiteById(siteId);
        const currentItem = this.detailService.selectedItem();
        if (!currentItem || !site) return;
        currentItem.site = site;
        if (site.currency) {
            const rawCurrency: any = site.currency;
            currentItem.currency = typeof rawCurrency === 'string' ? rawCurrency : (rawCurrency?.code ?? rawCurrency?.symbol ?? '');
        }
        this.selectedSiteName.set(site.url || (site as any).name || '');
        for (const skuItem of items) {
            const minProduct = await this.detailService.getProductBySku(skuItem.sku, siteId);
            if (!minProduct) continue;
            const fullProduct = await this.detailService.getProduct(minProduct);
            if (!fullProduct) continue;

            // Автоматично намиране на адон по ценова разлика (cartPrice - basePrice ≈ priceModifier)
            let autoAddon: any = undefined;
            if (skuItem.cartPrice != null && fullProduct.addonConfigs?.length) {
                const siteConf = fullProduct.siteConfig?.find((c: any) => c.site?.id === siteId);
                if (siteConf) {
                    const base = siteConf.price > 0 ? siteConf.price : siteConf.regularPrice;
                    const diff = Math.round((skuItem.cartPrice - base) * 100) / 100;
                    if (diff > 0.001) {
                        autoAddon = fullProduct.addonConfigs.find((a: any) => Math.abs(parseFloat(a.priceModifier) - diff) < 0.02);
                    }
                }
            }

            this.addProductToOrder(fullProduct, autoAddon, skuItem.qty);
        }
        this.cdr.detectChanges();
    }

    private addProductToOrder(product: any, selectedAddon?: any, qty: number = 1) {
        const item = this.detailService.selectedItem();
        if (!item) return;

        const siteId = this.detailService.selectedItem()!.site.id;
        let bPrice = product.siteConfig.find((c: { site: { id: number } }) => c.site.id === siteId);

        // price = текуща цена от ERP (намалена при промоция); regularPrice = оригинална
        let basePrice = parseFloat(bPrice.price > 0 ? bPrice.price : bPrice.regularPrice);
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
            quantity: qty,
            price: finalPrice,
            totalPrice: +(finalPrice * qty).toFixed(2),
            weight: product.weight || '0.5',
            image: {
                src: foundPath ? this.baseUrl + foundPath : '',
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
            key: 'wbCancel',
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
