import { Component, inject } from '@angular/core';
import { CourierDetailService } from './detail.service';
import { Button } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Checkbox } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { CourierType } from './interfaces';

@Component({
    selector: `courier-detail`,
    standalone: true,
    imports: [Button, TranslatePipe, Dialog, InputText, FormsModule, NgIf, Checkbox, Select],
    template: `
        <p-dialog [breakpoints]="{ '1199px': '85vw', '575px': '95vw' }" [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ 'min-width': '1000px', 'min-height': '90vh', width: '1000px' }">
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


                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Courier' | translate }}</label>
                        <p-select [options]="courierOptions" [(ngModel)]="item.courierType" optionLabel="label" optionValue="value" class="w-full"> </p-select>
                    </div>

                    <ng-container *ngIf="item.courierType === CourierType.SPEEDY || item.courierType === CourierType.ECONT">
                        <div class="col-span-6">
                            <label class="block font-bold mb-2">Username</label>
                            <input pInputText [(ngModel)]="item.username" class="w-full" />
                        </div>
                        <div class="col-span-6">
                            <label class="block font-bold mb-2">Password</label>
                            <input pInputText type="password" [(ngModel)]="item.password" class="w-full" />
                        </div>
                    </ng-container>

                    <ng-container *ngIf="item.courierType === CourierType.BOX_NOW ">
                        <div class="col-span-6">
                            <label class="block font-bold mb-2">API Key</label>
                            <input pInputText [(ngModel)]="item.apikey" class="w-full" />
                        </div>
                        <div class="col-span-6">
                            <label class="block font-bold mb-2">API Secret</label>
                            <input pInputText [(ngModel)]="item.apiSecret" class="w-full" />
                        </div>
                    </ng-container>
                </div>
            </ng-template>

            <ng-template #footer>
                <!--                <div class="flex justify-content-between align-items-center w-full p-2 justify-between">-->
                <div class="flex gap-2 items-end">
                    <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />

                    <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
                </div>
                <!--                </div>-->
            </ng-template>
        </p-dialog>
    `
})
export class CourierDetailComponent {
    protected detailService = inject(CourierDetailService);


    courierOptions = [
        { label: 'Speedy', value: CourierType.SPEEDY },
        { label: 'Econt', value: CourierType.ECONT },
        { label: 'Box Now', value: CourierType.BOX_NOW }
    ];
    protected readonly CourierType = CourierType;
}
