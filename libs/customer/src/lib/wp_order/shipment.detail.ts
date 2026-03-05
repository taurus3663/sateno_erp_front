import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { Drawer } from 'primeng/drawer';
import { TranslatePipe } from '@ngx-translate/core';
import { ShipmentService } from './shipment.service';
import { CourierListService } from '../courier/list.service';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Tooltip } from 'primeng/tooltip';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { CourierType } from '../courier/interfaces';

@Component({
    selector: 'shipment-detail',
    standalone: true,
    imports: [ReactiveFormsModule, Button, Drawer, TranslatePipe, CommonModule, SelectModule, FormsModule, SelectButton, Tooltip, InputText, InputNumber],
    template: `

        <p-drawer [(visible)]="detailService.visible" position="left" [style]="{ width: '30rem' }">

            <ng-template #header>
                <h4>{{ 'Generate_Waybill' | translate }}</h4>

                <h4>#{{ order?.wpOrderId }}</h4>
            </ng-template>

            <div class="p-fluid grid mt-3">
                <div class="col-1 field">
                    <label for="courier" class="font-bold block mb-2">{{ 'Choose' | translate }}</label>
                    <p-select
                        id="courier"
                        [options]="courierListService.items()"
                        [(ngModel)]="this.detailService.selectedCourier"
                        (onChange)="detailService.onCourierChange()"
                        optionLabel="name"
                        placeholder="{{ 'Courier' | translate }}"
                        [showClear]="true"
                        class="w-full"
                    >
                        <ng-template pTemplate="item" let-item>
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-delivery-truck text-primary"></i>
                                <span>{{ item.name }}-{{ item.courierType }}</span>
                            </div>
                        </ng-template>
                    </p-select>
                </div>
            </div>

            <div class="col-12 field mb-4 mt-4" *ngIf="this.detailService.selectedCourier">
                <label class="font-bold block mb-2">{{ 'Delivery_To' | translate }}</label>
                <!--                <p-selectButton [options]="deliveryOptions" [(ngModel)]="deliveryType" optionLabel="label" optionValue="value" class="w-full"></p-selectButton>-->
                <p-selectButton [options]="deliveryOptions" [(ngModel)]="detailService.deliveryType" optionLabel="label"
                                optionValue="value" class="w-full"></p-selectButton>
            </div>

            <div class="field"
                 *ngIf="detailService.selectedCourier && (detailService.deliveryType === 'OFFICE' || detailService.deliveryType === 'LOCKER' || detailService.deliveryType === 'ADDRESS')">
                <label class="font-bold block mb-2">{{ 'City' | translate }}</label>
                <p-select
                    [options]="detailService.cities"
                    [(ngModel)]="detailService.selectedCity"
                    (onChange)="detailService.onCityChange()"
                    (onFilter)="onCitySearch($event)"
                    [filter]="true"
                    [lazy]="true"
                    optionLabel="name"
                    [loading]="detailService.loadingCities"
                    placeholder="{{ 'Type_City_Name' | translate }}"
                    class="w-full"
                >
                    <ng-template pTemplate="item" let-city>
                        <div class="flex justify-content-between">
                            <span>{{ city.name }}</span>
                            <small class="text-secondary">{{ city.postCode }}</small>
                        </div>
                    </ng-template>
                </p-select>
            </div>

            <!--            OFFICE-->
            <div class="field mt-4"
                 *ngIf="detailService.selectedCity && (detailService.deliveryType === 'OFFICE' || detailService.deliveryType === 'LOCKER')">
                <label class="font-bold block mb-2">{{ 'Office' | translate }}</label>
                <p-select
                    [options]="detailService.offices"
                    [(ngModel)]="detailService.selectedOffice"
                    (onFilter)="onOfficeSearch($event)"
                    optionLabel="name"
                    [filter]="true"
                    [lazy]="true"
                    placeholder="{{ 'Choose_Office' | translate }}"
                    class="w-full"
                    [showClear]="true"
                    [loading]="detailService.loadingOffices"
                >
                    <ng-template pTemplate="selectedItem" let-selectedOption>
                        <div class="flex flex-column truncate-text" [pTooltip]="selectedOption?.address"
                             tooltipPosition="top">
                            <span class="font-bold text-sm">{{ selectedOption.address }}</span>
                        </div>
                    </ng-template>

                    <ng-template pTemplate="item" let-office>
                        <div class="flex flex-column" style="max-width: 25rem;" [pTooltip]="office.address"
                             tooltipPosition="top">
                            <span class="font-bold text-sm">{{ office.name }}</span>
                            <small class="text-secondary overflow-ellipsis">{{ office.address }}</small>
                        </div>
                    </ng-template>
                </p-select>
            </div>
            <!-- ADDRESS-->
            <div *ngIf="detailService.selectedCity && detailService.deliveryType === 'ADDRESS'" class="fadein">
<!--                <label class="font-bold block mb-2">{{ 'City' | translate }}</label>-->
<!--                <p-select-->
<!--                    [options]="detailService.cities"-->
<!--                    [(ngModel)]="detailService.selectedCity"-->
<!--                    (onChange)="detailService.onCityChange()"-->
<!--                    (onFilter)="onCitySearch($event)"-->
<!--                    [filter]="true"-->
<!--                    [lazy]="true"-->
<!--                    optionLabel="name"-->
<!--                    [loading]="detailService.loadingCities"-->
<!--                    placeholder="{{ 'Type_City_Name' | translate }}"-->
<!--                    class="w-full"-->
<!--                >-->
<!--                    <ng-template pTemplate="item" let-city>-->
<!--                        <div class="flex justify-content-between">-->
<!--                            <span>{{ city.name }}</span>-->
<!--                            <small class="text-secondary">{{ city.postCode }}</small>-->
<!--                        </div>-->
<!--                    </ng-template>-->
<!--                </p-select>-->

                <div style="width: 90px;">
                    <label class="font-bold block mb-2">{{ 'Post_Code' | translate }}</label>
                    <input pInputText [(ngModel)]="detailService.selectedCity.postCode"
                           class="w-full text-center font-bold" />
                </div>

                <div class="field mt-4">
                    <label class="font-bold block mb-2">{{ 'Street' | translate }}</label>
                    <div class="p-inputgroup">
                        <span class="p-inputgroup-addon"><i class="pi pi-map"></i></span>
                        <input type="text" pInputText [(ngModel)]="detailService.addressStreet"
                               placeholder="{{ 'Street_Name' | translate }} {{'Number' | translate}}"
                               class="w-full p-inputtext-sm" />
                    </div>
                </div>

                <!--                <div class="flex gap-3 mt-4">-->
                <!--                    <div class="field flex-1">-->
                <!--                        <label class="font-bold block mb-2">{{ 'Number' | translate }}</label>-->
                <!--                        <input type="text" pInputText [(ngModel)]="detailService.addressNumber" placeholder="№" class="w-full p-inputtext-sm" />-->
                <!--                    </div>-->
                <!--                    &lt;!&ndash;                    <div class="field flex-1">&ndash;&gt;-->
                <!--                    &lt;!&ndash;                        <label class="font-bold block mb-2">{{ 'Other_Info' | translate }}</label>&ndash;&gt;-->
                <!--                    &lt;!&ndash;                        <input type="text" pInputText [(ngModel)]="detailService.addressOther" placeholder="бл, вх, ап..." class="w-full p-inputtext-sm" />&ndash;&gt;-->
                <!--                    &lt;!&ndash;                    </div>&ndash;&gt;-->
                <!--                </div>-->
            </div>
            <!--    LOCKER        -->
            <div *ngIf="detailService.selectedCity && detailService.deliveryType === 'LOCKER'" class="animate-fadein">
                <div class="p-fluid mt-5" *ngIf="detailService.selectedCourier?.courierType === 'BOX_NOW'">
                    <label class="text-xs font-bold block mb-2 ml-1 text-600">Размер на клетката (BoxNow)</label>
                    <p-select
                        [options]="detailService.boxNowSizes"
                        [(ngModel)]="detailService.selectedBoxNowSize"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Изберете размер"
                        class="w-full shadow-sm"
                        appendTo="body">
                        <ng-template pTemplate="selectedItem" let-selectedOption>
                            <div class="flex align-items-center">
                                <span class="font-bold text-sm">{{ selectedOption.label }}</span>
                            </div>
                        </ng-template>
                    </p-select>

                    <div class="mt-2 p-2 bg-blue-50 border-round text-xs text-blue-700">
                        <i class="pi pi-info-circle mr-1"></i>
                        Максималното тегло за BoxNow е 20кг.
                    </div>
                </div>
            </div>

            <!-- ONLY !==LOCKER-->
            <div *ngIf="detailService.selectedCity && detailService.selectedCourier?.courierType !== 'BOX_NOW'">
                <div>
                    <label class="font-bold block mb-3 mt-3">{{ 'Package_count' | translate }}</label>
                    <p-inputNumber
                        class="w-full"
                        [(ngModel)]="detailService.packCount"
                        [showButtons]="true"
                        buttonLayout="vertical"
                        spinnerMode="horizontal"
                        [min]="1"
                        [max]="(detailService.selectedCourier?.courierType === 'SPEEDY' || detailService.selectedCourier?.courierType === CourierType.SPEEDY) ? 10 : 99"                        inputStyleClass="text-center font-bold border-round-lg"
                        decrementButtonClass="p-button-secondary p-button-outlined"
                        incrementButtonClass="p-button-secondary p-button-outlined"
                        incrementButtonIcon="pi pi-plus"
                        decrementButtonIcon="pi pi-minus"
                    >
                    </p-inputNumber>
                </div>

                <div class="col-12 mt-4" *ngIf="detailService.selectedCourier">
                    <label class="font-bold block mb-3">{{ 'Shipment_Size' | translate }}</label>
                    <div class=" gap-3 p-0">
                        <!-- Weight -->
                        <div class="col-3 md:col-3 field">
                            <label class="text-xs mb-1">{{ 'Weight_kg' | translate }}</label>
                            <p-inputNumber
                                [(ngModel)]="detailService.weight"
                                mode="decimal"
                                [minFractionDigits]="1"
                                [min]="0"
                                [showButtons]="true"
                                buttonLayout="vertical"
                                decrementButtonClass="p-button-secondary"
                                incrementButtonClass="p-button-secondary"
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                                suffix=" кг"
                                class="w-full"
                            ></p-inputNumber>
                        </div>

                        <!-- Length -->
                        <div class="col-6 md:col-3 field">
                            <label class="text-xs mb-1">{{ 'Length_cm' | translate }}</label>
                            <p-inputNumber [(ngModel)]="detailService.length" suffix=" см" [min]="1"
                                           class="w-full"></p-inputNumber>
                        </div>

                        <!-- Width -->
                        <div class="col-6 md:col-3 field">
                            <label class="text-xs mb-1">{{ 'Width_cm' | translate }}</label>
                            <p-inputNumber [(ngModel)]="detailService.width" suffix=" см" [min]="1"
                                           class="w-full"></p-inputNumber>
                        </div>

                        <!-- Height -->
                        <div class="col-6 md:col-3 field">
                            <label class="text-xs mb-1">{{ 'Height_cm' | translate }}</label>
                            <p-inputNumber [(ngModel)]="detailService.height" suffix=" см" [min]="1"
                                           class="w-full"></p-inputNumber>
                        </div>

                        <div class="col-12 field mt-4"
                             *ngIf="detailService.selectedCourier.courierType === CourierType.SPEEDY">
                            <div class="flex align-items-center gap-2 border-1 border-round p-3 surface-50">
                                <input
                                    type="checkbox"
                                    id="fiscalReceipt"
                                    [(ngModel)]="detailService.fiscalReceipt"
                                    class="w-2rem h-2rem cursor-pointer" />
                                <label for="fiscalReceipt" class="font-bold cursor-pointer">
                                    {{ 'Generate_receipt_from_courier' |translate }}
                                </label>
                                <i class="pi pi-info-circle text-primary"
                                   [pTooltip]="'Courier_will_generate_receipt_by_you_while_shipping' | translate"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ng-template #footer>
                <div class="flex gap-2 w-full pt-2 justify-end">
                    <p-button [label]="'Cancel' | translate" severity="warn" [text]="true"
                              (onClick)="detailService.visible = false" />

                    <p-button [disabled]="order?.courierId || order?.wayBillShipmentNumber"
                              [label]="'Generate' | translate" icon="pi pi-check"
                              severity="primary" (onClick)="detailService.createWayBill()"
                              tooltipPosition="top"
                              showDelay="200"
                              [pTooltip]="(order?.wayBillShipmentNumber || order?.courierId) ? ('Shipment_already_generated' | translate) : ''"
                    />
                    <!--                    <p-button [label]="'Generate' | translate" icon="pi pi-check" severity="primary" (onClick)="this.onSave()" />-->
                </div>
            </ng-template>
        </p-drawer>
    `
})
export class ShipmentDetailComponent implements OnInit {
    // private config = inject(DynamicDialogConfig);
    detailService = inject(ShipmentService);
    courierListService = inject(CourierListService);
    private cdr = inject(ChangeDetectorRef);
    // order?: IOrder = this.detailService.selectedOrder; // Тук идва поръчката от родителския компонент

    get order() {
        return this.detailService.selectedOrder;
    }

    ngOnInit(): void {
        this.detailService.setDetector(this.cdr);
        this.courierListService.loadList(0, 100);
    }

    // deliveryType: string = 'OFFICE';
    // Опции за SelectButton
    deliveryOptions = [
        { label: 'До Офис', value: 'OFFICE', icon: 'pi pi-building' },
        { label: 'До Адрес', value: 'ADDRESS', icon: 'pi pi-home' },
        { label: 'Автомат', value: 'LOCKER', icon: 'pi pi-home' }
    ];

    // В ShipmentDetailComponent
    onCitySearch(event: any) {
        const query = event.filter; // Това са буквите, които потребителят е написал
        if (query && query.length >= 2) {
            // Започваме да търсим след втория символ
            this.detailService.loadCities(query);
        }
    }

    // В ShipmentDetailComponent
    onOfficeSearch(event: any) {
        const query = event.filter;
        // Обикновено офисите се филтрират локално, ако вече са заредени,
        // но ако бекендът изисква търсене, викаме сървиса:
        if (query && query.length >= 1) {
            this.detailService.loadOffices(query);
        }
    }

    protected readonly CourierType = CourierType;
}
