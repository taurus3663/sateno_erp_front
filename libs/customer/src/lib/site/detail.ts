import { Component, inject } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import { SiteDetailService } from './detail.service';
import { Checkbox } from 'primeng/checkbox';
import { CurrencyListService } from '../currency/list.service';
import { Select } from 'primeng/select';
import { LanguageListService } from '../language/list.service';
import { Tooltip } from 'primeng/tooltip';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { InputNumber } from 'primeng/inputnumber';
import { CourierType } from '../courier/interfaces';

@Component({
    selector: 'site-detail',
    standalone: true,
    imports: [Dialog, Button, InputText, FormsModule, CommonModule, TranslatePipe, Checkbox, Select, Tooltip, Tabs, TabList, Tab, TabPanels, TabPanel, InputNumber],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ width: '1000px', 'min-width': '1000px', 'min-height': '800px' }">
            <!--                        [header]="detailService.selectedItem()?.id ? 'Редакция на потребител #' + detailService.selectedItem()?.id : 'Нов потребител'"
-->
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <!--                        {{ detailService.selectedItem()?.id ? 'Редакция на клиент #' + detailService.selectedItem()?.id : 'Нов клиент' }}-->
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Site' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Site' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div *ngIf="detailService.selectedItem() as item">
                    <p-tabs [value]="0">
                        <p-tablist>
                            <p-tab [value]="0">{{ 'Main' | translate }}</p-tab>
                            <p-tab [value]="1">{{ 'Courier' | translate }}</p-tab>
                        </p-tablist>

                        <p-tabpanels>
                            <p-tabpanel [value]="0">
                                <div class="grid grid-cols-12 gap-4 pt-4">
                                    <div class="col-span-12">
                                        <label class="block font-bold mb-2">{{ 'Name' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.name" class="w-full" />
                                    </div>

                                    <div class="col-span-12">
                                        <label class="block font-bold mb-2">{{ 'Currency' | translate }}</label>

                                        <p-select [options]="currencyService.items()" [(ngModel)]="item.currency" optionLabel="name" placeholder="Избери валута" dataKey="id" class="w-full" />
                                    </div>

                                    <div class="col-span-12">
                                        <label class="block font-bold mb-2">{{ 'Language' | translate }}</label>

                                        <p-select [options]="languageService.items()" [(ngModel)]="item.language" optionLabel="name" placeholder="Избери Език" dataKey="id" class="w-full" />
                                    </div>

                                    <div class="col-span-8">
                                        <label class="block font-bold mb-2">{{ 'Url' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.url" class="w-full" />
                                    </div>

                                    <div class="col-span-4">
                                        <label class="block font-bold mb-2">{{ 'Active' | translate }}</label>
                                        <!--                        <input pInputText [(ngModel)]="item.isActive" class="w-full" />-->
                                        <p-checkbox [(ngModel)]="item.active" [binary]="true"></p-checkbox>
                                    </div>

                                    <div class="col-span-12">
                                        <label class="block font-bold mb-2">{{ 'Consumer_key' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.consumerKey" class="w-full" />
                                    </div>

                                    <div class="col-span-12">
                                        <label class="block font-bold mb-2">{{ 'Consumer_secret' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.consumerSecret" class="w-full" />
                                    </div>

                                    <div class="col-span-12 mt-4">
                                        <label class="block font-bold">{{ 'Order_create_key' | translate }}</label>

                                        <div class="p-inputgroup">
                                            <input pInputText [ngModel]="detailService.selectedItem()?.orderCreateApiKey" readonly placeholder="{{ 'Generate_code' | translate }}" class="w-[calc(100%-5rem)] font-mono" />

                                            <p-button icon="pi pi-refresh" severity="secondary" pTooltip="{{ 'Generate' | translate }}" (onClick)="generateApiKey()"> </p-button>

                                            <p-button icon="pi pi-copy" [disabled]="!detailService.selectedItem()?.orderCreateApiKey" pTooltip="{{ 'Copy' | translate }}" (onClick)="copyKey()"> </p-button>
                                        </div>
                                    </div>
                                </div>
                            </p-tabpanel>
                            <p-tabpanel [value]="1">
                                <div class="pt-4" *ngIf="detailService.selectedItem() as item">
                                    <div class="flex flex-col gap-3">
                                        <div *ngFor="let courier of item.couriers; let i = index" class="mb-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-200">
                                            <div class="grid grid-cols-15 gap-6 items-center">
                                                <div class="col-span-4 flex items-center gap-4">
                                                    <img [src]="getCourierLogo(courier.courierType)" [alt]="courier.name" class="max-w-full max-h-full object-contain" />

                                                    <div class="flex flex-col">
                                                        <span class="font-bold text-gray-800 leading-tight">{{ courier.name }}</span>
                                                        <span class="font-bold text-gray-800 leading-tight">
                                                            {{ (courier.courierShipmentType | translate) || ('Empty' | translate) }}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div class="col-span-3">
                                                    <div class="p-inputgroup h-9" [pTooltip]="'Free_shipping_over' | translate" tooltipPosition="top">
                                                        <span class="p-inputgroup-addon bg-white border-r-0">
                                                            <i class="pi pi-tag text-xs"></i>
                                                        </span>
                                                        <p-inputNumber [disabled]="courier.freeShippingPriceMaxBol == false" [(ngModel)]="courier.freeShippingPriceMax" [placeholder]="'Free_shipping_over' | translate" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" class="w-full h-full text-sm">
                                                        </p-inputNumber>
                                                    </div>
                                                </div>

                                                <div class="col-span-3">
                                                    <div class="p-inputgroup h-9" [pTooltip]="'Fixed_shipping_price' | translate" tooltipPosition="top">
                                                        <span class="p-inputgroup-addon bg-white border-r-0">
                                                            <i class="pi pi-tag text-xs"></i>
                                                        </span>
                                                        <p-inputNumber [disabled]="courier.autoShippingPrice == true" [(ngModel)]="courier.fixedShippingPrice" [placeholder]="'Fixed_shipping_price' | translate" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" class="w-full h-full text-sm">
                                                        </p-inputNumber>
                                                    </div>
                                                </div>

                                                <div class="col-span-2">
                                                    <div class="p-inputgroup h-9" [pTooltip]="'Row' | translate" tooltipPosition="top">
                                                        <span class="p-inputgroup-addon bg-white border-r-0 text-xs font-bold text-gray-400">#</span>
                                                        <p-select [(ngModel)]="courier.sortOrder" [options]="sortOptions" optionLabel="label" optionValue="value" [placeholder]="'Row' | translate" class="w-full h-full "> </p-select>
                                                    </div>
                                                </div>

                                                <div class="col-span-2 flex items-center justify-center gap-4 border-l border-gray-200 pl-4">
                                                    <div class="flex flex-col items-center">
                                                        <span class="text-[9px] uppercase font-bold text-gray-400 mb-1">{{ 'Auto' | translate }}</span>
                                                        <p-checkbox [(ngModel)]="courier.autoShippingPrice" [binary]="true" pTooltip="Автоматична цена"></p-checkbox>
                                                    </div>
                                                    <div class="flex flex-col items-center">
                                                        <span class="text-[9px] uppercase font-bold text-gray-400 mb-1">{{ 'Active' | translate }}</span>
                                                        <p-checkbox [(ngModel)]="courier.active" [binary]="true" pTooltip="Активен за сайта"></p-checkbox>
                                                    </div>
                                                    <div class="flex flex-col items-center">
                                                        <span class="text-[9px] uppercase font-bold text-gray-400 mb-1">{{ 'Active' | translate }}</span>
                                                        <p-checkbox [(ngModel)]="courier.freeShippingPriceMaxBol" [binary]="true" [pTooltip]="'Free_shipping_over' | translate "></p-checkbox>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div *ngIf="!item.couriers!.length" class="text-center py-10 text-gray-400">
                                        <i class="pi pi-truck text-3xl mb-2"></i>
                                        <p>{{ 'There_are_no_configured_couriers_for_this_site.' | translate }}</p>
                                    </div>
                                </div>
                            </p-tabpanel>
                        </p-tabpanels>
                    </p-tabs>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
            </ng-template>
        </p-dialog>
    `
})
export class SiteDetailComponent {
    activeTab: any = 0;
    protected detailService = inject(SiteDetailService);
    protected currencyService = inject(CurrencyListService);
    protected languageService = inject(LanguageListService);
    // private messageService = inject(MessageService);
    // private tr = inject(TranslateService);

    constructor() {
        // Зареждаме всички валути (напр. първите 1000), за да ги има в падащото меню
        // Това се вика веднъж при създаване на компонента
        this.currencyService.loadList(0, 1000);
        this.languageService.loadList(0, 1000);
    }

    // site-detail.component.ts

    generateApiKey() {
        // Генерира уникален низ от типа: "550e8400-e29b-41d4-a716-446655440000"
        const newKey = crypto.randomUUID();

        // Присвояваме го на обекта, който се редактира в момента
        // Увери се, че selectedSite е обвързан с ngModel в шаблона
        this.detailService.selectedItem.update((value) => {
            if (!value) return value;
            return {
                ...value,
                orderCreateApiKey: newKey
            };
        });
    }

    // Помощна функция за копиране
    copyKey() {
        let item = this.detailService.selectedItem();
        if (item && item.orderCreateApiKey) {
            navigator.clipboard.writeText(item.orderCreateApiKey);
            // this.messageService.add({
            //     severity: 'info',
            //     summary: 'info',
            //     detail: 'COPIED!'
            // });
            // Тук можеш да извикаш MessageService на PrimeNG за потвърждение
            // this.messageService.add({severity:'info', summary:'Копирано', detail:'Ключът е в клипборда'});
        }
    }

    getCourierLogo(type: CourierType) {
        const g = 'assets/img/';
        switch (type) {
            case CourierType.BOX_NOW:
                return `${g}boxnow-logo.png`;
            case CourierType.SPEEDY:
                return `${g}speedy-logo.png`;
            case CourierType.ECONT:
                return `${g}econt-logo.png`;
            default:
                return `${g}boxnow1-logo.png`;
        }
    }

    sortOptions = Array.from({ length: 10 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));
}
