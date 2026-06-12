import { ChangeDetectorRef, Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { SelectButton } from 'primeng/selectbutton';
import { WebSocketService } from 'xl-util';
import { Subject, takeUntil } from 'rxjs';
import { Badge } from 'primeng/badge';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ShipmentDetailComponent } from './shipment.detail';
import { ShipmentService } from './shipment.service';
import { CourierType } from '../courier/interfaces';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BlockUI } from 'primeng/blockui';
import { Popover } from 'primeng/popover';
import { Textarea } from 'primeng/textarea';
import { TimelineModule } from 'primeng/timeline';
import { Select } from 'primeng/select';

@Component({
    selector: 'site-list',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        TagModule,
        Toolbar,
        OrderDetailComponent,
        TranslatePipe,
        Tooltip,
        FormsModule,
        SelectButton,
        Badge,
        IconField,
        InputIcon,
        InputText,
        ShipmentDetailComponent,
        BlockUI,
        Popover,
        Textarea,
        TimelineModule,
        Select
    ],
    styles: [`
        /* Стиловете са капсулирани чрез името на класа на таблицата или компонента */
        .table-status-select {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            box-shadow: none !important;
            width: 100%;
        }

        .table-status-select .p-select-label {
            padding: 0 !important;
            display: flex;
            justify-content: center;
        }

        .table-status-select:not(.p-disabled).p-focus {
            box-shadow: none !important;
            outline: none !important;
        }

        /* Ако искаш да скриеш иконата на стрелката по-чисто */
        /*.table-status-select .p-select-dropdown {*/
        /*    display: none !important;*/
        /*}*/
    `],
    template: `
        <p-toolbar class="mb-6">
            <ng-template *ngIf="config?.data?.mode !== 'lookup'" #start>
                <p-button [label]="'New' | translate" icon="pi pi-plus" severity="primary" class="mr-2" (onClick)="detailService.openCreateDialog()"></p-button>
                <p-button severity="warn" [label]="'Delete' | translate" icon="pi pi-trash" outlined [disabled]="!selectedItem" />
                <p-button (onClick)="this.openSyncDialog()" [pTooltip]="'Prefered_to_use_when_db_is_empty' | translate" class="ml-5" severity="info" [label]="'Synchronize' | translate" icon="pi pi-sync" outlined></p-button>
            </ng-template>

            <ng-template #end>
                <p-iconfield *ngIf="config?.data?.mode !== 'lookup'" iconPosition="left">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" [(ngModel)]="searchValue" (keyup.enter)="onSearch($event)" [placeholder]="'Search_by_name_or_phone...' | translate" class="p-inputtext-sm w-full md:w-20rem" />
                    <p-inputicon *ngIf="searchValue" styleClass="pi pi-times cursor-pointer" (click)="clearSearch()" />
                </p-iconfield>
            </ng-template>
        </p-toolbar>

        <div *ngIf="config?.data?.mode !== 'lookup'" class="flex flex-wrap align-items-center gap-3 mb-4 p-3 bg-white border-round shadow-1">
            <span class="font-bold text-secondary mr-2"> <i class="pi pi-filter mr-1"></i> {{ 'Status' | translate }}: </span>

            <p-selectButton [options]="statusFilterOptions" [(ngModel)]="selectedStatus" (onChange)="onStatusFilterChange($event.value)" optionLabel="label" optionValue="value">
                <ng-template #item let-item>
                    <div class="flex align-items-center gap-2 px-1">
                        <i *ngIf="item.value" class="pi pi-circle-fill text-xs" [style.color]="getStatusColor(item.value)"></i>
                        <span class="font-medium text-sm">{{ item.label | translate }}</span>
                        <p-badge *ngIf="item.value !== null" [value]="listService.statusStats()?.orderStatusMap?.[item.value] || 0" severity="info" styleClass="text-xs ml-1"> </p-badge>
                    </div>
                </ng-template>
            </p-selectButton>
        </div>

        <p-table
            [value]="listService.items()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [paginator]="true"
            [rows]="this.lastParams.rows"
            [totalRecords]="listService.totalRecords()"
            [loading]="listService.loading()"
            [rowsPerPageOptions]="[10, 20, 50, 100, 200, 500]"
            [tableStyle]="{ 'min-width': '50rem' }"
            [(selection)]="selectedItem"
            [rowHover]="true"
            dataKey="id"
            stripedRows
            [rowTrackBy]="trackByOrderId"
        >
            <ng-template pTemplate="header">
                <tr *ngIf="selectedStatus != null">
                    <th colspan="2" class="text-left py-2" style="border-bottom: 2px solid #dee2e6;">
                        <div class="flex flex-col align-items-start">
                            <small class="text-secondary uppercase font-bold" style="font-size: 10px;">{{ 'Count' | translate }}</small>
                            <span class="text-900 font-bold text-lg">
                                <small class="text-primary" style="font-size: 13px;"> {{ itemsCount() }}</small>
                            </span>
                        </div>
                    </th>

                    <th colspan="4" class="border-none"></th>

                    <th class="text-right py-2" style="border-bottom: 2px solid #dee2e6;">
                        <div class="flex flex-col align-items-end" style="width: max-content;">
                            <small class="text-secondary uppercase font-bold" style="font-size: 10px;">{{ 'Total' | translate }}</small>
                            <span class="text-primary font-bold text-lg" style="font-size: 13px;">
                                {{ totalAmount() | number: '1.2-2' }}
                                <small>{{ listService.items()[0]?.currency }}</small>
                            </span>
                        </div>
                    </th>

                    <th class="border-none"></th>
                </tr>
                <tr>
                    <th>
                        <p-tableHeaderCheckbox />
                    </th>
                    <th>{{ 'Created' | translate }}</th>
                    <!--                    <th>{{'Last_Updated' | translate}}</th>-->
                    <!--                    <th>{{ 'Id' | translate }}</th>-->
                    <th pSortableColumn="id">
                        <div class="flex items-center justify-between">
                            {{ 'Wp_order_id' | translate }}
                            <p-columnFilter type="text" field="id" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false"></p-columnFilter>
                        </div>
                    </th>
                    <th>{{ 'Comment' | translate }}</th>
                    <th>{{ 'Status' | translate }}</th>
                    <th>{{ 'Customer' | translate }}</th>
                    <th>{{ 'Site' | translate }}</th>
                    <!--                    <th>{{'Confirmed' | translate}}</th>-->
                    <!--                    <th>{{ 'Customer_agent' | translate }}</th>-->
                    <!--                    <th>{{ 'Customer_ip' | translate }}</th>-->
                    <th>{{ 'Courier' | translate }}</th>
                    <th>{{ 'Bill_of_lading' | translate }}</th>
                    <th>{{ 'Payment_method' | translate }}</th>
                    <th>{{ 'Price' | translate }}</th>

                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item let-i="rowIndex">
                @let order = asCast(item);

                @if (selectedStatus === null && isNewDay(order, i)) {
                    <tr *ngIf="selectedStatus == null" class="bg-gray-100">
                        <td colspan="8" class="py-2 px-4 border-bottom-2 border-primary-500">
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-calendar text-primary-600 font-bold"></i>
                                <span class="text-primary-800 font-bold uppercase tracking-wider">
                                    <span class="text-primary-900 font-bold uppercase tracking-wider">
                                        {{ 'DAYS.' + (order.wpOrderTime | date: 'EEEE') | translate }},

                                        {{ order.wpOrderTime | date: 'dd' }}

                                        {{ 'MONTHS.' + (order.wpOrderTime | date: 'MMMM') | translate }}

                                        {{ order.wpOrderTime | date: 'yyyy' }}
                                    </span>
                                </span>
                            </div>
                        </td>
                    </tr>
                }

                @if (selectedStatus === OrderStatus.SENT && isNewShipmentDay(order, i)) {
                    <tr class="bg-orange-50">
                        <td colspan="12" class="py-2 px-4 border-bottom-2 border-orange-500">
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-truck text-orange-600 font-bold"></i>
                                <span class="text-orange-900 font-bold uppercase tracking-wider">
                    <span class="mr-2">{{ 'Sent' | translate }}:</span>

                                    @let shipDate = (order.courierHistory && order.courierHistory.length > 0
                                        ? order.courierHistory[0].eventTime
                                        : order.updateTime);

                                    {{ 'DAYS.' + (shipDate | date: 'EEEE') | translate }},
                                    {{ shipDate | date: 'dd' }}
                                    {{ 'MONTHS.' + (shipDate | date: 'MMMM') | translate }}
                                    {{ shipDate | date: 'yyyy' }}
                </span>
                            </div>
                        </td>
                    </tr>
                }

                @if (selectedStatus === OrderStatus.COMPLETED && isNewCompletedDay(order, i)) {
                    <tr class="bg-green-50">
                        <td colspan="12" class="py-2 px-4 border-bottom-2 border-green-500">
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-check-circle text-green-600 font-bold"></i>
                                <span class="text-green-900 font-bold uppercase tracking-wider">
                    <span class="mr-2">{{ 'Delivered' | translate }}:</span>

                                    @let deliveryDate = (order.courierHistory && order.courierHistory.length > 0
                                        ? order.courierHistory[order.courierHistory.length - 1].eventTime
                                        : order.updateTime);

                                    {{ 'DAYS.' + (deliveryDate | date: 'EEEE') | translate }},
                                    {{ deliveryDate | date: 'dd' }}
                                    {{ 'MONTHS.' + (deliveryDate | date: 'MMMM') | translate }}
                                    {{ deliveryDate | date: 'yyyy' }}
                </span>
                            </div>
                        </td>
                    </tr>
                }

                <tr
                    [ngClass]="{
                        'cursor-pointer hover:bg-blue-50': this.config?.data?.mode === 'lookup',
                        'has-paid-color': hasPaidAddons(order)
                    }"
                >
                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="item"></p-tableCheckbox>
                    </td>

                    <th>
                        <div class="flex align-items-center gap-2">
                            <i *ngIf="order.showDuplicateWarning" class="pi pi-exclamation-triangle text-yellow-500 text-xl shadow-animate" [pTooltip]="'Detected_duplicate_orders_for_this_customer' | translate" tooltipPosition="top"> </i>

                            <span>{{ order.wpOrderTime | date: 'dd.MM.yyyy HH:mm' }}</span>
                        </div>
                    </th>
                    <!--                    <th>{{order.updateTime | date: 'dd.MM.yyyy HH:mm'}}</th>-->
                    <!--                    <td>{{ order.id }}</td>-->
                    <td>
                        <span class="font-bold text-900">{{ order.id }}</span>
                        <br>
                        <span class="text-secondary text-1xl">#{{ order.wpOrderId }}</span>
                    </td>

                    <td style="min-width: 220px; max-width: 300px;">
                        <div class="p-2 border-round border-left-3 cursor-pointer shadow-sm transition-all" [ngClass]="order.comment ? 'bg-yellow-100' : 'bg-gray-50 border-gray-300'" (click)="$event.stopPropagation(); commentOp.toggle($event)">
                            <div class="flex align-items-center gap-2 mb-1">
                                <!--                                <i class="pi pi-comment text-xs text-yellow-600"></i>-->
                                <!--                                <span class="text-xs font-bold uppercase" style="font-size: 10px;">{{ 'Comment' | translate }}</span>-->
                            </div>
                            <div class="text-sm font-medium text-900 italic line-height-2 line-clamp-2 overflow-hidden w-full">
                                <!--                                {{ order.comment ? order.comment : ('Add_note...' | translate) }}-->
                                {{ order.comment }}
                            </div>
                        </div>

                        <p-popover #commentOp (onShow)="onCommentPopShow(order)" [style]="{ width: '600px' }">
                            <div class="flex justify-center justify-content-between border-bottom-1 pb-2 surface-border w-full">
                                <span class="font-bold text-900 uppercase text-xs tracking-wider"> <i class="pi pi-comment mr-1 text-yellow-600"></i> {{ 'Comment' | translate }} </span>
                                <p-tag severity="secondary" [value]="'#' + order.wpOrderId"></p-tag>
                            </div>

                            <div class="p-3 flex flex-col gap-3 w-full" style="box-sizing: border-box;">
                                <div class="w-full">
                                    <textarea
                                        pInputTextarea
                                        [(ngModel)]="editableComment"
                                        rows="6"
                                        [autoResize]="false"
                                        class="w-full p-3 text-lg border-round border-1 surface-border shadow-inner font-medium"
                                        [placeholder]="'Comment' | translate"
                                        style="width: 100% !important; display: block; resize: none; box-sizing: border-box;"
                                    >
                                    </textarea>
                                </div>

                                <div class="flex justify-end flex-row gap-2 w-full pt-2">
                                    <p-button [label]="'Cancel' | translate" [text]="true" severity="secondary" (onClick)="commentOp.hide()"></p-button>
                                    <p-button [label]="'Save' | translate" icon="pi pi-check" [loading]="isSavingComment" (onClick)="saveQuickComment(order, commentOp)"></p-button>
                                </div>
                            </div>
                        </p-popover>
                    </td>
                    <!--                    <td>{{ order.currency }}</td>-->
                    <!--                    <td>{{ order.currencySymbol }}</td>-->

                    <td (click)="$event.stopPropagation()">
                        <p-select [(ngModel)]="order.status" [options]="statusOptions" (onChange)="listService.updateOrderField(order)" styleClass="table-status-select" appendTo="body" class="w-full">
                            <ng-template #dropdownicon>
                                <span style="display: none;"></span>
                            </ng-template>

                            <ng-template #selectedItem let-selectedOption>
                                <p-tag
                                    [value]="selectedOption.label | translate"
                                    [style]="{
                                        background: getStatusColor(selectedOption.value),
                                        color: '#ffffff',
                                        width: '90px',
                                        height: '26px',
                                        'justify-content': 'center',
                                        'border-radius': '3px',
                                        'font-size': '13px',
                                        cursor: 'pointer'
                                    }"
                                >
                                </p-tag>
                            </ng-template>

                            <ng-template #item let-option>
                                <p-tag
                                    [value]="option.label | translate"
                                    [style]="{
                                        background: getStatusColor(option.value),
                                        color: '#ffffff',
                                        width: '90px',
                                        'justify-content': 'center',
                                        'border-radius': '3px'
                                    }"
                                >
                                </p-tag>
                            </ng-template>
                        </p-select>
                    </td>

                    <td [ngClass]="{ 'bg-red-50': op.overlayVisible }">
                        <div class="flex align-items-center gap-3" style="align-items: center;">
                            <p-badge
                                [value]="order.customerOrderCount"
                                severity="info"
                                styleClass="cursor-pointer hover:shadow-2"
                                [pTooltip]="'Show_all_orders_for_this_customer' | translate"
                                tooltipPosition="top"
                                (click)="filterByCustomer(order.billing.phone)"
                            >
                            </p-badge>

                            <div class="flex flex-col gap-1">
                                <div class="font-bold text-900 line-height-1">{{ order.billing.first_name }} {{ order.billing.last_name }}</div>
                                <div class="text-secondary text-sm flex align-items-center gap-1">
                                    <i class="pi pi-phone text-xs"></i>
                                    <span
                                        class="cursor-pointer hover:text-purple-600 transition-colors"
                                        (click)="this.listService.openViber(order.billing.phone)"
                                        pTooltip="Отвори чат във Viber"
                                        tooltipPosition="top">
        {{ order.billing.phone }}
    </span>
                                </div>

                                <i
                                    *ngIf="order.signals?.length"
                                    class="pi pi-thumbs-down-fill text-red-600 cursor-pointer p-1 animate-bounce"
                                    [pTooltip]="('Detected_signals' | translate) + ' ' + order.signals.length + ' ' + ('Signals_Click_To_View' | translate)"
                                    tooltipPosition="top"
                                    (click)="$event.stopPropagation(); op.toggle($event)"
                                >
                                </i>

                                <p-popover #op>
                                    <div class="p-3" style="width: 400px">
                                        <div class="flex align-items-center gap-2 font-bold mb-3 border-bottom-1 pb-2 text-red-600">
                                            <i class="pi pi-exclamation-triangle"></i>
                                            <span>{{ 'Uncorrect_signal' | translate }}</span>
                                        </div>
                                        <div class="signals-scroll-container" style="max-height: 350px; overflow-y: auto;">
                                            <div *ngFor="let s of order.signals" class="mb-3 p-2 bg-gray-100 border-round border-left-3 border-red-500">
                                                <div class="flex justify-content-between align-items-center">
                                                    <small class="text-1xl text-secondary font-bold">{{ s.createDate | date: 'dd.MM.yyyy' }}</small>
                                                    <!--                                                    <small class="text-xs text-400">ID: {{ s.id }}</small>-->
                                                </div>
                                                <div class="text-1xl mt-1 italic line-height-3">"{{ s.text }}"</div>
                                            </div>
                                        </div>
                                    </div>
                                </p-popover>

                                <i
                                    *ngIf="order.status === OrderStatus.CANCELLED || order.status === OrderStatus.FAILED"
                                    class="pi pi-thumbs-down-fill cursor-pointer p-1"
                                    [style.color]="order.signalText ? '#22c55e' : '#f59e0b'"
                                    [pTooltip]="order.signalText ? order.signalText : ('Uncorrect_signal' | translate)"
                                    tooltipPosition="top"
                                    (click)="$event.stopPropagation(); onSignalPopShow(order); signalOp.toggle($event)"
                                ></i>

                                <p-popover #signalOp [style]="{ width: '380px' }">
                                    <div class="p-3">
                                        <div class="flex align-items-center justify-content-between border-bottom-1 pb-2 mb-3 surface-border">
                                            <div class="flex align-items-center gap-2 font-bold" [style.color]="order.signalText ? '#22c55e' : '#f59e0b'">
                                                <i class="pi pi-thumbs-down-fill"></i>
                                                <span>{{ 'Uncorrect_signal' | translate }}</span>
                                            </div>
                                            <i class="pi pi-times cursor-pointer text-500 hover:text-900" (click)="signalOp.hide()"></i>
                                        </div>
                                        <div class="mb-3">
                                            <textarea
                                                pInputTextarea
                                                [(ngModel)]="signalText"
                                                rows="4"
                                                [autoResize]="false"
                                                [disabled]="!!order.signalText"
                                                class="w-full p-2 border-round border-1 surface-border"
                                                style="width: 100% !important; resize: none; box-sizing: border-box;"
                                                [placeholder]="'Add_note...' | translate"
                                            ></textarea>
                                        </div>
                                        <div class="flex justify-end gap-2">
                                            <p-button [label]="'Cancel' | translate" [text]="true" severity="secondary" (onClick)="signalOp.hide()"></p-button>
                                            <p-button *ngIf="!order.signalText" [label]="'Send' | translate" icon="pi pi-send" [loading]="isSendingSignal" severity="warn" (onClick)="sendSignal(order, signalOp)"></p-button>
                                        </div>
                                    </div>
                                </p-popover>
                            </div>
                        </div>
                    </td>

                    <td>
                        <span
                            style="
        display: inline-block;
        padding: 2px 10px;
        font-size: 12px;
        font-weight: 600;
        color: #4a5568;
        background-color: #edf2f7;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    "
                        >
                            {{ order?.site?.name ?? order.site.url }}
                        </span>
                    </td>
                    <!--                    <td>-->
                    <!--                        <p-tag [severity]="item.confirmed ? 'success' : 'danger'" [value]="(item.confirmed ? 'CONFIRMED' : 'WAITING') | translate" [rounded]="true"> </p-tag>-->
                    <!--                    </td>-->

                    <!--                    <td [pTooltip]="order.customerAgent">{{ order.customerAgent.slice(0, 50) }}</td>-->
                    <!--                    <td [pTooltip]="order.customerIp">{{ order.customerIp.slice(0, 10) }}</td>-->
                    <td>
                        <div class="flex align-items-center gap-1 flex-col" *ngIf="listService.getCourierType(item) as courierInfo">
                            <img
                                style="width: 80px;"
                                *ngIf="courierInfo.courierName"
                                [src]="listService.courierLogos[courierInfo.courierName]"
                                [alt]="courierInfo.courierName"
                                class="w-8rem border-round shadow-1"
                                [pTooltip]="courierInfo.mode | translate"
                                tooltipPosition="top"
                            />

                            <p-tag *ngIf="courierInfo.mode" [value]="courierInfo.mode | translate" [severity]="courierInfo.mode === 'ADDRESS' ? 'info' : 'secondary'" class="text-xs animate-width"> </p-tag>
                        </div>
                    </td>
                    <td class="vertical-align-middle">
                        <div *ngIf="order.wayBillShipmentNumber" class="flex align-items-center gap-2 " style="min-height: 32px; align-items: center;display: flex; flex-direction: column;">
                            <!--                            <a [href]="order.wayBillUrl" target="_blank" class="no-underline flex align-items-center">-->
                            <button
                                pButton
                                class="p-button-rounded p-button-text p-button-sm font-bold w-auto"
                                style="height: 1.8rem; padding: 0 6px;"
                                [pTooltip]="'Принтирай всички (A6)'"
                                (click)="$event.stopPropagation(); handlePrint(order, undefined, 'A6', order.parcelIds)"
                            >
                                <div class="flex align-items-center gap-1">
                                    <i class="pi pi-file-pdf" style="font-size: 0.8rem"></i>
                                    <span style="font-size: 11px">A6</span>
                                </div>
                            </button>
                            <!--                            <p-tag-->
                            <!--                                severity="info"-->
                            <!--                                [pTooltip]="'Print_Waybill' | translate"-->
                            <!--                                tooltipPosition="top"-->
                            <!--                                styleClass="cursor-pointer hover:shadow-2 transition-all"-->
                            <!--                                (click)="$event.stopPropagation(); handlePrint(order)"-->
                            <!--                                [style]="{-->
                            <!--                                    padding: '4px 10px',-->
                            <!--                                    'border-radius': '6px',-->
                            <!--                                    'font-family': 'monospace',-->
                            <!--                                    'font-size': '14px',-->
                            <!--                                    display: 'flex',-->
                            <!--                                    'align-items': 'center',-->
                            <!--                                    height: '28px'-->
                            <!--                                }"-->
                            <!--                            >-->
                            <!--                                <div class="flex align-items-center gap-2">-->
                            <!--                                    <i class="pi pi-ticket text-xs"></i>-->
                            <!--                                    <span>{{ order.wayBillShipmentNumber }}</span>-->
                            <!--                                </div>-->
                            <!--                            </p-tag>-->
                            <!--                            </a>-->

                            <p-button
                                icon="pi pi-map"
                                [rounded]="true"
                                [text]="true"
                                severity="secondary"
                                [pTooltip]="'Track' | translate"
                                styleClass="p-0 w-2rem h-2rem flex align-items-center justify-content-center"
                                (onClick)="$event.stopPropagation(); handleTrack(order)"
                            >
                            </p-button>

                            <i
                                *ngIf="order.courierHistory?.length"
                                class="pi pi-history text-blue-500 cursor-pointer hover:text-blue-800 transition-colors"

                                (click)="$event.stopPropagation(); opHistory.toggle($event)"
                            >
                            </i>

                            <p-popover #opHistory styleClass="centered-popover">
                                <div class="popover-content-scroll">
                                    <div class="flex align-items-center justify-content-between border-bottom-1 surface-border pb-2 mb-3">
                                        <div class="flex align-items-center gap-2">
                                            <i class="pi pi-truck text-primary"></i>
                                            <span class="font-bold text-900">Хронология на доставката</span>
                                        </div>
                                        <i class="pi pi-times cursor-pointer text-500 hover:text-900" (click)="opHistory.hide()"></i>
                                    </div>

                                    <p-timeline [value]="order.courierHistory" layout="vertical" styleClass="history-timeline">
                                        <ng-template pTemplate="marker" let-event>
                <span
                    class="border-circle flex align-items-center justify-content-center shadow-1"
                    [style.background-color]="getTimelineColor(event.statusDescription)"
                    style="width: 12px; height: 12px; border: 2px solid white;"
                ></span>
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

                        <span *ngIf="!order.wayBillShipmentNumber" class="text-400">-</span>
                    </td>
                    <td>
                        <!--                        <i class="pi pi-credit-card mr-2 text-color-secondary"></i>-->
                        <!--                        {{ getPaymentLabel(order.paymentMethod) | translate }}-->
                        <img *ngIf="paymentIcons[order.paymentMethod]" [src]="paymentIcons[order.paymentMethod]" [alt]="order.paymentMethod" style="width: 5rem; height: auto; object-fit: contain;" class="shadow-1 border-round-sm" />
                    </td>
                    <td>
                        <p-tag severity="success" value="{{ order.totalPrice }} {{ order.currency }}" />
                    </td>

                    <td>
                        <div class="flex gap-2">
                            <p-button icon="pi pi-truck" [rounded]="true" [text]="true" severity="info" [pTooltip]="'Generate_Waybill' | translate" (onClick)="openShipmentDialog(order)"></p-button>
                            <div class="relative" *ngIf="order.wayBillShipmentNumber">
                                <p-button icon="pi pi-truck" [rounded]="true" [text]="true" severity="danger" [pTooltip]="'Cancel_Waybill' | translate" (onClick)="onCancelShipment($event, order)"></p-button>
                                <i class="pi pi-times absolute text-xs font-bold text-red-700" style="top: 20%; right: 20%; pointer-events: none;"></i>
                            </div>

                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" (onClick)="detailService.openEditDialog(item)"></p-button>
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="onDelete(item.id)"></p-button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
        <site-detail *ngIf="config?.data?.mode !== 'lookup'"></site-detail>
        <!--        <shipment-detail></shipment-detail>-->
        <shipment-detail *ngIf="config?.data?.mode !== 'lookup'"></shipment-detail>
        <p-blockUI [blocked]="listService.blockUI">
            <div class="flex flex-column align-items-center" style="position:absolute; top:50%; left:50%; transform: translate(-50%, -50%)">
                <i class="pi pi-spin pi-spinner text-6xl text-white"></i>
                <span class="text-white mt-2 font-bold">Синхронизиране...</span>
            </div>
        </p-blockUI>

        <style>
            /* 1. Скрол в съдържанието */
            .popover-content-scroll {
                max-height: 80vh; /* По-гъвкаво спрямо екрана */
                overflow-y: auto;
                min-width: 420px;
                padding-right: 10px; /* Място за скролбара */
            }

            /* 2. Центриране и Модален ефект */
            ::ng-deep .centered-popover.p-popover {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: 0 0 0 100vw rgba(0, 0, 0, 0.5) !important; /* По-плътно затъмняване */
                z-index: 1102 !important; /* Над стандартните елементи */
            }

            /* Премахваме стрелката */
            ::ng-deep .centered-popover.p-popover::before,
            ::ng-deep .centered-popover.p-popover::after {
                display: none !important;
            }

            /* Скролбар стилизация */
            .popover-content-scroll::-webkit-scrollbar {
                width: 6px;
            }
            .popover-content-scroll::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 10px;
            }


            ::ng-deep .history-timeline {
                .p-timeline-event-opposite {
                    display: none !important; /* Спестява място */
                }
                .p-timeline-event-content {
                    padding: 0 1rem 0 1rem !important;
                }
                .p-timeline-event-connector {
                    background-color: #e2e8f0 !important;
                    width: 2px !important;
                }
            }
            .has-paid-color {
                background-color: #ffdcec !important; /* Светло кремаво/жълто */
                /*border-left: 4px solid #facc15; !* Добавяме и жълта ивица отляво за акцент *!*/
                border-left: 4px solid #ffdcec; /* Добавяме и жълта ивица отляво за акцент */
            }
        </style>
    `,
    providers: [OrderListService]
})
export class OrderListComponent implements OnInit, OnDestroy {
    public listService = inject(OrderListService);
    public detailService = inject(OrderDetailService);
    private tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });


    rows = 50;

    selectedItem!: IOrder[] | null;
    protected lastParams: any = { first: 0, rows: this.rows, filters: {} };

    // onLazyLoad(event: any) {
    //     const filters = { ...event.filters };
    //
    //     this.listService.loadList(event.first, event.rows, filters);
    //     this.lastParams = { first: event.first, rows: event.rows, filters: filters };
    // }

    onLazyLoad(event: any) {
        let filters = { ...event.filters };

        // Прилагаме филтъра за статус
        if (this.selectedStatus && !filters['status']) {
            filters['status'] = { value: this.selectedStatus, matchMode: 'equals' };
        }

        if (this.config?.data?.filterPhone) {
            // Налагаме филтъра по телефон, за да не го изгубим при смяна на страница
            filters = [];
            filters['phone'] = { value: this.config.data.filterPhone, matchMode: 'equals' };

        }

        // Важно: Подаваме новия размер към сървиса
        this.listService.loadList(event.first, this.lastParams.rows, filters);

        this.lastParams.first = event.first;
        this.lastParams.filters = filters;
        this.listService.loadStatusStats();

        this.cdr.detectChanges(); // Форсираме UI да види новия брой редове
    }

    onDelete(id: any) {
        if (confirm(this.tr.instant('Are_you_sure?'))) {
            this.listService.deleteItem(id);
        }
    }

    constructor() {
        // this.syncCategories(1);
        this.generateStatusOptions();
    }

    private wsService = inject(WebSocketService);
    private destroy$ = new Subject<void>();
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    private cdr = inject(ChangeDetectorRef);
    ngOnInit(): void {

        this.lastParams.filters = {
            'status': { value: OrderStatus.PROCESSING, matchMode: 'equals' }
        };

        this.wsService
            .listen('orders')
            .pipe(takeUntil(this.destroy$))
            .subscribe((msg) => {
                // 1. Използваме setTimeout, за да излезем от текущия цикъл на проверка
                setTimeout(() => {
                    // Проверяваме логиката - заключваме само ако прозорецът е отворен (според твоите изисквания)
                    if (this.shipmentService.visible) {
                        this.listService.blockUI = true;
                        // 2. Насилствено караме Angular да отрази промяната веднага
                        this.cdr.detectChanges();
                    }

                    // 3. Изчакваме 2 секунди и рефрешваме
                    setTimeout(() => {
                        this.reload();
                        this.listService.blockUI = false;
                        this.cdr.detectChanges();
                    }, 2000);
                });
            });
    }

    public reload() {
        // Вече lastParams.filters съдържа и статуса, и търсенето, и страницата
        this.listService.loadList(
            this.lastParams.first,
            this.lastParams.rows,
            this.lastParams.filters
        );
        this.listService.loadStatusStats();
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
            case OrderStatus.COMPLETED:
            case OrderStatus.APPROVED:
                return 'success'; // Зелено
            // case OrderStatus.PENDING:   return 'secondary'; // Сиво
            case OrderStatus.ABANDONED:
                return 'info'; // Синьо-сиво
            case OrderStatus.SENT:
                return 'warn'; // Оранжево
            // case OrderStatus.REFUNDED:  return 'danger';    // Червено
            case OrderStatus.CANCELLED:
                return 'contrast'; // Черно
            case OrderStatus.FAILED:
                return 'danger';
            default:
                return 'secondary';
        }
    }
    public getStatusLabel(status: any): string {
        // Проверяваме дали статусът съществува в нашия Enum
        const key = status as OrderStatus;
        return this.statusLabels[key] || 'STATUS.UNKNOWN';
    }

    protected statusOptions: any[] = [];
    // private generateStatusOptions() {
    //     // Взимаме статусите от твоя Enum и ги правим на обекти за избор
    //     this.statusOptions = Object.keys(OrderStatus)
    //         .filter(key => isNaN(Number(key)))
    //         .map(key => ({
    //             label: this.statusLabels[OrderStatus[key as keyof typeof OrderStatus] as OrderStatus],
    //             value: OrderStatus[key as keyof typeof OrderStatus]
    //         }));
    // }
    private generateStatusOptions() {
        const allOption = { label: 'All', value: null }; // Опция за изчистване на филтъра

        const options = Object.keys(OrderStatus)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                label: this.statusLabels[OrderStatus[key as keyof typeof OrderStatus] as OrderStatus],
                value: OrderStatus[key as keyof typeof OrderStatus]
            }));

        this.statusOptions = options; // За dropdown-а в таблицата
        this.statusFilterOptions = [allOption, ...options]; // За бутоните отгоре
    }

    // Увери се, че параметрите имат точните типове
    isNewDay(currentOrder: IOrder, index: number): boolean {
        // 1. Проверка дали текущият ред е първи
        if (index === 0) return true;

        const items = this.listService.items();

        // 2. ЗАЩИТА: Проверка дали списъкът съществува и дали елементите са дефинирани
        if (!items || !items[index] || !items[index - 1]) {
            return false;
        }

        const current = this.asCast(items[index]);
        const previous = this.asCast(items[index - 1]);

        // 3. ЗАЩИТА: Проверка дали самото поле createTime съществува
        if (!current.wpOrderTime || !previous.wpOrderTime) {
            return false;
        }

        // Сравнение на датите
        const d1 = new Date(current.wpOrderTime).toDateString();
        const d2 = new Date(previous.wpOrderTime).toDateString();

        return d1 !== d2;
    }

    isNewShipmentDay(currentOrder: IOrder, index: number): boolean {
        if (index === 0) return true;

        const items = this.listService.items();
        const current = items[index];
        const previous = items[index - 1];

        // Помощна функция за вземане на дата от историята
        const getCourierDate = (order: IOrder) => {
            if (order.courierHistory && order.courierHistory.length > 0) {
                // Вземаме първото събитие (създаването)
                return new Date(order.courierHistory[0].eventTime).toDateString();
            }
            // Fallback ако историята още не е заредена
            return order.updateTime ? new Date(order.updateTime).toDateString() : new Date(order.wpOrderTime).toDateString();
        };

        return getCourierDate(current) !== getCourierDate(previous);
    }

    isNewCompletedDay(currentOrder: IOrder, index: number): boolean {
        if (index === 0) return true;

        const items = this.listService.items();
        const current = items[index];
        const previous = items[index - 1];

        const getDeliveryDate = (order: IOrder) => {
            // 1. ЗАЩИТА: Ако по някаква причина поръчката липсва, връщаме празна дата
            if (!order) return '';

            // 2. Проверка на историята с Optional Chaining (?.)
            if (order.courierHistory && order.courierHistory.length > 0) {
                const lastIndex = order.courierHistory.length - 1;
                const lastEvent = order.courierHistory[lastIndex];

                // Проверка дали самият запис в историята има време
                if (lastEvent && lastEvent.eventTime) {
                    return new Date(lastEvent.eventTime).toDateString();
                }
            }

            // 3. Fallback към updateTime или wpOrderTime
            const fallbackDate = order.updateTime || order.wpOrderTime;
            return fallbackDate ? new Date(fallbackDate).toDateString() : '';
        };

        return getDeliveryDate(current) !== getDeliveryDate(previous);
    }

    protected selectedStatus: string | null = OrderStatus.PROCESSING; // Държи текущия филтър
    protected statusFilterOptions: any[] = [];

    onStatusFilterChange(value: any) {
        this.selectedStatus = value; // Запазваме локално за UI-то

        // Обновяваме филтрите в lastParams
        const newFilters = { ...this.lastParams.filters };

        if (value !== null) {
            newFilters['status'] = { value: value, matchMode: 'equals' };
        } else {
            delete newFilters['status']; // Ако е "All", махаме филтъра
        }

        // Връщаме на първа страница при смяна на филтър
        this.lastParams.first = 0;
        this.lastParams.filters = newFilters;

        const smallPageStatuses = [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.ABANDONED];

        if (this.selectedStatus === null || smallPageStatuses.includes(this.selectedStatus as OrderStatus)) {
            this.lastParams.rows = 20;
        } else {
            this.lastParams.rows = 50; // Връщаме на 50 за останалите
        }

        this.listService.loadList(0, this.lastParams.rows, newFilters);
        this.listService.loadStatusStats();
    }

    getStatusColor(status: string): string {
        // const severity = this.getStatusSeverity(status);
        return this.statusColorMap[status] || '#94A3B8';
        // switch (severity) {
        //     case 'success': return '#22C55E';
        //     case 'info': return '#3B82F6';
        //     case 'warn': return '#F59E0B';
        //     case 'danger': return '#EF4444';
        //     case 'contrast': return '#334155';
        //     default: return '#94A3B8';
        // }
    }

    private readonly statusColorMap: Record<string, string> = {
        [OrderStatus.PROCESSING]: '#808080', // Чакаща - Сиво
        [OrderStatus.ABANDONED]: '#94a3b8', // Изоставена - Синьо-сиво
        [OrderStatus.SENT]: '#e67e22', // Изпратена - Оранжево
        [OrderStatus.COMPLETED]: '#3a9d00', // Завършена - Зелено
        [OrderStatus.APPROVED]: '#3a9d00', // Завършена - Зелено
        // [OrderStatus.REFUNDED]: '#d90000',   // Върната - Червено
        [OrderStatus.CANCELLED]: '#000000', // Отказана - Черно
        [OrderStatus.JOINT]: '#e6ef61',
        [OrderStatus.FAILED]: '#ff0000'
    };

    public totalAmount = computed(() => {
        const items = this.listService.items();
        if (!items || items.length === 0) return 0;

        return items.reduce((acc, order) => acc + (Number(order.totalPrice) || 0), 0);
    });

    public itemsCount = computed(() => {
        return this.listService.items().length;
    });

    filterByCustomer(phone: string) {
        this.dialogService.open(OrderListComponent, {
            header: this.tr.instant('Customer') + ': ' + phone,
            width: '90%',
            height: '80%',
            closable: true,
            dismissableMask: true,
            data: {
                mode: 'lookup',
                filterPhone: phone
            }
        });
    }

    // Променлива за свързване с търсачката в HTML
    protected searchValue: string = '';
    private searchTimeout: any;

    /**
     * Основен метод за търсене (вика се от input в HTML)
     */
    onSearch(event: any) {
        // Взимаме стойността независимо дали е събитие или директен низ
        const value = event?.target?.value !== undefined ? event.target.value : event;
        this.executeSearch(value);
    }

    /**
     * Изчистване на търсенето (вика се от иконата "X")
     */
    clearSearch() {
        this.searchValue = '';
        this.executeSearch('');
    }

    /**
     * Логика за изпълнение на търсенето със закъснение (Debounce)
     * Предотвратява флуд към базата данни при всяко натискане на клавиш.
     */
    private executeSearch(value: string) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            // Копираме текущите филтри, за да не загубим избрания статус
            let filters = { ...this.lastParams.filters };

            if (value && value.trim() !== '') {
                filters = {};
                // 'customer' е името на параметъра, който Java-та ще очаква
                filters['customer'] = { value: value.trim(), matchMode: 'contains' };
            } else {
                // Ако няма текст, премахваме глобалния филтър
                delete filters['customer'];
            }

            // Винаги връщаме на страница 0 (първа), когато правим ново търсене
            this.listService.loadList(0, this.lastParams.rows, filters);
            this.listService.loadStatusStats();

            // Обновяваме локалното състояние
            // this.lastParams.filters = filters;
            this.lastParams.filters = {...this.lastParams.filters};
            this.lastParams.first = 0;
        }, 400); // 400ms е златната среда за изчакване
    }

    // В OrderListComponent
    protected paymentIcons: Record<string, string> = {
        [PaymentMethod.COD]: 'assets/payment/cod_bg.png', // Пример за Наложен платеж
        [PaymentMethod.STRIPE]: 'https://p1.hiclipart.com/preview/110/429/95/visa-mastercard-logo-credit-card-payment-card-number-atm-card-automated-teller-machine-mousepad-computer-accessory-circle-png-clipart.jpg', // Stripe
        [PaymentMethod.PAYPAL]: 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg',
        [PaymentMethod.STRIPE_CC]: 'https://image.similarpng.com/file/similarpng/very-thumbnail/2020/06/Logo-google-pay-vector-PNG.png',
        [PaymentMethod.STRIPE_APPLEPAY]: 'https://toppng.com/uploads/preview/apple-pay-logo-png-11536003336zy6omnlwgf.png'
        // Добави останалите си методи тук
    };

    private shipmentService = inject(ShipmentService);
    openShipmentDialog(order: IOrder) {
        this.listService.openShipmentDialog(order);
    }

    handleTrack(order: IOrder, id?: string) {
        // let courierType = this.listService.getCourierType(order);

        if (order.courierType === CourierType.ECONT) {
            const econtTrackUrl = `https://www.econt.com/services/track-shipment/${order.wayBillShipmentNumber}`;
            window.open(econtTrackUrl, '_blank');
        } else if (order.courierType === CourierType.SPEEDY) {
            const speedyTrackUrl = `https://www.speedy.bg/bg/track-shipment?shipmentNumber=${id ?? order.wayBillShipmentNumber}`;
            window.open(speedyTrackUrl, '_blank');
        } else if (order.courierType.toString() === 'BOXNOW' || order.courierType === CourierType.BOX_NOW) {
            const boxNowTrackUrl = `https://www.boxnow.bg/?track=${order.parcelIds[0]}`;
            window.open(boxNowTrackUrl, '_blank');
        }
    }

    handlePrint(order: IOrder, waybillId?: string, format?: 'A4' | 'A6', waybillIds?: string[]) {
        if (order.courierType === CourierType.ECONT) {
            window.open(order.wayBillUrl, '_blank');
        } else this.listService.printWayBill(order, waybillId ?? waybillIds ?? order.wayBillShipmentNumber.toString(), format ?? 'A6');
    }

    private confirmationService = inject(ConfirmationService);
    onCancelShipment(event: Event, order: IOrder) {
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
            accept: () => {
                this.listService.cancelShipment(order);
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

    formatSignals(signals: any[]): string {
        if (!signals || signals.length === 0) return '';

        return signals
            .map((s, index) => {
                const date = s.createDate ? new Date(s.createDate).toLocaleDateString() : '';
                // Форматираме: "1. [Дата]: Текст на сигнала"
                return `<b>${index + 1}. [${date}]:</b> ${s.text}`;
            })
            .join('<br><br>'); // Двоен ред разстояние между отделните сигнали
    }

    // Помощни променливи за бърза редакция
    protected editableComment: string = '';
    protected isSavingComment: boolean = false;
    protected signalText: string = '';
    protected isSendingSignal: boolean = false;

    onSignalPopShow(order: IOrder) {
        this.signalText = order.signalText || '';
    }

    private messageService = inject(MessageService);

    sendSignal(order: IOrder, popover: any) {
        if (!this.signalText.trim()) return;
        this.isSendingSignal = true;
        this.listService.sendCancelSignal(order.id, this.signalText).subscribe({
            next: () => {
                order.signalText = this.signalText;
                this.isSendingSignal = false;
                popover.hide();
                this.messageService.add({ severity: 'success', summary: this.tr.instant('Notification'), detail: this.tr.instant('Detected_signals') });
            },
            error: () => {
                this.isSendingSignal = false;
            }
        });
    }

    /**
     * При отваряне на попъвъра зареждаме текущия коментар в локалната променлива
     */
    onCommentPopShow(order: IOrder) {
        this.editableComment = order.comment || '';
    }

    /**
     * Запис на коментара директно през сървиса
     */
    saveQuickComment(order: IOrder, popover: any) {
        this.isSavingComment = true;

        // 1. Обновяваме полето в обекта
        order.comment = this.editableComment;

        // 2. Извикваме сървиса за запис
        // Забележка: Тук предполагаме, че updateOrderField в listService връща Observable
        // или директно управляваме затварянето.
        this.listService.updateOrderField(order);

        // 3. Малък delay за визуален ефект на зареждане и затваряне
        setTimeout(() => {
            this.isSavingComment = false;
            popover.hide();
        }, 300);
    }

    trackByOrderId(index: number, item: IOrder): number {
        return item.id; // или item.wpOrderId, стига да е уникално
    }

    getTimelineColor(status: string): string {
        if (!status) return '#94A3B8'; // Сиво по подразбиране (няма статус)

        const s = status.toLowerCase();

        // 1. Успешно приключени (Зелено)
        if (s.includes('доставена') || s.includes('получена') || s.includes('delivered')) {
            return '#22C55E';
        }

        // 2. Проблемни / Анулирани (Червено)
        if (s.includes('анулирана') || s.includes('отказана') || s.includes('canceled') || s.includes('rejected')) {
            return '#EF4444';
        }

        // 3. Връщане към подател (Оранжево)
        if (s.includes('връщане') || s.includes('reclamation') || s.includes('returning')) {
            return '#F59E0B';
        }

        // 4. В движение / Офис (Синьо)
        if (s.includes('приета') || s.includes('път') || s.includes('офис') || s.includes('склад')) {
            return '#3B82F6';
        }

        // Ако е нещо друго (напр. "Подготвена")
        return '#3B82F6';
    }

    hasPaidAddons(order: IOrder): boolean {
        if (!order.orderLine || order.orderLine.length === 0) return false;

        return order.orderLine.some((lineItem) => {
            // Проверяваме структурата: paoIdValue -> първи елемент [0] -> масив value
            const paoContainer = lineItem.paoIdValue && lineItem.paoIdValue[0];
            if (!paoContainer || !Array.isArray(paoContainer.value)) return false;

            return paoContainer.value.some((addon) => {
                // Взимаме цената от rawPrice
                // const price = parseFloat(addon.rawPrice);
                // const isPaid = !isNaN(price) && price > 0;

                // Според твоя JSON, текстът е в полето 'value'
                // Пример: "С ластик 180 х 200 +30см"
                const addonText = addon.value ? addon.value.toLowerCase() : '';

                // Търсим дали НЕ съдържа "без ластик"
                const doesNotHaveElasticLabel = !addonText.includes('без ластик');

                // Връщаме true, само ако е платено И в текста липсва "без ластик"
                return doesNotHaveElasticLabel;
            });
        });
    }

    protected readonly OrderStatus = OrderStatus;
}
