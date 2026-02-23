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
import { InputNumber } from 'primeng/inputnumber';
import { TabsModule } from 'primeng/tabs';

@Component({
    selector: `courier-detail`,
    standalone: true,
    imports: [
        Button, TranslatePipe, Dialog, InputText, FormsModule,
        NgIf, Checkbox, Select, NgClass, ButtonDirective, InputNumber, TabsModule
    ],
    template: `
        <p-dialog [breakpoints]="{ '1199px': '85vw', '575px': '95vw' }" [visible]="detailService.isVisible()"
                  (visibleChange)="detailService.closeDetail()" [modal]="true"
                  [style]="{ width: '900px' }">

            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <i class="pi pi-truck mr-2 text-primary"></i>
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Courier' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Courier' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div class="pt-2" *ngIf="detailService.selectedItem() as item">

                    <p-tabs value="0">
                        <p-tablist>
                            <p-tab value="0"><i class="pi pi-info-circle mr-2"></i>Общи данни</p-tab>
                            <p-tab value="1"><i class="pi pi-cog mr-2"></i>Конфигурация и Цени</p-tab>
                        </p-tablist>

                        <p-tabpanels>
                            <p-tabpanel value="0">
                                <div class="grid grid-cols-12 gap-6 py-4">
                                    <div class="col-span-12 md:col-span-8 grid grid-cols-12 gap-4">
                                        <div class="col-span-12">
                                            <label class="block font-bold mb-1 text-sm text-surface-600">{{ 'Name' | translate }}</label>
                                            <input pInputText [(ngModel)]="item.name" class="w-full" placeholder="Напр. Еконт Официален" />
                                        </div>
                                        <div class="col-span-12">
                                            <label class="block font-bold mb-1 text-sm text-surface-600">{{ 'Courier' | translate }}</label>
                                            <p-select [options]="courierOptions" [(ngModel)]="item.courierType"
                                                      [disabled]="!!item.id" optionValue="value" class="w-full">
                                            </p-select>
                                        </div>
                                    </div>

                                    <div class="col-span-12 md:col-span-4 flex flex-col gap-4">
                                        <div class="bg-surface-50 p-4 border-round-xl border border-surface-200">
                                            <div class="flex items-center gap-2 mb-4">
                                                <p-checkbox [(ngModel)]="item.active" [binary]="true" inputId="active"></p-checkbox>
                                                <label for="active" class="font-bold">Статус: Активен</label>
                                            </div>
                                            <label class="block font-bold mb-2 text-sm">{{ 'Select_site' | translate }}</label>
                                            <div class="p-inputgroup mb-2">
                                                <input pInputText [readonly]="true" [placeholder]="item.site?.name || ('Empty' | translate)" />
                                                <button type="button" pButton icon="pi pi-search" (click)="openParentLookup(item)" severity="secondary"></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-span-12 grid grid-cols-2 gap-4 bg-surface-50 p-4 border-round-xl">
                                        <div class="col-span-2 text-sm font-bold uppercase text-surface-500 mb-2">Данни за достъп (API)</div>
                                        <ng-container *ngIf="item.courierType === CourierType.SPEEDY || item.courierType === CourierType.ECONT">
                                            <div class="col-span-1">
                                                <label class="block font-bold mb-1 text-sm">Username</label>
                                                <input pInputText [(ngModel)]="item.username" class="w-full" />
                                            </div>
                                            <div class="col-span-1">
                                                <label class="block font-bold mb-1 text-sm">Password</label>
                                                <input pInputText type="password" [(ngModel)]="item.password" class="w-full" />
                                            </div>
                                        </ng-container>
                                        <ng-container *ngIf="item.courierType === CourierType.BOX_NOW">
                                            <div class="col-span-1">
                                                <label class="block font-bold mb-1 text-sm">API Key</label>
                                                <input pInputText [(ngModel)]="item.apiKey" class="w-full" />
                                            </div>
                                            <div class="col-span-1">
                                                <label class="block font-bold mb-1 text-sm">API Secret</label>
                                                <input pInputText [(ngModel)]="item.apiSecret" class="w-full" />
                                            </div>
                                        </ng-container>

                                        <div class="col-span-2 mt-2">
                                            <p-button label="Тест на връзката" icon="pi pi-bolt"
                                                      [severity]="testStatus === 'success' ? 'success' : testStatus === 'error' ? 'danger' : 'info'"
                                                      [loading]="isTesting" (onClick)="testConnection(item)"></p-button>
                                            <span *ngIf="testMessage" class="ml-4 text-sm font-bold"
                                                  [ngClass]="{ 'text-green-600': testStatus === 'success', 'text-red-600': testStatus === 'error' }">
                                                {{ testMessage }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </p-tabpanel>

                            <p-tabpanel value="1">
                                <div class="flex flex-col gap-6 py-4">

                                    <div class="section">
                                        <div class="text-sm font-bold mb-4 uppercase text-primary border-b border-primary pb-1">
                                            Активирани методи на доставка
                                        </div>
                                        <div class="grid grid-cols-3 gap-4">
                                            <div [ngClass]="{'border-primary bg-primary-50': item.office}" class="p-4 border-round border border-surface-200 transition-all cursor-pointer" (click)="item.office = !item.office">
                                                <div class="flex items-center gap-3">
                                                    <p-checkbox [(ngModel)]="item.office" [binary]="true" (click)="$event.stopPropagation()"></p-checkbox>
                                                    <div class="flex flex-col">
                                                        <span class="font-bold">До офис</span>
                                                        <small class="text-surface-500">Еконт/Спиди офис</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div [ngClass]="{'border-primary bg-primary-50': item.address}" class="p-4 border-round border border-surface-200 transition-all cursor-pointer" (click)="item.address = !item.address">
                                                <div class="flex items-center gap-3">
                                                    <p-checkbox [(ngModel)]="item.address" [binary]="true" (click)="$event.stopPropagation()"></p-checkbox>
                                                    <div class="flex flex-col">
                                                        <span class="font-bold">До адрес</span>
                                                        <small class="text-surface-500">Личен или служебен</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div [ngClass]="{'border-primary bg-primary-50': item.locker}" class="p-4 border-round border border-surface-200 transition-all cursor-pointer" (click)="item.locker = !item.locker">
                                                <div class="flex items-center gap-3">
                                                    <p-checkbox [(ngModel)]="item.locker" [binary]="true" (click)="$event.stopPropagation()"></p-checkbox>
                                                    <div class="flex flex-col">
                                                        <span class="font-bold">До автомат</span>
                                                        <small class="text-surface-500">Locker / АПС</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="section grid grid-cols-2 gap-8 bg-surface-50 p-4 border-round-xl border border-surface-200">
                                        <div>
                                            <div class="text-sm font-bold mb-3 uppercase text-surface-600">Ценообразуване</div>
                                            <div class="flex flex-col gap-4">
                                                <div class="flex items-center gap-2">
                                                    <p-checkbox [(ngModel)]="item.autoShippingPrice" [binary]="true" inputId="autoPrice"></p-checkbox>
                                                    <label for="autoPrice" class="font-bold">Автоматична цена (API)</label>
                                                </div>
                                                <div *ngIf="!item.autoShippingPrice" class="pl-6 animate-fadein">
                                                    <label class="block text-sm mb-1">Фиксирана сума за доставка</label>
                                                    <p-inputNumber [(ngModel)]="item.fixedShippingPrice" mode="currency" currency="BGN" locale="bg-BG" styleClass="w-full"></p-inputNumber>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div class="text-sm font-bold mb-3 uppercase text-surface-600">Промоции</div>
                                            <div class="flex flex-col gap-4">
                                                <div class="flex items-center gap-2">
                                                    <p-checkbox [(ngModel)]="item.freeShippingPriceMaxBol" [binary]="true" inputId="freeShipping"></p-checkbox>
                                                    <label for="freeShipping" class="font-bold">Безплатна доставка над:</label>
                                                </div>
                                                <div *ngIf="item.freeShippingPriceMaxBol" class="pl-6 animate-fadein">
                                                    <label class="block text-sm mb-1">Праг на безплатна доставка</label>
                                                    <p-inputNumber [(ngModel)]="item.freeShippingPriceMax" mode="currency" currency="BGN" locale="bg-BG" styleClass="w-full"></p-inputNumber>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div *ngIf="item.office || item.address || item.locker" class="p-4 border-dashed border-2 border-surface-200 border-round-xl">
                                        <div class="text-center text-surface-400 italic">
                                            <i class="pi pi-plus-circle mr-1"></i>
                                            Тук ще се появяват специфични опции за {{ item.courierType }} (напр. начален офис, застраховка и др.)
                                        </div>
                                    </div>
                                </div>
                            </p-tabpanel>
                        </p-tabpanels>
                    </p-tabs>
                </div>
            </ng-template>

            <ng-template #footer>
                <div class="flex gap-2 justify-end border-t border-surface-200 pt-4">
                    <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                    <p-button label="Запис на всички промени" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
                </div>
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
