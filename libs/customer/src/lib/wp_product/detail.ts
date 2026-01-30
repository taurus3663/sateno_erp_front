import { Component, effect, inject } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { LanguageListService } from '../language/list.service';
import { WpProductDetailService } from './detail.service';
import { IWpImage, IWpProduct, ProductStatus, ProductUnit } from './interfaces';
import { InputNumber } from 'primeng/inputnumber';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Textarea } from 'primeng/textarea';
import { SiteListService } from '../site/list.service';
import { WpBrandListService } from '../wp_brand/list.service';
import { Editor } from 'primeng/editor';
import { MultiSelect } from 'primeng/multiselect';
import { TreeSelect } from 'primeng/treeselect';
import { PrimeTemplate } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ROUTES } from '../api.routes';
import { Tooltip } from 'primeng/tooltip';
import { ProgressBar } from 'primeng/progressbar';
import { IWpAddonValue } from '../wp_addon_value/interfaces';
import { TableModule } from 'primeng/table';
import { Listbox } from 'primeng/listbox';
import { WpAddonListService } from '../wp_addon/list.service';

@Component({
    selector: 'wp_product-detail',
    standalone: true,
    imports: [Dialog, Button, FormsModule, CommonModule, TranslatePipe, Select, InputText, InputNumber, TabPanel, TabPanels, Tabs, TabList, Tab, Editor, TreeSelect, PrimeTemplate, FileUpload, Tooltip, TableModule, Listbox],
    template: `
        <p-dialog [breakpoints]="{ '1199px': '85vw', '575px': '95vw' }" [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ 'min-width': '1000px', 'min-height': '90vh', width: '1000px' }">
            <!--                        [header]="detailService.selectedItem()?.id ? 'Редакция на потребител #' + detailService.selectedItem()?.id : 'Нов потребител'"
-->
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <!--                        {{ detailService.selectedItem()?.id ? 'Редакция на клиент #' + detailService.selectedItem()?.id : 'Нов клиент' }}-->
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Product' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Product' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div *ngIf="detailService.selectedItem() as item">
                    <p-tabs value="0">
                        <p-tablist>
                            <p-tab value="0"><i class="pi pi-info-circle mr-2"></i>{{ 'Main' | translate }}</p-tab>
                            <p-tab value="1"><i class="pi pi-language mr-2"></i>{{ 'Translations' | translate }}</p-tab>
                            <p-tab value="2"><i class="pi pi-money-bill mr-2"></i>{{ 'Prices' | translate }}</p-tab>
                        </p-tablist>

                        <p-tabpanels>
                            <p-tabpanel value="0">
                                <div class="grid grid-cols-12 gap-4 pt-4">
                                    <div class="col-span-3">
                                        <label class="block font-bold mb-2">{{ 'Status' | translate }}</label>
                                        <p-select [options]="productStatus" [(ngModel)]="item.status" optionLabel="label" optionValue="value" class="w-full"></p-select>
                                    </div>

                                    <div class="col-span-12 mt-4">
                                        <label class="block font-bold mb-2 text-900"> <i class="pi pi-images mr-2 text-primary"></i>{{ 'Images' | translate }} </label>

                                        <div class="p-4 border-1 border-surface-200 border-round bg-surface-50 shadow-sm">
                                            <p-fileupload
                                                name="file"
                                                [url]="uploadUrl"
                                                (onUpload)="onUpload($event)"
                                                (onSelect)="onSelectedFiles($event)"
                                                [multiple]="true"
                                                accept="image/*"
                                                mode="advanced"
                                                [auto]="true"
                                                class="w-full"
                                                [chooseLabel]="'Choose' | translate"
                                                [uploadLabel]="'Upload' | translate"
                                                [cancelLabel]="'Cancel' | translate"
                                            >
                                            </p-fileupload>

                                            <div class="grid grid-cols-12 gap-3" *ngIf="item.images?.length">
                                                <div *ngFor="let img of item.images; let i = index" class="col-span-4 md:col-span-2 relative group">
                                                    <div class="border-2 border-round overflow-hidden shadow-1 bg-white relative transition-all duration-200 hover:shadow-4" [ngClass]="img.isTemp ? 'border-primary' : 'border-transparent'">
                                                        <img src="http://192.168.31.232:9494{{ img.localSrc }}" style="width: 130px;height: auto;" class="h-8rem object-cover block cursor-pointer" alt="Product thumbnail" />

                                                        <span *ngIf="img.isTemp" class="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 border-bottom-left-round shadow-1"> {{ 'NEW' | translate }} </span>

                                                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" size="small" pTooltip="{{ 'Remove' | translate }}" (onClick)="removeImage(i)"> </p-button>
                                                            <p-button icon="pi pi-search-plus" severity="secondary" [rounded]="true" size="small" (onClick)="viewImage(img.localSrc)"> </p-button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-span-3">
                                        <label class="block font-bold mb-2">{{ 'Unit' | translate }}</label>
                                        <p-select [options]="productUnit" [(ngModel)]="item.unit" optionLabel="label" optionValue="value" class="w-full"></p-select>
                                    </div>

                                    <div class="col-span-3">
                                        <label class="block font-bold mb-2">{{ 'Quantity' | translate }}</label>
                                        <p-inputNumber [(ngModel)]="item.stockQuantity" class="w-full" styleClass="w-full"></p-inputNumber>
                                    </div>
                                    <div class="col-span-3">
                                        <label class="block font-bold mb-2">{{ 'Weight' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.weight" class="w-full" />
                                    </div>

                                    <div class="col-span-12 mt-3">
                                        <label class="block font-bold mb-2">{{ 'Brand' | translate }}</label>
                                        <p-select [options]="brandLService.items()" [(ngModel)]="item.brand" optionLabel="name" class="w-full"></p-select>
                                    </div>

                                    <div class="col-span-12 mt-3">
                                        <label class="block font-bold mb-2">{{ 'Categories' | translate }}</label>
                                        <p-treeSelect
                                            appendTo="body"
                                            [(ngModel)]="detailService.selectedNodesArray"
                                            [options]="detailService.categoryNodes()"
                                            selectionMode="checkbox"
                                            [propagateSelectionDown]="false"
                                            [propagateSelectionUp]="false"
                                            [metaKeySelection]="false"
                                            (onNodeSelect)="updateCategorySelection()"
                                            (onNodeUnselect)="updateCategorySelection()"
                                            [style]="{ width: '100%', height: '35px' }"
                                            placeholder="{{ 'Select_Categories' | translate }}"
                                        >
                                            <ng-template pTemplate="value" let-value>
                                                <div class="flex items-center gap-1" *ngIf="value && value.length > 0">
                                                    <ng-container *ngFor="let node of value | slice: 0 : 2">
                                                        <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm border border-blue-200">
                                                            {{ $any(node).label }}
                                                        </span>
                                                    </ng-container>
                                                    <span *ngIf="value.length > 2" class="text-sm font-bold text-gray-500 ml-1"> + {{ value.length - 2 }} още </span>
                                                </div>
                                            </ng-template>
                                        </p-treeSelect>
                                    </div>
                                </div>
                            </p-tabpanel>
                            <p-tabpanel value="1">
                                <div class="pt-4">
                                    <ng-container *ngFor="let lang of item.translations">
                                        <div class="grid grid-cols-12 gap-4" *ngIf="lang.language.id === selectedLanguage?.id">
                                            <div class="col-span-12">
                                                <label class="block font-bold mb-2">{{ 'Product_Name' | translate }}</label>
                                                <input pInputText class="w-full" [(ngModel)]="lang.name" />
                                            </div>

                                            <div class="col-span-12">
                                                <label class="block font-bold mb-2">{{ 'Short_Description' | translate }}</label>
                                                <p-editor [style]="{ height: '25vh', 'max-width': 'auto' }" class="w-full" [(ngModel)]="lang.shortDescription"></p-editor>
                                            </div>

                                            <div class="col-span-12">
                                                <label class="block font-bold mb-2">{{ 'Description' | translate }}</label>
                                                <p-editor [style]="{ height: '25vh', 'max-width': 'auto' }" class="w-full" [(ngModel)]="lang.description"></p-editor>
                                            </div>
                                        </div>
                                    </ng-container>
                                </div>
                                <div *ngIf="!selectedLanguage" class="flex flex-column align-items-center justify-content-center p-8 text-gray-400 border-2 border-dashed border-round surface-50">
                                    <i class="pi pi-language text-4xl mb-3"></i>
                                    <span class="text-xl font-medium">{{ 'Please_select_a_language_to_view_or_add_a_translation.' | translate }}</span>
                                </div>
                            </p-tabpanel>
                            <p-tabpanel value="2">
                                <div class="pt-4" *ngIf="selectedSite;">
                                    <div class="grid grid-cols-12 gap-4">
                                        <div class="col-span-4 border-r pr-4">
                                            <label class="block font-bold mb-2">{{ 'Addon_Groups' | translate }}</label>
                                            <p-listbox
                                                [options]="addonService.items()"
                                                [(ngModel)]="this.detailService.selectedAddonGroup"
                                                (onChange)="this.detailService.onAddonGroupChange($event)"
                                                optionLabel="slug"
                                                [disabled]="this.detailService.isLoadingAddonValues()"
                                                [style]="{ width: '100%' }"
                                                [listStyle]="{ 'max-height': '200px' }">
                                                <ng-template pTemplate="item" let-addon>
                                                    <span [pTooltip]="addon.names" class="text-sm">{{ addon.names }}</span>
                                                </ng-template>
                                            </p-listbox>
                                        </div>

                                        <div class="col-span-8">
                                            <label class="block font-bold mb-2">{{ 'Available_Values' | translate }}</label>
                                            <div class="flex flex-wrap gap-2 p-3 border-round bg-surface-50 border-1 border-surface-200" style="min-height: 100px;">


                                                <div *ngIf="this.detailService.isLoadingAddonValues()" class="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                                    <i class="pi pi-spinner pi-spin text-primary" style="font-size: 2rem"></i>
                                                </div>

                                                <div *ngIf="!this.detailService.selectedAddonGroup" class="text-gray-400 italic text-sm">
                                                    {{ 'Select_group_to_see_values' | translate }}
                                                </div>

                                                <p-button
                                                    *ngFor="let val of this.detailService.selectedAddonValues"
                                                    [label]="getValueLabel(val)"
                                                    [pTooltip]="getValueLabel(val)"
                                                    size="small"
                                                    severity="secondary"
                                                    icon="pi pi-plus"
                                                    (onClick)="addValueToSite(val)">
                                                </p-button>

                                                <div *ngIf="this.detailService.selectedAddonGroup && this.detailService.selectedAddonValues.length === 0" class="text-gray-400 italic text-sm">
                                                    {{ 'No_values_found_for_this_group' | translate }}
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-span-12 mt-4">
                                            <div class="flex justify-between items-center mb-2">
                                                <span class="font-bold text-lg"><i class="pi pi-table mr-2"></i>{{ 'Active_Configuration_for' | translate }}: {{ selectedSite.name }}</span>
                                            </div>

                                            <p-table [value]="currentSiteConfigs" [scrollable]="true" scrollHeight="300px" styleClass="p-datatable-sm shadow-1 border-round overflow-hidden">
                                                <ng-template pTemplate="header">
                                                    <tr>
                                                        <th>{{ 'Addon' | translate }}</th>
                                                        <th class="text-center">{{ 'Price_Modifier' | translate }}</th>
                                                        <th style="width: 3rem"></th>
                                                    </tr>
                                                </ng-template>
                                                <ng-template pTemplate="body" let-config let-i="rowIndex">
                                                    <tr>
                                                        <td>
                                                            <div class="flex flex-col">
                                                                <span class="font-bold">{{ getValueLabel(config.addonValue) }}</span>
                                                                <small class="text-gray-500">{{ config.addonValue.slug }}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <p-inputNumber
                                                                [(ngModel)]="config.priceModifier"
                                                                [showButtons]="true"
                                                                buttonLayout="horizontal"
                                                                spinnerMode="horizontal"
                                                                incrementButtonIcon="pi pi-plus"
                                                                decrementButtonIcon="pi pi-minus"
                                                                [minFractionDigits]="2"
                                                                suffix=" {{ selectedSite.currency?.symbol }}"
                                                                styleClass="w-full"
                                                            >
                                                            </p-inputNumber>
                                                        </td>
                                                        <td>
                                                            <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" (onClick)="removeConfig(i)"></p-button>
                                                        </td>
                                                    </tr>
                                                </ng-template>
                                                <ng-template pTemplate="emptymessage">
                                                    <tr>
                                                        <td colspan="3" class="text-center p-4 text-gray-400">
                                                            {{ 'No_addons_configured_for_this_site' | translate }}
                                                        </td>
                                                    </tr>
                                                </ng-template>
                                            </p-table>
                                        </div>
                                    </div>
                                </div>
                            </p-tabpanel>
                        </p-tabpanels>
                    </p-tabs>
                </div>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-content-between align-items-center w-full p-2 justify-between">
                    <div class="flex flex-col gap-5">
                        <p-select appendTo="body" [options]="languageLService.items()" [(ngModel)]="selectedLanguage" (onChange)="onLanguageChange()" optionLabel="name" placeholder="Избери език" [style]="{ width: '220px' }"> </p-select>

                        <p-select
                            appendTo="body"
                            [options]="siteLService.items()"
                            [(ngModel)]="selectedSite"
                            (onChange)="onSiteChange()"
                            optionLabel="name"
                            [placeholder]="('Choose' | translate) + ' ' + ('Site' | translate)"
                            [style]="{ width: '220px' }"
                        >
                        </p-select>
                    </div>

                    <div class="flex gap-2 items-end">
                        <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />

                        <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
                    </div>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class WpCategoryDetailComponent {
    protected detailService = inject(WpProductDetailService);
    protected languageLService = inject(LanguageListService);
    protected siteLService = inject(SiteListService);
    protected brandLService = inject(WpBrandListService);
    protected addonService = inject(WpAddonListService);
    protected tr = inject(TranslateService);

    selectedLanguage: any = null;
    selectedSite: any = null;

    // currentTranslation: IWpProductTranslation | null = null;

    onLanguageChange() {
        const item = this.detailService.selectedItem();
        if (!item || !this.selectedLanguage) return;

        const translationExists = item.translations.find((value) => value.language.id === this.selectedLanguage.id);
        if (!translationExists) {
            item.translations.push({
                description: '',
                id: 0,
                name: '',
                price: 0,
                regularPrice: 0,
                shortDescription: '',
                sku: '',
                slug: '',
                wpProductId: 0,
                language: { ...this.selectedLanguage }
            });
        }
        // this.currentTranslation = item.translations.find(
        //     value => value.id === this.selectedLanguage.id
        // ) || null;
    }
    onSiteChange() {}

    constructor() {
        this.languageLService.loadList(0, 1000);
        this.siteLService.loadList(0, 1000);
        this.brandLService.loadList(0, 1000);
        this.detailService.loadAllCategories();
        this.addonService.loadList(0, 1000);

        this.generateUnitOptions();
        this.generateStatusOptions();

        this.tr.onLangChange.subscribe((lang) => {
            this.generateUnitOptions();
            this.generateStatusOptions();
        });
        effect(() => {});
    }

    protected productUnit: any[] = [];
    private generateUnitOptions() {
        this.productUnit = Object.keys(ProductUnit)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                // Вече instant() ще има достъп до преводите, защото се вика след смяна на езика
                label: this.tr.instant(`UNIT.${key}`),
                value: ProductUnit[key as keyof typeof ProductUnit]
            }));
    }

    protected productStatus: any[] = [];
    private generateStatusOptions() {
        this.productStatus = Object.keys(ProductStatus)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                label: this.tr.instant(`PRODUCT_STATUS.${key}`),
                value: ProductStatus[key as keyof typeof ProductStatus]
            }));
    }

    // Метод, който се вика от HTML при промяна на избора в дървото
    updateCategorySelection() {
        this.detailService.prepareCategoriesForSave();
    }

    // В WpCategoryDetailComponent

    // Ендпоинт за качване в temp (коригирай според твоя API)
    uploadUrl = `${ROUTES.wp_product.upload_template}`;

    onUpload(event: any) {
        const item = this.detailService.selectedItem();
        if (!item) return;

        if (!item.images) {
            item.images = [];
        }

        // Бекендът трябва да ти върне обект с името на файла в temp и неговия URL
        // Например: { fileName: "temp_abc123.jpg", url: "http://.../media/temp/temp_abc123.jpg" }
        const response = event.originalEvent.body;

        // Ако сървърът връща масив (при multiple upload)
        if (Array.isArray(response)) {
            response.forEach((res) => this.addImageToModel(item, res));
        } else {
            this.addImageToModel(item, response);
        }
    }

    private addImageToModel(item: IWpProduct, res: any) {
        const newImage: IWpImage = {
            id: 0, // Нова снимка, още няма ID в базата
            localSrc: res.url, // URL към временната папка за визуализация
            tempName: res.fileName, // Името, по което Java ще намери файла в temp/
            isTemp: true, // Маркер за бекенда, че трябва да мести файл
            siteMappings: [] // Празно, защото още не е синхронизирана с WP
        };

        item.images.push(newImage);
    }

    removeImage(index: number) {
        const item = this.detailService.selectedItem();
        if (item && item.images) {
            item.images.splice(index, 1);
        }
    }

    viewImage(src: string) {
        window.open(src, '_blank');
    }

    totalSizePercent: number = 0;

    onSelectedFiles(event: any) {
        let total = 0;
        event.currentFiles.forEach((f: any) => (total += f.size));
        this.totalSizePercent = (total / 5000000) * 100; // спрямо 5MB лимит
    }

    // 1. Филтрирани конфигурации за долната таблица
    get currentSiteConfigs() {
        const product = this.detailService.selectedItem(); // Твоят JSON
        if (!product || !this.selectedSite) return [];

        // Показваме само аддоните, които са конфигурирани за ТЕКУЩИЯ сайт
        return product.addonConfigs.filter((c) => c.site.id === this.selectedSite.id);
    }

    // 2. Метод за добавяне на нова стойност в долната таблица
    addValueToSite(value: any) {
        console.log(value);
        const product = this.detailService.selectedItem();

        // 1. Проверка дали има избран продукт и сайт
        if (!product || !this.selectedSite) {
            console.warn('Please select a site first!');
            return;
        }

        // Инициализираме масива, ако бекендът е върнал null
        if (!product.addonConfigs) {
            product.addonConfigs = [];
        }

        // 2. Проверка за дублиране (сайт + стойност)
        const exists = product.addonConfigs.some((c) =>
            c.site.id === this.selectedSite.id &&
            c.addonValue.id === value.id
        );

        if (!exists) {
            // 3. Добавяме нов конфигурационен обект
            product.addonConfigs.push({
                // id: null, // Нов запис
                id: value.id,
                site: { ...this.selectedSite }, // Копираме избрания сайт
                addonValue: { ...value },       // Копираме избраната стойност (с преводите)
                priceModifier: 0                // Начална цена
            });

            // Опционално: съобщение за успех или лог
            console.log('Added config:', value.slug);
        } else {
            console.warn('This value is already added for this site');
        }
    }

    // Метод за извличане на етикет според избрания език
    getValueLabel(addonValue: any): string {
        if (!addonValue) return '';

        const translations = addonValue.translations;
        if (!translations) return addonValue.slug || '';

        // ВАРИАНТ А: Ако е Map { "bg": { "label": "..." } }
        if (this.selectedLanguage?.code && translations[this.selectedLanguage.code]) {
            const trans = translations[this.selectedLanguage.code];
            return trans.label || addonValue.slug;
        }

        // ВАРИАНТ Б: Ако е Масив [{ language: { code: 'bg' }, label: '...' }]
        if (Array.isArray(translations)) {
            const trans = translations.find((t: any) =>
                t.language?.id === this.selectedLanguage?.id ||
                t.language?.code === this.selectedLanguage?.code
            );
            return trans ? trans.label : addonValue.slug;
        }

        return addonValue.slug || '';
    }

// Метод за изтриване на конфигурация
    removeConfig(index: number) {
        const product = this.detailService.selectedItem();
        if (!product) return;

        // Тъй като таблицата е филтрирана, трябва да намерим обекта и да го премахнем от оригиналния масив
        const configToDelete = this.currentSiteConfigs[index];
        const globalIndex = product.addonConfigs.indexOf(configToDelete);

        if (globalIndex > -1) {
            product.addonConfigs.splice(globalIndex, 1);
        }
    }


}
