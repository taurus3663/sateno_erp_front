import { Component, inject, OnInit } from '@angular/core';
import { Input } from 'postcss';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { IOrder } from './interfaces';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { Drawer } from 'primeng/drawer';
import { TranslatePipe } from '@ngx-translate/core';
import { ShipmentService } from './shipment.service';
import { CourierListService } from '../courier/list.service';
import { CommonModule } from '@angular/common';
import { SelectItem, SelectModule } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { SelectButton } from 'primeng/selectbutton';

@Component({
    selector: 'shipment-detail',
    standalone: true,
    imports: [ReactiveFormsModule, Button, Drawer, TranslatePipe, CommonModule, SelectModule, FormsModule, SelectButton],
    template: `
        <p-drawer [(visible)]="detailService.visible" position="left" [style]="{ width: '30rem' }">
            <ng-template #header>
                <h4>{{ 'Generate_Waybill' | translate }}</h4>

                <h4>#{{ order?.wpOrderId }}</h4>
            </ng-template>

            <div class="p-fluid grid mt-3">
                <div class="col-1 field">
                    <label for="courier" class="font-bold block mb-2">{{ 'Choose' | translate }}</label>
                    <p-select id="courier" [options]="courierListService.items()" [(ngModel)]="selectedCourier" optionLabel="name" placeholder="{{ 'Courier' | translate }}" [showClear]="true" class="w-full">
                        <ng-template pTemplate="item" let-item>
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-delivery-truck text-primary"></i>
                                <span>{{ item.name }}-{{ item.courierType }}</span>
                            </div>
                        </ng-template>
                    </p-select>
                </div>
            </div>

            <div class="col-12 field mb-4 mt-4" *ngIf="selectedCourier">
                <label class="font-bold block mb-2">{{ 'Delivery_To' | translate }}</label>
                <p-selectButton [options]="deliveryOptions" [(ngModel)]="deliveryType" optionLabel="label" optionValue="value" class="w-full"></p-selectButton>
            </div>

            <ng-template #footer>
                <div class="flex gap-2 w-full pt-2 justify-end">
                    <p-button [label]="'Cancel' | translate" severity="warn" [text]="true" (onClick)="detailService.visible = false" />

                    <p-button [label]="'Generate' | translate" icon="pi pi-check" severity="primary" (onClick)="onSave()" />
                </div>
            </ng-template>
        </p-drawer>
    `
})
export class ShipmentDetailComponent implements OnInit {
    // private config = inject(DynamicDialogConfig);
    detailService = inject(ShipmentService);
    courierListService = inject(CourierListService);
    // order?: IOrder = this.detailService.selectedOrder; // Тук идва поръчката от родителския компонент
    selectedCourier: any = null;

    get order() {
        return this.detailService.selectedOrder;
    }

    ngOnInit(): void {
        this.courierListService.loadList(0, 100);
    }

    onSave() {
        // if (this.shipmentForm.valid) {
        //     // this.ref.close(this.shipmentForm.value);
        // }
    }

    deliveryType: string = 'OFFICE';
    // Опции за SelectButton
    deliveryOptions = [
        { label: 'До Офис', value: 'OFFICE', icon: 'pi pi-building' },
        { label: 'До Адрес', value: 'ADDRESS', icon: 'pi pi-home' }
    ];
}
