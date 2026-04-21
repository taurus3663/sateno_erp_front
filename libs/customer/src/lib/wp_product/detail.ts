import { ChangeDetectorRef, Component, computed, effect, HostListener, inject, Signal, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { LanguageListService } from '../language/list.service';
import { WpProductDetailService } from './detail.service';
import { IWpImage, IWpProduct, IWpProductTranslation, ProductSaleType, ProductStatus, ProductUnit } from './interfaces';
import { InputNumber } from 'primeng/inputnumber';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Textarea } from 'primeng/textarea';
import { SiteListService } from '../site/list.service';
import { WpBrandListService } from '../wp_brand/list.service';
import { Editor } from 'primeng/editor';
import { MultiSelect } from 'primeng/multiselect';
import { TreeSelect } from 'primeng/treeselect';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ROUTES } from '../api.routes';
import { Tooltip } from 'primeng/tooltip';
import { ProgressBar } from 'primeng/progressbar';
import { IWpAddonValue } from '../wp_addon_value/interfaces';
import { TableModule } from 'primeng/table';
import { Listbox } from 'primeng/listbox';
import { WpAddonListService } from '../wp_addon/list.service';
import { XL_AUTH_CONFIG } from 'xl-auth';
import { ILanguage } from '../language/interfaces';
import { readonly } from '@angular/forms/signals';
import { DialogService } from 'primeng/dynamicdialog';
import { AIProductInfoGenComponent } from '../_reusables/components/ai_product_info_gen/AI_product_info_gen';
import { SiteSelectorComponent } from '../_reusables/SiteSelectorComponent';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { forkJoin, tap } from 'rxjs';

@Component({
    selector: 'wp_product-detail',
    standalone: true,
    imports: [Dialog, Button, FormsModule, CommonModule, TranslatePipe, Select, InputText, InputNumber, TabPanel, TabPanels, Tabs, TabList, Tab, TreeSelect, PrimeTemplate, FileUpload, Tooltip, TableModule, Listbox],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ 'min-width': '1000px', 'min-height': '100vh', width: '100%' }">
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
                    <p-tabs [value]="activeTab" (valueChange)="activeTab = $event">
                        <p-tablist>
                            <p-tab value="0"><i class="pi pi-info-circle mr-2"></i>{{ 'Main' | translate }}</p-tab>
                            <p-tab value="3" [disabled]="isNewProduct() && activeTab !== '3'"><i class="pi pi-money-bill mr-2"></i>{{ 'Addons' | translate }}</p-tab>
                            <p-tab value="2" [disabled]="isNewProduct() && activeTab !== '2'"><i class="pi pi-money-bill mr-2"></i>{{ 'Prices' | translate }}</p-tab>
                            <p-tab value="1" [disabled]="isNewProduct() && activeTab !== '1'"><i class="pi pi-language mr-2"></i>{{ 'Descriptions' | translate }}</p-tab>
                        </p-tablist>

                        <p-tabpanels>
                            <p-tabpanel value="0">
                                <div class="grid grid-cols-12 gap-4 pt-4">
                                    <div class="col-span-3">
                                        <label class="block font-bold mb-2">{{ 'Status' | translate }}</label>
                                        <p-select [options]="productStatus" [(ngModel)]="item.status" optionLabel="label" optionValue="value" class="w-full"></p-select>
                                    </div>

                                    <div class="col-span-2 ml-10">
                                        <label class="block font-bold mb-2">{{ 'SKU' | translate }}</label>
                                        <input pInputText class="w-full" readonly [value]="item?.sku ?? ''" />
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

                                            <!--                                            <div class="grid grid-cols-12 gap-3" *ngIf="item?.images?.length">-->
                                            <!--                                                <div *ngFor="let img of item.images; let i = index"-->
                                            <!--                                                     class="col-span-4 md:col-span-2 relative group">-->
                                            <!--                                                    <div-->
                                            <!--                                                        class="border-2 border-round overflow-hidden shadow-1 bg-white relative transition-all duration-200 hover:shadow-4"-->
                                            <!--                                                        [ngClass]="img.isTemp ? 'border-primary' : 'border-transparent'">-->
                                            <!--                                                        <img [src]="baseUrl + img.localSrc"-->
                                            <!--                                                             style="width: 130px;height: auto;"-->
                                            <!--                                                             class="h-8rem object-cover block cursor-pointer"-->
                                            <!--                                                             alt="Product thumbnail" />-->

                                            <!--                                                        <span *ngIf="img.isTemp"-->
                                            <!--                                                              class="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 border-bottom-left-round shadow-1"> {{ 'NEW' | translate }} </span>-->

                                            <!--                                                        <div-->
                                            <!--                                                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">-->
                                            <!--                                                            <p-button icon="pi pi-trash" severity="danger"-->
                                            <!--                                                                      [rounded]="true" size="small"-->
                                            <!--                                                                      pTooltip="{{ 'Remove' | translate }}"-->
                                            <!--                                                                      (onClick)="removeImage(i)"></p-button>-->
                                            <!--                                                            <p-button icon="pi pi-search-plus" severity="secondary"-->
                                            <!--                                                                      [rounded]="true" size="small"-->
                                            <!--                                                                      (onClick)="viewImage(img.localSrc)"></p-button>-->
                                            <!--                                                        </div>-->
                                            <!--                                                    </div>-->
                                            <!--                                                </div>-->
                                            <!--                                            </div>-->
                                            <div class="grid grid-cols-12 gap-3" *ngIf="filteredImages.length">
                                                <div *ngFor="let img of filteredImages; let i = index" class="col-span-4 md:col-span-2 relative group">
                                                    <div class="border-2 border-round overflow-hidden shadow-1 bg-white relative transition-all duration-200 hover:shadow-4" [ngClass]="img.isTemp ? 'border-primary' : 'border-transparent'">
                                                        <img [src]="baseUrl + img.localSrc" style="width: 130px;height: auto;" class="h-8rem object-cover block cursor-pointer" />

                                                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" size="small" (onClick)="removeImage(i)"></p-button>
                                                            <p-button icon="pi pi-search-plus" severity="secondary" [rounded]="true" size="small" (onClick)="viewImage(img.localSrc)"></p-button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-span-3" *ngIf="productSaleType.length > 0">
                                        <label class="block font-bold mb-2">{{ 'Limited' | translate }}</label>
                                        <p-select [options]="productSaleType" [(ngModel)]="item.saleType" optionLabel="label" optionValue="value" placeholder="Select Type" class="w-full"> </p-select>
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
                                                <div class="flex justify-between items-center mb-2">
                                                    <label class="font-bold">
                                                        {{ 'Product_Name' | translate }}
                                                    </label>

                                                    <p-button [label]="'Gen_by_AI' | translate" icon="pi pi-android" severity="help" [outlined]="true" size="small" (onClick)="openAIProductInfoGen(item)"> </p-button>

                                                    <p-button
                                                        [label]="'Auto_Translate_To_Other_Languages' | translate"
                                                        icon="pi pi-sparkles"
                                                        severity="help"
                                                        [outlined]="true"
                                                        size="small"
                                                        [loading]="isTranslatingTitle()"
                                                        (onClick)="translateProductContent(lang, isTranslatingTitle, 1)"
                                                        [hidden]="this.isNewProduct()"
                                                    >
                                                    </p-button>
                                                </div>

                                                <input pInputText class="w-full" [(ngModel)]="lang.name" (ngModelChange)="markAsEdited(1)" />
                                            </div>

                                            <div class="col-span-12">
                                                <div class="flex justify-between items-center mb-2">
                                                    <label class="block font-bold mb-2">{{ 'Short_Description' | translate }} </label>
                                                    <p-button
                                                        [label]="'Auto_Translate_To_Other_Languages' | translate"
                                                        icon="pi pi-sparkles"
                                                        severity="help"
                                                        [outlined]="true"
                                                        size="small"
                                                        [loading]="isTranslatingShortInformation()"
                                                        (onClick)="translateProductContent(lang, isTranslatingShortInformation, 2)"
                                                        [hidden]="this.isNewProduct()"
                                                    >
                                                    </p-button>
                                                </div>

                                                <!--                                                <p-editor [style]="{ height: '40vh', 'max-width': 'auto' }"-->
                                                <!--                                                          class="w-full" [(ngModel)]="lang.shortDescription"></p-editor>-->

                                                <textarea [style]="{ height: '70vh', 'max-width': 'auto' }" class="w-full border-1 border-surface-300 border-solid" [(ngModel)]="lang.shortDescription" (ngModelChange)="markAsEdited(2)"> </textarea>
                                            </div>

                                            <div class="col-span-12">
                                                <div class="flex justify-between items-center mb-2">
                                                    <label class="block font-bold mb-2">{{ 'Description' | translate }} </label>
                                                    <p-button
                                                        [label]="'Auto_Translate_To_Other_Languages' | translate"
                                                        icon="pi pi-sparkles"
                                                        severity="help"
                                                        [outlined]="true"
                                                        size="small"
                                                        [loading]="isTranslatingInformation()"
                                                        (onClick)="translateProductContent(lang, isTranslatingInformation, 3)"
                                                        [hidden]="this.isNewProduct()"
                                                    >
                                                    </p-button>
                                                </div>

                                                <!--                                                <p-editor [style]="{ height: '70vh', 'max-width': 'auto' }"-->
                                                <!--                                                          class="w-full" [(ngModel)]="lang.description"></p-editor>-->
                                                <textarea [style]="{ height: '70vh', 'max-width': 'auto' }" class="w-full border-1 border-surface-300 border-solid" [(ngModel)]="lang.description" (ngModelChange)="markAsEdited(3)"> </textarea>
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
                                <div class="pt-4" *ngIf="selectedSite && currentSitePricing">
                                    <div class="grid grid-cols-12 gap-4 mb-6 p-4 bg-blue-50/30 border-round border-1 border-blue-100">
                                        <div class="col-span-12">
                                            <h3 class="text-sm font-bold uppercase text-blue-700 mb-2"><i class="pi pi-tag mr-2"></i>{{ 'Main_Pricing_for' | translate }}: {{ selectedSite.name }}</h3>
                                        </div>

                                        <div class="col-span-4">
                                            <label class="block font-bold mb-2 text-xs text-gray-600">{{ 'Price' | translate }}</label>
                                            <p-inputNumber [(ngModel)]="currentSitePricing.regularPrice" mode="currency" [currency]="selectedSite.currency?.code || 'BGN'" class="w-full" styleClass="w-full"> </p-inputNumber>
                                        </div>

                                        <div class="col-span-4">
                                            <label class="block font-bold mb-2 text-xs text-gray-600">{{ 'Sale_Price' | translate }}</label>
                                            <p-inputNumber [(ngModel)]="currentSitePricing.price" mode="currency" [currency]="selectedSite.currency?.code || 'BGN'" class="w-full" styleClass="w-full"> </p-inputNumber>
                                        </div>
                                    </div>
                                </div>

                                <div *ngIf="!selectedSite" class="flex flex-column align-items-center justify-content-center p-8 text-gray-400 border-2 border-dashed border-round surface-50">
                                    <span class="text-xl font-medium">{{ 'Please_select_a_site_to_view' | translate }}</span>
                                </div>
                            </p-tabpanel>
                            <p-tabpanel value="3">
                                <div class="pt-4">
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
                                                [listStyle]="{ 'max-height': '200px' }"
                                            >
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
                                                <div *ngIf="!this.detailService.selectedAddonGroup" class="text-gray-400 italic text-sm">{{ 'Select_group_to_see_values' | translate }}</div>
                                                <p-button
                                                    *ngFor="let val of this.detailService.selectedAddonValues"
                                                    [label]="getValueLabel(val)"
                                                    [pTooltip]="getValueLabel(val)"
                                                    size="small"
                                                    severity="secondary"
                                                    icon="pi pi-plus"
                                                    (onClick)="addValueToSite(val)"
                                                >
                                                </p-button>
                                            </div>
                                        </div>

                                        <div class="col-span-12 mt-4">
                                            <!--                                            <div class="flex justify-between items-center mb-2">-->
                                            <!--                                                <span class="font-bold text-lg"><i class="pi pi-table mr-2"></i>{{ 'Global_Addon_Configuration' | translate }}</span>-->
                                            <!--                                            </div>-->

                                            <p-table [value]="currentAddonConfigs" [scrollable]="true" scrollHeight="300px" styleClass="p-datatable-sm shadow-1 border-round overflow-hidden">
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
                                                            {{ 'No_addons_configured' | translate }}
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
                        <p-select
                            *ngIf="activeTab === '1'"
                            appendTo="body"
                            [options]="languageLService.items()"
                            [(ngModel)]="selectedLanguage"
                            (onChange)="onLanguageChange()"
                            optionLabel="name"
                            placeholder="Избери език"
                            [style]="{ width: '220px' }"
                            [hidden]="this.isNewProduct()"
                            [disabled]="!isNewProduct() && !allProducts"
                        ></p-select>

                        <p-select
                            *ngIf="activeTab === '2'"
                            appendTo="body"
                            [options]="siteLService.items()"
                            [(ngModel)]="selectedSite"
                            (onChange)="onSiteChange()"
                            optionLabel="name"
                            [placeholder]="('Choose' | translate) + ' ' + ('Site' | translate)"
                            [style]="{ width: '220px' }"
                            [showClear]="true"
                            [hidden]="this.isNewProduct()"
                            [disabled]="!isNewProduct() && !allProducts"
                        >
                        </p-select>

                        <p-select
                            *ngIf="activeTab === '0'"
                            appendTo="body"
                            [options]="siteLService.items()"
                            [(ngModel)]="syncSite"
                            (onChange)="onSiteChange()"
                            optionLabel="name"
                            [placeholder]="('Choose' | translate) + ' ' + ('Site' | translate)"
                            [style]="{ width: '220px' }"
                            [showClear]="true"
                            [disabled]="!detailService.selectedItem()?.id || (!isNewProduct() && !allProducts)"
                            [hidden]="!detailService.selectedItem()?.id"
                        >
                        </p-select>
                    </div>

                    <div class="flex gap-2 items-end">
                        <!--                        <p-button label="Отказ" severity="secondary" [text]="true"-->
                        <!--                                  (onClick)="detailService.closeDetail()" />-->
                        <p-button [label]="'Cancel' | translate" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()"></p-button>
                        <!--                        <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()"-->
                        <!--                                  (onClick)="triggerSave()" />-->

                        <p-button *ngIf="isNewProduct() && activeTab !== '0'" [label]="'Back' | translate" icon="pi pi-chevron-left" [text]="true" severity="secondary" (onClick)="goBack()"> </p-button>

                        <p-button
                            [label]="(shouldShowNextButton() ? 'Next' : 'Save') | translate"
                            [icon]="shouldShowNextButton() ? 'pi pi-chevron-right' : 'pi pi-check'"
                            [iconPos]="shouldShowNextButton() ? 'right' : 'left'"
                            [loading]="detailService.isSaving()"
                            (onClick)="handleMainAction()"
                        >
                        </p-button>
                    </div>
                </div>
            </ng-template>
        </p-dialog>
    `,
    styles: [
        `
            :host ::ng-deep .p-textarea {
                border: 1px solid #d1d5db !important; /* Стандартен сив бордер */
                border-radius: 6px;
            }
        `
    ]
})
export class WpCategoryDetailComponent {
    protected detailService = inject(WpProductDetailService);
    protected languageLService = inject(LanguageListService);
    protected siteLService = inject(SiteListService);
    protected brandLService = inject(WpBrandListService);
    protected addonService = inject(WpAddonListService);
    protected tr = inject(TranslateService);
    private authConfig = inject(XL_AUTH_CONFIG);
    protected readonly baseUrl = this.authConfig.apiUrl;
    private confirmationService = inject(ConfirmationService);

    selectedLanguage: any = null;
    selectedSite: any = null;
    syncSite: any = null;
    allProducts: boolean = false;

    activeTab: string | undefined | number = '0';



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

        this.generateProductSaleTypeOptions();
        this.generateStatusOptions();

        this.tr.onLangChange.subscribe((lang) => {
            this.generateProductSaleTypeOptions();
            this.generateStatusOptions();
        });
        effect(() => {
            this.activeTab = '0';
            this.syncSite = null;
            this.selectedLanguage = null;
            this.selectedSite = null;
            const item = this.detailService.selectedItem();
            const languages = this.languageLService.items();
            const sites = this.siteLService.items();
            if (!item?.id) {
                const bgLang = languages.find((l) => l.code === 'bg');
                if (bgLang) {
                    this.selectedLanguage = bgLang;
                    this.onLanguageChange();
                }
                this.selectedSite = sites.find((value) => value.url.includes('sateno.bg'));
            }
        });

        this.allProducts = false;
        effect(() => {
            const item = this.detailService.selectedItem();
            const isVisible = this.detailService.isVisible();

            if (isVisible && item?.id && item.id !== 0) {
                setTimeout(() => {
                    const sites = this.siteLService.items();
                    if (sites.length > 0) {
                        const ref = this.dialogService.open(SiteSelectorComponent, {
                            header: this.tr.instant('Choose'),
                            width: '450px',
                            data: { label: ' ', sites: sites } // Подаваме сайтовете, ако компонента ги очаква
                        });

                        ref?.onClose.subscribe((site: any) => {
                            // Проверяваме дали е върнат обект или ID (зависи какво връща SiteSelectorComponent)
                            if (site) {
                                // Тъй като вече имаме избрания обект/ID, го сетваме директно
                                this.selectedSite = sites[site];
                                this.syncSite = sites[site];

                                // Автоматично избираме Български език
                                const languages = this.languageLService.items();
                                this.selectedLanguage = languages.find((l) => l.code === 'bg');

                                // Извикваме логиката за промяна на език
                                this.onLanguageChange();

                                this.allProducts = false;
                            } else {
                                this.allProducts = true;
                            }
                            // Ръчно казваме на Angular да отрази промените и да заключи селектите
                            this.cdr.detectChanges();
                        });
                    }
                }, 100);
            }

            if (isVisible && (!item?.id || item.id === 0)) {
                this.activeTab = '0';
            }
        });
        this.isTitleEdited = false;
        this.isShortDescriptionEdited = false;
        this.isDescriptionEdited = false;
    }

    protected productSaleType: any[] = [];
    private generateProductSaleTypeOptions() {
        this.productSaleType = Object.keys(ProductSaleType)
            .filter((key) => isNaN(Number(key)))
            .map((key) => {
                // Взимаме числовата стойност от Enum-а
                const enumValue = ProductSaleType[key as keyof typeof ProductSaleType];
                return {
                    label: this.tr.instant(key),
                    value: Number(enumValue) // ГАРАНТИРАМЕ, че е число 0 или 1
                };
            });
    }

    protected readonly isNewProduct = computed(() => {
        const item = this.detailService.selectedItem();
        return !item?.id || item.id === 0;
    });

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

    // private addImageToModel(item: IWpProduct, res: any) {
    //     const newImage: IWpImage = {
    //         id: 0, // Нова снимка, още няма ID в базата
    //         localSrc: res.url, // URL към временната папка за визуализация
    //         tempName: res.fileName, // Името, по което Java ще намери файла в temp/
    //         isTemp: true, // Маркер за бекенда, че трябва да мести файл
    //         siteMappings: [] // Празно, защото още не е синхронизирана с WP
    //     };
    //
    //     item.images.push(newImage);
    // }

    // removeImage(index: number) {
    //     const item = this.detailService.selectedItem();
    //     if (item && item.images) {
    //         item.images.splice(index, 1);
    //     }
    // }

    viewImage(src: string) {
        window.open(src, '_blank');
    }

    totalSizePercent: number = 0;

    onSelectedFiles(event: any) {
        let total = 0;
        event.currentFiles.forEach((f: any) => (total += f.size));
        this.totalSizePercent = (total / 5000000) * 100; // спрямо 5MB лимит
    }

    // В detail.ts намери проблемния участък
    // get currentAddonConfigs() {
    //     const item = this.detailService.selectedItem();
    //     if (!item || !item.addonConfigs) return [];
    //     return item.addonConfigs;
    // }

    // 2. Метод за добавяне на нова стойност в долната таблица
    // detail.ts

    addValueToSite(value: any) {
        const product = this.detailService.selectedItem();

        if (!product) return;

        if (!product.addonConfigs) {
            product.addonConfigs = [];
        }

        // СЕГА: Проверяваме само дали тази стойност (addonValue) вече е добавена
        const exists = product.addonConfigs.some((c) => c.addonValue.id === value.id);

        if (!exists) {
            product.addonConfigs.push({
                // Премахваме site обекта, защото бекендът вече не го очаква
                addonValue: { ...value },
                priceModifier: 0
            });
        } else {
            console.warn('This value is already added');
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
            const trans = translations.find((t: any) => t.language?.id === this.selectedLanguage?.id || t.language?.code === this.selectedLanguage?.code);
            return trans ? trans.label : addonValue.slug;
        }

        return addonValue.slug || '';
    }

    // Метод за изтриване на конфигурация
    removeConfig(index: number) {
        const product = this.detailService.selectedItem();
        if (product && product.addonConfigs) {
            // Тъй като таблицата вече показва директно addonConfigs,
            // индексът от таблицата съвпада с индекса в масива.
            product.addonConfigs.splice(index, 1);
        }
    }

    // В WpCategoryDetailComponent
    get currentSitePricing() {
        const item = this.detailService.selectedItem();
        if (!item || !this.selectedSite) return null;

        if (!item.siteConfig) {
            item.siteConfig = [];
        }

        // Търсим дали вече има конфигурация за този сайт
        let config = item.siteConfig.find((c) => c.site.id === this.selectedSite.id);

        // Ако няма, създаваме нов обект
        if (!config) {
            config = {
                id: -1,
                site: { ...this.selectedSite },
                price: 0,
                regularPrice: 0,
                slug: ''
            };
            item.siteConfig.push(config);
        }

        return config;
    }

    protected isTranslatingTitle = signal(false);
    protected isTranslatingShortInformation = signal(false);
    protected isTranslatingInformation = signal(false);
    protected ms = inject(MessageService);

// Променяме метода да връща Observable
    protected translateProductContent(item: IWpProductTranslation, signalM: any, type: number) {
        signalM.set(true);
        const payload = {
            item: item,
            type: type,
            productId: this.detailService.selectedItem()?.id
        };

        // Връщаме потока, за да можем да го чакаме
        return this.detailService.translateProductContent(payload).pipe(
            tap({
                next: () => {
                    this.ms.add({ severity: 'success', summary: 'Преведен тип ' + type });
                    signalM.set(false);
                },
                error: () => signalM.set(false)
            })
        );
    }

    //     ----------------
    // 1. Гетър за снимките спрямо избрания сайт
    get filteredImages(): IWpImage[] {
        const item = this.detailService.selectedItem();
        if (!item || !item.images) return [];

        if (!item.id || item.id === 0) return item.images;

        if (this.syncSite) {
            return item.images.filter((img) => {
                if (img.isTemp) return true;

                // Ако масивът е празен (както в твоя JSON), тук ще върне false
                return (
                    img.siteMappings &&
                    img.siteMappings.length > 0 &&
                    img.siteMappings.some((m) => {
                        // Проверяваме всички възможни пътища до ID-то на сайта
                        const mSiteId = (m as any).siteId || (m as any).site?.id;
                        return mSiteId == this.syncSite.id;
                    })
                );
            });
        }

        return item.images;
    }

    // 2. Метод за изтриване на снимка (премахва от основния масив)
    removeImage(index: number) {
        const item = this.detailService.selectedItem();
        if (!item) return;

        // Взимаме реалния обект от филтрирания списък
        const imgToRemove = this.filteredImages[index];

        // Намираме индекса му в глобалния масив
        const globalIndex = item.images.indexOf(imgToRemove);

        if (globalIndex > -1) {
            item.images.splice(globalIndex, 1);
        }
    }

    // 3. Добавяне на снимка (isTemp)
    private addImageToModel(item: IWpProduct, res: any) {
        const newImage: IWpImage = {
            id: 0,
            localSrc: res.url,
            tempName: res.fileName,
            isTemp: true,
            siteMappings: []
        };

        if (!item.images) item.images = [];
        item.images.push(newImage);
    }

    // 4. Getter за адоните (вече в таб 3)
    get currentAddonConfigs() {
        const item = this.detailService.selectedItem();
        return item?.addonConfigs || [];
    }

    // 5. Прехвърляне на ID-то на избрания сайт при запис
    triggerSave() {
        const item = this.detailService.selectedItem();
        if (!item) return;

        // Питанка за превод само ако редактираме на Български
        if (!this.isNewProduct() && (this.isTitleEdited || this.isShortDescriptionEdited || this.isDescriptionEdited)) {
            this.confirmationService.confirm({
                header: this.tr.instant('Auto_Translate_To_Other_Languages'),
                acceptLabel: this.tr.instant('Yes'),
                rejectLabel: this.tr.instant('No'),
                accept: () => {
                    const bgTrans = item.translations.find((t) => t.language.code === 'bg');
                    const translationRequests = [];
                    if (bgTrans) {
                        if (this.isTitleEdited)
                            translationRequests.push(this.translateProductContent(bgTrans, this.isTranslatingTitle, 1));
                        if (this.isShortDescriptionEdited)
                            translationRequests.push(this.translateProductContent(bgTrans, this.isTranslatingShortInformation, 2));
                        if (this.isDescriptionEdited)
                            translationRequests.push(this.translateProductContent(bgTrans, this.isTranslatingInformation, 3));
                    }
                    if (translationRequests.length > 0) {
                        this.ms.add({ severity: 'info', summary: 'AI', detail: 'Моля изчакайте преводите...' });

                        // forkJoin чака ВСИЧКИ Observable в масива да приключат
                        forkJoin(translationRequests).subscribe(() => {
                            this.resetEditFlags();
                            // Едва тук викаме финалния запис
                            this.detailService.loadData(item.id); // Опресняваме локалните данни
                            this.executeFinalSave(item);
                        });
                    }else {
                        this.executeFinalSave(item);
                    }
                },
                reject: () => {
                    this.resetEditFlags();
                    this.executeFinalSave(item);
                }
            });

            return;
        }

        this.executeFinalSave(item);
    }

    private executeFinalSave(item: IWpProduct) {
        item.lastEditedSiteId = this.syncSite?.id;

        // Логика за нови сайтове при нов продукт
        if (!item.id || item.id === 0) {
            const allSites = this.siteLService.items();
            if (!item.siteConfig) item.siteConfig = [];
            for (const site of allSites) {
                if (!item.siteConfig.find((c) => c.site?.id === site.id)) {
                    item.siteConfig.push({ id: -1, site: { ...site }, price: 0, regularPrice: 0, slug: '' });
                }
            }
        }

        this.detailService.saveItem(item);
    }

    private resetEditFlags() {
        this.isTitleEdited = false;
        this.isShortDescriptionEdited = false;
        this.isDescriptionEdited = false;
    }

    private dialogService = inject(DialogService);
    private cdr = inject(ChangeDetectorRef);
    openAIProductInfoGen(product: IWpProduct) {
        const ref = this.dialogService.open(AIProductInfoGenComponent, {
            header: this.tr.instant('AI'),
            width: '650px',
            contentStyle: { overflow: 'visible' },
            baseZIndex: 10000,
            maximizable: true,
            data: { product: product }
        });

        ref!.onClose.subscribe((generatedTexts: { [key: number]: string }) => {
            if (generatedTexts) {
                setTimeout(() => {
                    const translation = product.translations[0];

                    // Функцията, която превръща чистия текст в HTML за p-editor
                    // const formatForEditor = (text: string) => {
                    //     if (!text) return '';
                    //
                    //     // 1. Изчистваме евентуални ескейпнати символи
                    //     const cleanText = text.replace(/\\n/g, '\n').trim();
                    //
                    //     // 2. Разделяме текста на параграфи по двойните нови редове
                    //     // и ги обвиваме в <p> тагове
                    //     return cleanText
                    //         .split(/\n\s*\n/) // разделя при празен ред
                    //         .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`) // превръща единичен Enter в <br>
                    //         .join('');
                    // };

                    if (generatedTexts[1]) translation.name = generatedTexts[1]; // Името обикновено е чист текст
                    if (generatedTexts[2]) translation.shortDescription = generatedTexts[2];
                    if (generatedTexts[3]) translation.description = generatedTexts[3];

                    this.cdr.detectChanges();
                });
            }
        });
    }

    //
    shouldShowNextButton(): boolean {
        // Показваме "Напред" само ако е нов продукт И не сме на последната стъпка
        return this.isNewProduct() && this.activeTab !== '1';
    }

    handleMainAction() {
        if (this.isNewProduct()) {
            this.runWizardLogic();
        } else {
            this.triggerSave(); // При редакция записваме директно от всякакъв таб
        }
    }

    private runWizardLogic() {
        const item = this.detailService.selectedItem();
        if (!item) return;

        // СТЪПКА 0: НАЧАЛО
        if (this.activeTab === "0") {
            if (!this.isMainInfoValid()) return; // Твоята проверка за задължителни полета

            this.confirmationService.confirm({
                header: this.tr.instant('Addons_Question'), // Заглавие
                message: this.tr.instant('Does_this_product_have_addons?'), // Съобщение
                icon: 'pi pi-question-circle',
                acceptLabel: this.tr.instant('Yes'), // Бутон ДА
                rejectLabel: this.tr.instant('No'),  // Бутон НЕ
                acceptButtonStyleClass: 'p-button-success',
                rejectButtonStyleClass: 'p-button-secondary',
                accept: () => {
                    // Потребителят натисна ДА
                    this.activeTab = "3"; // Към Адони
                    this.cdr.detectChanges();
                },
                reject: () => {
                    // Потребителят натисна НЕ
                    // item.addonConfigs = [];
                    this.activeTab = "2"; // Директно към Цени
                    this.cdr.detectChanges();
                }
            });
            return;
        }

        // СТЪПКА 3: АДОНИ
        if (this.activeTab === '3') {
            if (!item.addonConfigs || item.addonConfigs.length === 0) {
                this.ms.add({ severity: 'error', summary: 'Грешка', detail: 'Тъй като избрахте, че има адони, трябва да добавите поне един.' });
                return;
            }
            this.activeTab = '2';
            return;
        }

        // СТЪПКА 2: ЦЕНИ
        if (this.activeTab === '2') {
            const pricing = this.currentSitePricing;
            if (!pricing || !pricing.regularPrice || pricing.regularPrice <= 0) {
                this.ms.add({ severity: 'error', summary: 'Грешка', detail: 'Въведете валидна цена (по-голяма от 0).' });
                return;
            }
            this.activeTab = '1';
            return;
        }

        // ПОСЛЕДНА СТЪПКА: ЗАПИС
        if (this.activeTab === '1') {
            this.triggerSave();
        }
    }

    goBack() {
        if (this.activeTab === '3' || this.activeTab === '2') {
            this.activeTab = '0';
        } else if (this.activeTab === '1') {
            const item = this.detailService.selectedItem();
            // Ако сме имали адони, се връщаме там, иначе към цени
            this.activeTab = (item?.addonConfigs?.length ?? 0) > 0 ? '3' : '2';
        }
    }

    private isMainInfoValid(): boolean {
        const item = this.detailService.selectedItem();
        if (!item) return false;

        // Проверка за Бранд, Статус и Категории (задължителни в Начало)
        const hasBrand = !!item.brand;
        const hasCategories = this.detailService.selectedNodesArray()?.length > 0;
        const hasStatus = item.status !== null && item.status !== undefined;
        const hasLimit = item.saleType !== null && item.saleType !== undefined;
        const weight = item.weight !== undefined && true;
        const img = item.images.length > 0 ? item.images[0] : undefined;

        if (!hasBrand || !hasCategories || !hasStatus || !hasLimit || !weight || !img) {
            this.ms.add({
                severity: 'warn',
                summary: 'Внимание',
                detail: 'Моля, попълнете Всички полета!'
            });
            return false;
        }
        return true;
    }

    isTitleEdited: boolean = false;
    isShortDescriptionEdited: boolean = false;
    isDescriptionEdited: boolean = false;

    protected markAsEdited(type: number) {
        if(this.selectedLanguage?.code === 'bg') {
            if(type === 1) {
                this.isTitleEdited = true;
            } else if (type === 2) {
                this.isShortDescriptionEdited = true;
            } else if (type === 3) {
                this.isDescriptionEdited = true;
            }
        }
    }
}
