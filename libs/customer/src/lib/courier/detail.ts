import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CourierDetailService } from './detail.service';
import { Button, ButtonDirective } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Checkbox } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { CourierShipmentType, CourierType, ICourier } from './interfaces';

@Component({
    selector: `courier-detail`,
    standalone: true,
    imports: [Button, TranslatePipe, Dialog, InputText, FormsModule, NgIf, Checkbox, Select, NgClass, ButtonDirective],
    template: `
        <p-dialog [breakpoints]="{ '1199px': '85vw', '575px': '95vw' }" [visible]="detailService.isVisible()"
                  (visibleChange)="detailService.closeDetail()" [modal]="true"
                  [style]="{ 'min-width': '1000px', 'min-height': '90vh', width: '1000px' }">
            <!--                        [header]="detailService.selectedItem()?.id ? 'Редакция на потребител #' + detailService.selectedItem()?.id : 'Нов потребител'"
-->
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <!--                        {{ detailService.selectedItem()?.id ? 'Редакция на клиент #' + detailService.selectedItem()?.id : 'Нов клиент' }}-->
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Courier' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Courier' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div class="grid grid-cols-12 gap-4 pt-2" *ngIf="detailService.selectedItem() as item">
                    <div class="col-span-8">
                        <label class="block font-bold mb-2">{{ 'Name' | translate }}</label>

                        <input pInputText [(ngModel)]="item.name" class="w-full" />
                    </div>

                    <div class="col-span-4">
                        <label class="block font-bold mb-2">{{ 'Active' | translate }}</label>

                        <!--                        <input pInputText [(ngModel)]="item.isActive" class="w-full" />-->

                        <p-checkbox [(ngModel)]="item.active" [binary]="true"></p-checkbox>
                    </div>

                    <div class="col-span-4">
                        <label class="block font-bold mb-2">{{ 'Courier' | translate }}</label>
                        <p-select [options]="courierOptions" [(ngModel)]="item.courierType" optionValue="value"
                                  class="w-full">
                            <ng-template #selectedItem let-selectedOption>
                                {{ selectedOption.label | translate }}
                            </ng-template>
                            <ng-template #item let-option>
                                {{ option.label | translate }}
                            </ng-template>
                        </p-select>
                    </div>

                    <div class="col-span-4">
                        <label class="block font-bold mb-2">{{ 'Shipment_type' | translate }}</label>
                        <p-select [options]="courierShipmentOptions" [(ngModel)]="item.courierShipmentType"
                                  optionValue="value" class="w-full">
                            <ng-template #selectedItem let-selectedOption>
                                {{ selectedOption.label | translate }}
                            </ng-template>
                            <ng-template #item let-option>
                                {{ option.label | translate }}
                            </ng-template>
                        </p-select>
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Select_site' | translate }}</label>
                        <div class="p-inputgroup max-w-md">
                            <input pInputText [readonly]="true" [placeholder]="item.site?.name || ('Empty' | translate)"
                                   class="w-90" />
                            <button type="button" pButton icon="pi pi-search" (click)="openParentLookup(item)"
                                    severity="secondary"></button>

                            <button *ngIf="item.site" type="button" pButton icon="pi pi-times" (click)="clearParent(item)"
                                    severity="danger"></button>
                        </div>
                    </div>

                    <ng-container
                        *ngIf="item.courierType === CourierType.SPEEDY || item.courierType === CourierType.ECONT">
                        <div class="col-span-6">
                            <label class="block font-bold mb-2">Username</label>
                            <input pInputText [(ngModel)]="item.username" class="w-full" />
                        </div>
                        <div class="col-span-6">
                            <label class="block font-bold mb-2">Password</label>
                            <input pInputText type="password" [(ngModel)]="item.password" class="w-full" />
                        </div>
                    </ng-container>

                    <ng-container *ngIf="item.courierType === CourierType.BOX_NOW">
                        <div class="col-span-6">
                            <label class="block font-bold mb-2">API Key</label>
                            <input pInputText [(ngModel)]="item.apiKey" class="w-full" />
                        </div>
                        <div class="col-span-6">
                            <label class="block font-bold mb-2">API Secret</label>
                            <input pInputText [(ngModel)]="item.apiSecret" class="w-full" />
                        </div>
                    </ng-container>

                    <div class="col-span-12 flex justify-center mt-2">
                        <p-button label="Тест на връзката" icon="pi pi-bolt"
                                  [severity]="testStatus === 'success' ? 'success' : testStatus === 'error' ? 'danger' : 'info'"
                                  [loading]="isTesting" (onClick)="testConnection(item)"></p-button>
                    </div>
                    <div *ngIf="testMessage" class="col-span-12 text-center mt-1 text-sm font-bold"
                         [ngClass]="{ 'text-green-500': testStatus === 'success', 'text-red-500': testStatus === 'error' }">
                        {{ testMessage }}
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <!--                <div class="flex justify-content-between align-items-center w-full p-2 justify-between">-->
                <div class="flex gap-2 items-end">
                    <p-button label="Отказ" severity="secondary" [text]="true"
                              (onClick)="detailService.closeDetail()" />

                    <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()"
                              (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
                </div>
                <!--                </div>-->
            </ng-template>
        </p-dialog>
    `
})
export class CourierDetailComponent {
    protected detailService = inject(CourierDetailService);

    courierOptions = [
        { label: 'SPEEDY', value: CourierType.SPEEDY },
        { label: 'ECONT', value: CourierType.ECONT },
        { label: 'BOX_NOW', value: CourierType.BOX_NOW }
    ];
    protected readonly CourierType = CourierType;

    courierShipmentOptions = [
        { label: 'OFFICE', value: CourierShipmentType.OFFICE },
        { label: 'ADDRESS', value: CourierShipmentType.ADDRESS },
        { label: 'LOCKER', value: CourierShipmentType.LOCKER }
    ];
    protected readonly CourierShipmentType = CourierShipmentType;

    isTesting = false;
    testMessage = '';
    testStatus: 'none' | 'success' | 'error' = 'none';

    constructor(private cdr: ChangeDetectorRef) {}

    testConnection(item: ICourier) {
        this.isTesting = true;
        this.testStatus = 'none'; // Нулираме цвета
        this.testMessage = ''; // Изчистваме стария текст

        this.detailService.testCourier(item).subscribe({
            next: (res: any) => {
                console.log('Response from server:', res);
                this.isTesting = false;
                this.testStatus = res.success ? 'success' : 'error';
                this.testMessage = res.message; // Тук трябва да се появи текста
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isTesting = false;
                this.testStatus = 'error';
                this.testMessage = 'Грешка при комуникация със сървъра.';
                this.cdr.detectChanges();
            }
        });
    }

    async openParentLookup(item: ICourier) {
        // Отваряме същия списък с категории, но в режим 'lookup'
        const result = await this.detailService.openLookup('site/list', 'Избери родител');

        if (result) {
            item.site = result;
            this.cdr.detectChanges();
        }
    }

    clearParent(item: ICourier) {
        item.site = undefined;
    }
}
