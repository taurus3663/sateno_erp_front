import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { CourierDetailService } from './detail.service';
import { Button, ButtonDirective } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Checkbox } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { CourierType, ICourier} from './interfaces';
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
                                                      [disabled]="!!item.courierType" optionValue="value" class="w-full">
                                            </p-select>
                                        </div>
                                    </div>

                                    <div class="col-span-12 md:col-span-4 flex flex-col gap-4">
                                        <div class="bg-surface-50 p-4 border-round-xl border border-surface-200">
                                            <div class="flex items-center gap-2 mb-4">
                                                <p-checkbox [(ngModel)]="item.active" [binary]="true" inputId="active"></p-checkbox>
                                                <label for="active" class="font-bold">Статус: Активен</label>
                                            </div>

                                            <div class="flex items-center gap-2 mb-4 p-2 bg-yellow-50 border-round border border-yellow-200 shadow-sm">
                                                <p-checkbox [(ngModel)]="item.defaultCourier" [binary]="true" inputId="isDefault"></p-checkbox>
                                                <label for="isDefault" class="font-bold text-yellow-800 cursor-pointer">
                                                    <i class="pi pi-star-fill mr-1"></i> {{'Default' | translate}}
                                                </label>
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
                                <div class="flex flex-col gap-6 py-4" *ngIf="detailService.selectedItem() as item">

                                    <div class="text-sm font-bold uppercase text-primary border-b border-primary pb-1 flex justify-between items-center">
                                        <span>Настройки по методи на доставка</span>
                                        <i class="pi pi-cog animate-spin-slow"></i>
                                    </div>

                                    <div class="flex flex-col gap-5">

                                        <div class="border border-surface-200 border-round-xl overflow-hidden shadow-sm transition-all" [ngClass]="{'border-primary shadow-md': item.office}">
                                            <div class="flex items-center justify-between p-4 bg-surface-50 border-b border-surface-200">
                                                <div class="flex items-center gap-3">
                                                    <p-checkbox [(ngModel)]="item.office" [binary]="true"></p-checkbox>
                                                    <div class="flex flex-col">
                                                        <span class="font-bold text-lg" [ngClass]="{'text-primary': item.office}">До офис</span>
                                                        <small class="text-surface-500">Еконт/Спиди офис</small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div *ngIf="item.office" class="p-4 bg-white animate-fadein">
                                                <div class="grid grid-cols-12 gap-4">
                                                    <div class="col-span-12 md:col-span-6 flex items-center gap-2">
                                                        <p-checkbox [(ngModel)]="item.officeAutoShippingPrice" [binary]="true" inputId="offAuto"></p-checkbox>
                                                        <label for="offAuto" class="font-bold text-sm">Автоматична цена от API</label>
                                                    </div>
                                                    <div class="col-span-12 md:col-span-6 flex items-center gap-2">
                                                        <p-checkbox [(ngModel)]="item.officeFreeShippingPriceMaxBol" [binary]="true" inputId="offFree"></p-checkbox>
                                                        <label for="offFree" class="font-bold text-sm">Безплатна доставка над:</label>
                                                    </div>

                                                    <div class="col-span-12 md:col-span-6 animate-fadein">
                                                        <label class="block text-xs mb-1 text-surface-500 uppercase">Фиксирана цена</label>
                                                        <p-inputNumber [disabled]="!!item.officeAutoShippingPrice" [(ngModel)]="item.officeFixedShippingPrice" mode="currency" [currency]="$any(item.site?.currency)?.code || 'EUR'" locale="bg-BG" class="w-full"></p-inputNumber>
                                                    </div>
                                                    <div class="col-span-12 md:col-span-6 animate-fadein">
                                                        <label class="block text-xs mb-1 text-surface-500 uppercase">Сума за безплатна</label>
                                                        <p-inputNumber [disabled]="!item.officeFreeShippingPriceMaxBol" [(ngModel)]="item.officeFreeShippingPriceMax" mode="currency" [currency]="$any(item.site?.currency)?.code || 'EUR'" locale="bg-BG" class="w-full"></p-inputNumber>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="border border-surface-200 border-round-xl overflow-hidden shadow-sm transition-all" [ngClass]="{'border-primary shadow-md': item.address}">
                                            <div class="flex items-center justify-between p-4 bg-surface-50 border-b border-surface-200">
                                                <div class="flex items-center gap-3">
                                                    <p-checkbox [(ngModel)]="item.address" [binary]="true"></p-checkbox>
                                                    <div class="flex flex-col">
                                                        <span class="font-bold text-lg" [ngClass]="{'text-primary': item.address}">До адрес</span>
                                                        <small class="text-surface-500">Личен или служебен</small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div *ngIf="item.address" class="p-4 bg-white animate-fadein">
                                                <div class="grid grid-cols-12 gap-4">
                                                    <div class="col-span-12 md:col-span-6 flex items-center gap-2">
                                                        <p-checkbox [(ngModel)]="item.addressAutoShippingPrice" [binary]="true" inputId="addrAuto"></p-checkbox>
                                                        <label for="addrAuto" class="font-bold text-sm">Автоматична цена от API</label>
                                                    </div>
                                                    <div class="col-span-12 md:col-span-6 flex items-center gap-2">
                                                        <p-checkbox [(ngModel)]="item.addressFreeShippingPriceMaxBol" [binary]="true" inputId="addrFree"></p-checkbox>
                                                        <label for="addrFree" class="font-bold text-sm">Безплатна доставка над:</label>
                                                    </div>

                                                    <div class="col-span-12 md:col-span-6 animate-fadein">
                                                        <label class="block text-xs mb-1 text-surface-500 uppercase">Фиксирана цена</label>
                                                        <p-inputNumber [disabled]="!!item.addressAutoShippingPrice" [(ngModel)]="item.addressFixedShippingPrice" mode="currency" [currency]="$any(item.site?.currency)?.code || 'EUR'" locale="bg-BG" class="w-full"></p-inputNumber>
                                                    </div>
                                                    <div class="col-span-12 md:col-span-6 animate-fadein">
                                                        <label class="block text-xs mb-1 text-surface-500 uppercase">Сума за безплатна</label>
                                                        <p-inputNumber [disabled]="!item.addressFreeShippingPriceMaxBol" [(ngModel)]="item.addressFreeShippingPriceMax" mode="currency" [currency]="$any(item.site?.currency)?.code || 'EUR'" locale="bg-BG" class="w-full"></p-inputNumber>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="border border-surface-200 border-round-xl overflow-hidden shadow-sm transition-all" [ngClass]="{'border-primary shadow-md': item.locker}">
                                            <div class="flex items-center justify-between p-4 bg-surface-50 border-b border-surface-200">
                                                <div class="flex items-center gap-3">
                                                    <p-checkbox [(ngModel)]="item.locker" [binary]="true"></p-checkbox>
                                                    <div class="flex flex-col">
                                                        <span class="font-bold text-lg" [ngClass]="{'text-primary': item.locker}">До автомат (Locker)</span>
                                                        <small class="text-surface-500">Locker / АПС</small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div *ngIf="item.locker" class="p-4 bg-white animate-fadein">
                                                <div class="grid grid-cols-12 gap-4">
                                                    <div class="col-span-12 md:col-span-6 flex items-center gap-2">
                                                        <p-checkbox [(ngModel)]="item.lockerAutoShippingPrice" [binary]="true" inputId="lockAuto"></p-checkbox>
                                                        <label for="lockAuto" class="font-bold text-sm">Автоматична цена от API</label>
                                                    </div>
                                                    <div class="col-span-12 md:col-span-6 flex items-center gap-2">
                                                        <p-checkbox [(ngModel)]="item.lockerFreeShippingPriceMaxBol" [binary]="true" inputId="lockFree"></p-checkbox>
                                                        <label for="lockFree" class="font-bold text-sm">Безплатна доставка над:</label>
                                                    </div>

                                                    <div class="col-span-12 md:col-span-6 animate-fadein">
                                                        <label class="block text-xs mb-1 text-surface-500 uppercase">Фиксирана цена</label>
                                                        <p-inputNumber [disabled]="!!item.lockerAutoShippingPrice" [(ngModel)]="item.lockerFixedShippingPrice" mode="currency" [currency]="$any(item.site?.currency)?.code || 'EUR'" locale="bg-BG" class="w-full"></p-inputNumber>
                                                    </div>
                                                    <div class="col-span-12 md:col-span-6 animate-fadein">
                                                        <label class="block text-xs mb-1 text-surface-500 uppercase">Сума за безплатна</label>
                                                        <p-inputNumber [disabled]="!item.lockerFreeShippingPriceMaxBol" [(ngModel)]="item.lockerFreeShippingPriceMax" mode="currency" [currency]="$any(item.site?.currency)?.code || 'EUR'" locale="bg-BG" class="w-full"></p-inputNumber>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="text-sm font-bold mt-4 uppercase text-primary border-b border-primary pb-1 flex items-center gap-2">
                                        <i class="pi pi-user-edit"></i>
                                        Конфигурация на подателя ({{ item.courierType }})
                                    </div>

                                    <div *ngIf="item.courierType === CourierType.ECONT" class="grid grid-cols-12 gap-4 animate-fadein bg-surface-50 p-4 border-round-xl border border-surface-200">
                                        <div class="col-span-12 md:col-span-6">
                                            <label class="block text-sm font-bold mb-1">Име на агент/фирма</label>
                                            <input pInputText [(ngModel)]="item.config.agentName" class="w-full" />
                                        </div>
                                        <div class="col-span-12 md:col-span-6">
                                            <label class="block text-sm font-bold mb-1">Телефонен номер</label>
                                            <input pInputText [(ngModel)]="item.config.phoneNumber" class="w-full" />
                                        </div>
                                        <div class="col-span-12 md:col-span-4">
                                            <label class="block text-sm font-bold mb-1">Град</label>
                                            <input pInputText [(ngModel)]="item.config.city" class="w-full" />
                                        </div>
                                        <div class="col-span-12 md:col-span-2">
                                            <label class="block text-sm font-bold mb-1">Пощ. код</label>
                                            <input pInputText [(ngModel)]="item.config.postalCode" class="w-full" />
                                        </div>
                                        <div class="col-span-12 md:col-span-6">
                                            <label class="block text-sm font-bold mb-1">Адрес (улица/номер)</label>
                                            <input pInputText [(ngModel)]="item.config.address" class="w-full" />
                                        </div>
                                        <div class="col-span-12 md:col-span-6">
                                            <label class="block text-sm font-bold mb-1">Код на договор (cdPayOptionsTemplate)</label>
                                            <input pInputText [(ngModel)]="item.config.cdPayOptionsTemplate" class="w-full" placeholder="напр. CD257894" />
                                        </div>
                                    </div>

                                    <div *ngIf="item.courierType === CourierType.SPEEDY" class="grid grid-cols-12 gap-4 animate-fadein bg-surface-50 p-4 border-round-xl border border-surface-200">
                                        <div class="col-span-12 md:col-span-6">
                                            <label class="block text-sm font-bold mb-1">Име на агент</label>
                                            <input pInputText [(ngModel)]="item.config.agentName" class="w-full" />
                                        </div>
                                        <div class="col-span-12 md:col-span-6">
                                            <label class="block text-sm font-bold mb-1">Телефон</label>
                                            <input pInputText [(ngModel)]="item.config.phoneNumber" class="w-full" />
                                        </div>
                                    </div>

                                    <div *ngIf="item.courierType === CourierType.BOX_NOW" class="grid grid-cols-12 gap-4 animate-fadein bg-surface-50 p-4 border-round-xl border border-surface-200">
                                        <div class="col-span-12 md:col-span-4">
                                            <label class="block text-sm font-bold mb-1">Име на агент</label>
                                            <input pInputText [(ngModel)]="item.config.agentName" class="w-full" />
                                        </div>
                                        <div class="col-span-12 md:col-span-4">
                                            <label class="block text-sm font-bold mb-1">Телефон</label>
                                            <input pInputText [(ngModel)]="item.config.phoneNumber" class="w-full" />
                                        </div>
                                        <div class="col-span-12 md:col-span-4">
                                            <label class="block text-sm font-bold mb-1">Имейл</label>
                                            <input pInputText [(ngModel)]="item.config.mail" class="w-full" />
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

    constructor(private cdr: ChangeDetectorRef) {
        effect(() => {
            const item = this.detailService.selectedItem();
            if (item) {
                // 1. Гарантираме, че config съществува, без да затриваме стария
                item.config = item.config || {};

                // 2. Попълваме дефолтни стойности само за липсващите полета (Nullish Coalescing)
                item.config.address = item.config.address ?? '';
                item.config.agentName = item.config.agentName ?? '';
                item.config.city = item.config.city ?? '';
                item.config.companyName = item.config.companyName ?? '';
                item.config.mail = item.config.mail ?? '';
                item.config.phoneNumber = item.config.phoneNumber ?? '';
                item.config.postalCode = item.config.postalCode ?? '';
                item.config.cdPayOptionsTemplate = item.config.cdPayOptionsTemplate ?? '';
            }
        });
    }

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
