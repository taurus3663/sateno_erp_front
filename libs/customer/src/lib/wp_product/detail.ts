import { ChangeDetectorRef, Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { LanguageListService } from '../language/list.service';
import { WpProductDetailService } from './detail.service';
import {
    CurrencyCalc,
    IWpImage,
    IWpProduct,
    IWpProductTranslation,
    ProductSaleType,
    ProductStatus
} from './interfaces';
import { InputNumber } from 'primeng/inputnumber';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { SiteListService } from '../site/list.service';
import { WpBrandListService } from '../wp_brand/list.service';
import { MultiSelect } from 'primeng/multiselect';
import { TreeSelect } from 'primeng/treeselect';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ROUTES } from '../api.routes';
import { Tooltip } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { Listbox } from 'primeng/listbox';
import { WpAddonListService } from '../wp_addon/list.service';
import { XL_AUTH_CONFIG } from 'xl-auth';
import { DialogService } from 'primeng/dynamicdialog';
import { AIProductInfoGenComponent } from '../_reusables/components/ai_product_info_gen/AI_product_info_gen';
import { SiteSelectorComponent } from '../_reusables/SiteSelectorComponent';
import { forkJoin, tap } from 'rxjs';
import { Image } from 'primeng/image';

@Component({
    selector: 'wp_product-detail',
    standalone: true,
    imports: [Dialog, Button, FormsModule, CommonModule, TranslatePipe, Select, InputText, InputNumber, TabPanel, TabPanels, Tabs, TabList, Tab, TreeSelect, PrimeTemplate, FileUpload, Tooltip, TableModule, Listbox, MultiSelect, Image],
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
                    <p-tabs [value]="activeTab" (valueChange)="onTabChange($event)">
                        <p-tablist>
                            <p-tab value="0"><i class="pi pi-info-circle mr-2"></i>{{ 'Main' | translate }}</p-tab>
                            <p-tab value="3" [disabled]="isNewProduct() && activeTab !== '3'"><i class="pi pi-money-bill mr-2"></i>{{ 'Addons' | translate }} </p-tab>
                            <p-tab value="2" [disabled]="isNewProduct() && activeTab !== '2'"><i class="pi pi-money-bill mr-2"></i>{{ 'Prices' | translate }} </p-tab>
                            <p-tab value="1" [disabled]="isNewProduct() && activeTab !== '1'"><i class="pi pi-language mr-2"></i>{{ 'Descriptions' | translate }} </p-tab>
                            <p-tab value="4" [disabled]="isNewProduct()"><i class="pi pi-history mr-2"></i>{{ 'History' | translate }} </p-tab>
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
                                            <div class="grid grid-cols-12 gap-3" *ngIf="filteredImages.length">
                                                <div *ngFor="let img of filteredImages; let i = index" class="col-span-4 md:col-span-2 relative group">
                                                    <div
                                                        style="width: 200px; height: auto;"
                                                        class="border-2 border-round overflow-hidden shadow-1 bg-white relative transition-all duration-200 hover:shadow-4"
                                                        [ngClass]="img.isTemp ? 'border-primary' : 'border-transparent'"
                                                    >
                                                        <p-image
                                                            alt="Image" width="250"
                                                            [src]="this.baseUrl + img.localSrc"
                                                            [preview]="true"
                                                            loading="lazy"
                                                            [style]="{'object-fit': 'contain', width: '100%', height: '100%' }"
                                                            imageClass="w-full h-full object-cover block cursor-pointer"

                                                        >
                                                            <ng-template #indicator>
                                                                <i
                                                                    class="pi pi-search text-lg text-white"
                                                                    style="position: absolute; top: 8px; left: 50%; transform: translateX(-50%); margin: 0; padding: 0;"
                                                                ></i>
                                                            </ng-template>
                                                        </p-image>                                                        <div class="absolute top-1 left-1 z-20">
                                                            <p-button
                                                                [icon]="img.isPrimary ? 'pi pi-star-fill' : 'pi pi-star'"
                                                                [severity]="img.isPrimary ? 'warn' : 'secondary'"
                                                                [rounded]="true"
                                                                size="small"
                                                                [style]="{
                                                                    background: img.isPrimary ? '#f59e0b' : 'rgba(255,255,255,0.8)',
                                                                    border: 'none',
                                                                    color: img.isPrimary ? 'white' : '#666',
                                                                    'box-shadow': '0 2px 4px rgba(0,0,0,0.3)'
                                                                }"
                                                                pTooltip="{{ 'Set_as_Primary' | translate }}"
                                                                (onClick)="setPrimaryImage(img)"
                                                            >
                                                            </p-button>
                                                        </div>

                                                        <div class="absolute top-1 right-1 z-20" *ngIf="$any(img).hasVideo">
                                                            <p-button
                                                                icon="pi pi-play-circle"
                                                                severity="success"
                                                                [rounded]="true"
                                                                size="small"
                                                                [style]="{
                                                                    background: '#22c55e',
                                                                    border: 'none',
                                                                    color: 'white',
                                                                    'box-shadow': '0 2px 4px rgba(0,0,0,0.3)'
                                                                }"
                                                                pTooltip="{{ 'Watch_Video' | translate }}"
                                                                (onClick)="playVideo($any(img).videoSrc)"
                                                            >
                                                            </p-button>
                                                        </div>

                                                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" size="small" pTooltip="{{ 'Delete_Image' | translate }}" (onClick)="removeImage(i)"></p-button>
                                                            <p-button icon="pi pi-search-plus" severity="secondary" [rounded]="true" size="small" (onClick)="viewImage(img.localSrc)"></p-button>

                                                            <p-button
                                                                *ngIf="$any(img).hasVideo"
                                                                icon="pi pi-video"
                                                                severity="danger"
                                                                [outlined]="true"
                                                                [rounded]="true"
                                                                size="small"
                                                                styleClass="p-button-danger"
                                                                [style]="{ background: '#ef4444', color: '#fff', border: 'none' }"
                                                                pTooltip="{{ 'Remove_Video_Only' | translate }}"
                                                                (onClick)="removeVideo(img)"
                                                            >
                                                                <i class="pi pi-trash text-xs absolute -bottom-1 -right-1 bg-red-700 rounded-full p-0.5 text-white scale-75"></i>
                                                            </p-button>

                                                            <p-fileupload
                                                                *ngIf="img.id && !$any(img).hasVideo"
                                                                mode="basic"
                                                                name="file"
                                                                [url]="uploadUrl"
                                                                (onUpload)="onVideoUpload($event, img)"
                                                                accept="video/*"
                                                                [auto]="true"
                                                                [multiple]="false"
                                                                chooseIcon="pi pi-video"
                                                                chooseLabel=" "
                                                                class="video-icon-only"
                                                                pTooltip="{{ 'Attach_video_to_img' | translate }}"
                                                                tooltipPosition="top"
                                                                [style]="{ 'border-radius': '30px', width: '30px', 'padding-right': '3px' }"
                                                            >
                                                            </p-fileupload>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-span-3" *ngIf="productSaleType.length > 0">
                                        <label class="block font-bold mb-2">{{ 'Limited' | translate }}</label>
                                        <p-select [options]="productSaleType" [(ngModel)]="item.saleType" optionLabel="label" optionValue="value" placeholder="Select Type" class="w-full"></p-select>
                                    </div>

                                    <div class="col-span-3">
                                        <label class="block font-bold mb-2">{{ 'Quantity' | translate }}</label>
                                        <p-inputNumber [(ngModel)]="item.stockQuantity" class="w-full" styleClass="w-full"></p-inputNumber>
                                    </div>
                                    <div class="col-span-3">
                                        <label class="block font-bold mb-2">{{ 'Weight' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.weight" class="w-full" [ngClass]="{ 'ng-invalid ng-dirty': isWeightInvalid }" />
                                    </div>

                                    <div class="col-span-4">
                                        <label class="block font-bold mb-2 ">{{ 'Buy_price' | translate }} </label>
                                        <p-inputNumber [(ngModel)]="item.buyPrice" mode="currency" currency="EUR" class="w-full" styleClass="w-full"></p-inputNumber>
                                    </div>
                                    <div class="col-span-4">
                                        <label class="block font-bold mb-2">{{ 'Transport_price' | translate }} </label>
                                        <p-inputNumber [(ngModel)]="item.transportPrice" mode="currency" currency="EUR" class="w-full" styleClass="w-full"></p-inputNumber>
                                    </div>

                                    <div class="col-span-12 mt-3">
                                        <label class="block font-bold mb-2"> <i class="pi pi-palette mr-2 text-primary"></i>{{ 'Colors' | translate }} </label>
                                        <p-multiSelect
                                            [options]="this.availableColors"
                                            appendTo="body"
                                            optionLabel="label"
                                            optionValue="name"
                                            [filter]="true"
                                            filterBy="label"
                                            placeholder="{{ 'Select_Colors' | translate }}"
                                            class="w-full"
                                            styleClass="w-full"
                                        >
                                            <!-- Шаблон за това как изглеждат цветовете в списъка за избор -->
                                            <ng-template pTemplate="item" let-color>
                                                <div class="flex items-center gap-2">
                                                    <span class="inline-block w-4 h-4 rounded-full border border-surface-300" [style.backgroundColor]="color.hex"></span>
                                                    <span>{{ color.label }}</span>
                                                </div>
                                            </ng-template>

                                            <!-- Шаблон за избраните чипове/значки в самото поле -->
                                            <ng-template pTemplate="selectedItems" let-colors>
                                                <div class="flex items-center gap-1 flex-wrap" *ngIf="colors && colors.length > 0">
                                                    <div *ngFor="let col of colors | slice: 0 : 3" class="flex items-center gap-1 bg-surface-100 text-surface-800 px-2 py-0.5 rounded text-sm border border-surface-200">
                                                        <span class="inline-block w-2 h-2 rounded-full" [style.backgroundColor]="getColorHex($any(col))"></span>
                                                        <span>{{ getColorLabel($any(col)) }}</span>
                                                    </div>
                                                    <span *ngIf="colors.length > 3" class="text-xs font-bold text-gray-500 ml-1"> +{{ colors.length - 3 }} {{ 'more' | translate }} </span>
                                                </div>
                                                <span *ngIf="!colors || colors.length === 0">
                                                    {{ 'Select_Colors' | translate }}
                                                </span>
                                            </ng-template>
                                        </p-multiSelect>
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

                                                    <p-button [label]="'Gen_by_AI' | translate" icon="pi pi-android" severity="help" [outlined]="true" size="small" (onClick)="openAIProductInfoGen(item)"></p-button>

                                                    <p-button
                                                        [label]="'Auto_Translate_To_Other_Languages' | translate"
                                                        icon="pi pi-sparkles"
                                                        severity="help"
                                                        [outlined]="true"
                                                        size="small"
                                                        [loading]="isTranslatingTitle()"
                                                        (onClick)="translateProductContent(lang, isTranslatingTitle, 1).subscribe()"
                                                        [hidden]="this.isNewProduct()"
                                                    >
                                                    </p-button>
                                                </div>

                                                <input pInputText class="w-full" [(ngModel)]="lang.name" (ngModelChange)="markAsEdited(1)" />
                                            </div>

                                            <!--                                            <div class="col-span-12">-->
                                            <!--                                                <div class="flex justify-between items-center mb-2">-->
                                            <!--                                                    <label class="block font-bold mb-2">{{ 'Short_Description' | translate }} </label>-->
                                            <!--                                                    <p-button-->
                                            <!--                                                        [label]="'Auto_Translate_To_Other_Languages' | translate"-->
                                            <!--                                                        icon="pi pi-sparkles"-->
                                            <!--                                                        severity="help"-->
                                            <!--                                                        [outlined]="true"-->
                                            <!--                                                        size="small"-->
                                            <!--                                                        [loading]="isTranslatingShortInformation()"-->
                                            <!--                                                        (onClick)="translateProductContent(lang, isTranslatingShortInformation, 2).subscribe()"-->
                                            <!--                                                        [hidden]="this.isNewProduct()"-->
                                            <!--                                                    >-->
                                            <!--                                                    </p-button>-->
                                            <!--                                                </div>-->

                                            <!--                                                &lt;!&ndash;                                                <p-editor [style]="{ height: '40vh', 'max-width': 'auto' }"&ndash;&gt;-->
                                            <!--                                                &lt;!&ndash;                                                          class="w-full" [(ngModel)]="lang.shortDescription"></p-editor>&ndash;&gt;-->

                                            <!--                                                <textarea [style]="{ height: '70vh', 'max-width': 'auto' }" class="w-full border-1 border-surface-300 border-solid" [(ngModel)]="lang.shortDescription" (ngModelChange)="markAsEdited(2)"> </textarea>-->
                                            <!--                                            </div>-->

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
                                                        (onClick)="translateProductContent(lang, isTranslatingInformation, 3).subscribe()"
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
                                        <ng-container *ngIf="isNotEuro()">
                                            <div class="col-span-12">
                                                <h3 class="text-xs font-bold text-gray-500 uppercase mb-2"><i class="pi pi-sync mr-1"></i> {{ 'Calculate_from_EUR' | translate }}</h3>
                                            </div>
                                            <div class="col-span-4">
                                                <label class="block font-bold mb-2 text-xs text-blue-600">{{ 'Price' | translate }} (EUR)</label>
                                                <p-inputNumber
                                                    [(ngModel)]="euroRegularPrice"
                                                    [placeholder]="isConverting() ? 'Calculating...' : '0.00'"
                                                    mode="currency"
                                                    currency="EUR"
                                                    (onBlur)="convertFromEuro('regular')"
                                                    class="w-full"
                                                    styleClass="w-full"
                                                ></p-inputNumber>
                                            </div>
                                            <div class="col-span-4">
                                                <label class="block font-bold mb-2 text-xs text-blue-600">{{ 'Sale_Price' | translate }} (EUR)</label>
                                                <p-inputNumber [(ngModel)]="euroSalePrice" mode="currency" currency="EUR" (onBlur)="convertFromEuro('sale')" class="w-full" styleClass="w-full"></p-inputNumber>
                                            </div>
                                            <div class="col-span-12">
                                                <hr class="my-3 border-gray-200" />
                                            </div>
                                        </ng-container>

                                        <div class="col-span-12">
                                            <h3 class="text-sm font-bold uppercase text-blue-700 mb-2"><i class="pi pi-tag mr-2"></i>{{ 'Main_Pricing_for' | translate }} : {{ selectedSite.name }}</h3>
                                        </div>

                                        <div class="col-span-4">
                                            <label class="block font-bold mb-2 text-xs text-gray-600">{{ 'Price' | translate }} ({{ selectedSite.currency?.code }})</label>
                                            <p-inputNumber [(ngModel)]="currentSitePricing.regularPrice" [disabled]="isConverting()" mode="currency" [currency]="selectedSite.currency?.code || 'BGN'" class="w-full" styleClass="w-full"></p-inputNumber>
                                        </div>

                                        <div class="col-span-4">
                                            <label class="block font-bold mb-2 text-xs text-gray-600">{{ 'Sale_Price' | translate }} ({{ selectedSite.currency?.code }})</label>
                                            <p-inputNumber [(ngModel)]="currentSitePricing.price" [disabled]="isConverting()" mode="currency" [currency]="selectedSite.currency?.code || 'BGN'" class="w-full" styleClass="w-full"></p-inputNumber>
                                        </div>
                                    </div>
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

                                            <p-table [value]="currentAddonConfigs" [scrollable]="true" scrollHeight="300px" styleClass="p-datatable-sm shadow-1 border-round overflow-hidden" style="overflow: auto;">
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
                            <p-tabpanel value="4">
                                <div class="pt-4">
                                    <p-table [value]="item.history || []" [paginator]="true" [rows]="10" styleClass="p-datatable-sm shadow-1 border-round overflow-hidden" [rowHover]="true">
                                        <ng-template pTemplate="header">
                                            <tr>
                                                <th style="width: 20%">{{ 'Created' | translate }}</th>
                                                <th style="width: 20%">{{ 'Old_quantity' | translate }}</th>
                                                <th style="width: 20%">{{ 'New_quantity' | translate }}</th>
                                                <th style="width: 15%">{{ 'Quantity' | translate }}</th>
                                                <th style="width: 10%">{{ 'Reason' | translate }}</th>
                                                <th style="width: 10%">{{ 'Changed_by' | translate }}</th>
                                                <th style="width: 20%">{{ 'Order' | translate }}</th>
                                            </tr>
                                        </ng-template>
                                        <ng-template pTemplate="body" let-hist>
                                            <tr>
                                                <td>{{ hist.createTime | date: 'dd.MM.yyyy HH:mm' }}</td>

                                                <td>{{ hist.oldQuantity }}</td>
                                                <td>{{ hist.newQuantity }}</td>
                                                <td>
                                                    <span
                                                        [ngClass]="{
                                                            'text-green-600 font-bold': hist.newQuantity > hist.oldQuantity,
                                                            'text-red-600 font-bold': hist.newQuantity < hist.oldQuantity,
                                                            'text-gray-600 font-bold': hist.newQuantity === hist.oldQuantity || hist.oldQuantity == null
                                                        }"
                                                    >
                                                        <ng-container *ngIf="hist.oldQuantity != null && hist.newQuantity != null && hist.oldQuantity !== hist.newQuantity">
                                                            {{ hist.newQuantity > hist.oldQuantity ? '+' : '-' }}
                                                        </ng-container>

                                                        {{ hist.quantity }}
                                                    </span>
                                                </td>

                                                <td>{{ hist.reason }}</td>
                                                <td>{{ hist.changerName }}</td>

                                                <td>
                                                    <div class="flex flex-col gap-1.5">
                                                        <div *ngIf="hist.orderId" class="flex items-center gap-2 text-blue-600 font-medium text-sm" pTooltip="Системна поръчка">
                                                            <i class="pi pi-shopping-cart text-xs"></i>
                                                            <span>#{{ hist.orderId }}</span>
                                                        </div>

                                                        <div *ngIf="hist.wpOrderId" class="flex items-center gap-2 text-purple-600 font-medium text-sm" pTooltip="WP Поръчка">
                                                            <i class="pi pi-shopping-bag text-xs"></i>
                                                            <span>WP: #{{ hist.wpOrderId }}</span>
                                                        </div>

                                                        <div *ngIf="hist.productId" class="flex items-center gap-2 text-gray-600 font-medium text-sm" pTooltip="ID на продукта">
                                                            <i class="pi pi-box text-xs"></i>
                                                            <span>ID: {{ hist.productId }}</span>
                                                        </div>

                                                        <div *ngIf="hist.productSku" class="flex items-center gap-2 text-teal-600 font-medium text-sm" pTooltip="Артикулен номер (SKU)">
                                                            <i class="pi pi-barcode text-xs"></i>
                                                            <span>SKU: {{ hist.productSku }}</span>
                                                        </div>

                                                        <span *ngIf="!hist.orderId && !hist.wpOrderId && !hist.productId && !hist.productSku" class="text-gray-400">-</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </ng-template>
                                        <ng-template pTemplate="emptymessage">
                                            <tr>
                                                <td colspan="4" class="text-center p-6 text-gray-400">
                                                    <i class="pi pi-inbox text-3xl mb-2 block"></i>
                                                    {{ 'No_records_found' | translate }}
                                                </td>
                                            </tr>
                                        </ng-template>
                                    </p-table>
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

                        <p-button *ngIf="isNewProduct() && activeTab !== '0'" [label]="'Back' | translate" icon="pi pi-chevron-left" [text]="true" severity="secondary" (onClick)="goBack()"></p-button>

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
                            console.log(site);
                            if (site) {
                                // Тъй като вече имаме избрания обект/ID, го сетваме директно
                                this.selectedSite = sites.find((value) => value.id === site);
                                this.syncSite = sites.find((value) => value.id === site);
                                console.log(this.syncSite);
                                // Автоматично избираме Български език
                                const languages = this.languageLService.items();
                                // this.selectedLanguage = languages.find((l) => l.code === 'bg');
                                this.selectedLanguage = languages.find((l) => l.id === this.syncSite.language.id);

                                // Извикваме логиката за промяна на език
                                this.onLanguageChange();
                                this.loadEuroPrices();

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
        this.euroRegularPrice.set(0);
        this.euroSalePrice.set(0);
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

    onVideoUpload(event: any, img: any) {
        const item = this.detailService.selectedItem();
        if (!item) return;

        const response = event.originalEvent.body[0];
        console.log(response);

        response['parent'] = img;
        response['isVideo'] = true;

        this.addImageToModel(item, response);
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
                next: (response: any[]) => {
                    this.ms.add({ severity: 'success', summary: 'Преведен тип ' + type });
                    signalM.set(false);

                    const item = this.detailService.selectedItem();
                    if (item && response) {
                        // Обхождаме всеки превод от масива
                        response.forEach((res) => {
                            // Намираме съответния език в локалния обект
                            const translation = item.translations.find((t) => t.language.id === res.languageId);

                            if (translation) {
                                // Обновяваме конкретното поле според типа
                                if (type === 1) translation.name = res.translatedText;
                                if (type === 2) translation.shortDescription = res.translatedText;
                                if (type === 3) translation.description = res.translatedText;
                            }
                        });

                        // Тъй като променяме свойства на обекта, а не самия обект,
                        // викаме detectChanges, за да се обновят полетата в HTML веднага.
                        this.cdr.detectChanges();
                    }
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

        // 1. Изолираме всички записани видеа, които имат валиден parent
        const videos = item.images.filter((img) => img.isVideo && img.parent && img.parent.id);

        // 2. Взимаме само чистите снимки (или temp файлове, които не са маркирани като видео)
        let images = item.images.filter((img) => !img.isVideo);

        if (this.syncSite && item.id && item.id !== 0) {
            images = images.filter((img) => {
                if (img.isTemp) return true;
                return (
                    img.siteMappings &&
                    img.siteMappings.length > 0 &&
                    img.siteMappings.some((m) => {
                        const mSiteId = (m as any).siteId || (m as any).site?.id;
                        return mSiteId == this.syncSite.id;
                    })
                );
            });
        }

        // 3. СВЪРЗВАНЕ: Закачаме линка на видеото директно върху обекта на неговата снимка-родител
        images.forEach((img: any) => {
            const associatedVideo = videos.find((v) => v.parent?.id === img.id);
            if (associatedVideo) {
                img.videoSrc = associatedVideo.localSrc; // Предаваме пътя на видеото (.mkv/.mp4)
                img.hasVideo = true; // Светваме флага, за да знае HTML-а
            }
        });

        return images;
    }

    // get filteredImages(): IWpImage[] {
    //
    // const item = this.detailService.selectedItem();
    //
    // if (!item || !item.images) return [];
    //
    //
    //
    // if (!item.id || item.id === 0) return item.images;
    //
    //
    //
    // if (this.syncSite) {
    //
    // return item.images.filter((img) => {
    //
    // if (img.isTemp) return true;
    //
    //
    //
    // // Ако масивът е празен (както в твоя JSON), тук ще върне false
    //
    // return (
    //
    // img.siteMappings &&
    //
    // img.siteMappings.length > 0 &&
    //
    // img.siteMappings.some((m) => {
    //
    // // Проверяваме всички възможни пътища до ID-то на сайта
    //
    // const mSiteId = (m as any).siteId || (m as any).site?.id;
    //
    // return mSiteId == this.syncSite.id;
    //
    // })
    //
    // );
    //
    // });
    //
    // }
    //
    //
    //
    // return item.images;
    //
    // }

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
        this.removeVideo(imgToRemove);
    }

    removeVideo(parentImg: any) {
        const item = this.detailService.selectedItem();
        if (!item || !item.images || !parentImg) return;

        // Намираме индекса на видеото, чийто родител съвпада с текущата снимка
        const videoIndex = item.images.findIndex((img) => img.isVideo && img.parent?.id === parentImg.id);

        if (videoIndex > -1) {
            // Премахваме видеото от оригиналния масив
            item.images.splice(videoIndex, 1);

            // Нулираме локалните флагове на снимката, за да се обнови интерфейса веднага
            parentImg.hasVideo = false;
            parentImg.videoSrc = null;

            this.ms.add({ severity: 'info', summary: 'Изтрито', detail: 'Видеото е премахнато от списъка.' });
            this.cdr.detectChanges();
        }
    }

    // 3. Добавяне на снимка (isTemp)
    private addImageToModel(item: IWpProduct, res: any) {
        const hasPrimary = item.images?.some((img) => img.isPrimary);

        const newImage: IWpImage = {
            id: 0,
            localSrc: res.url,
            tempName: res.fileName,
            isTemp: true,
            siteMappings: [],
            isPrimary: !hasPrimary,
            isVideo: res.isVideo || false,
            parent: res.parent
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
                        if (this.isTitleEdited) translationRequests.push(this.translateProductContent(bgTrans, this.isTranslatingTitle, 1));
                        // if (this.isShortDescriptionEdited)
                        //     translationRequests.push(this.translateProductContent(bgTrans, this.isTranslatingShortInformation, 2));
                        if (this.isDescriptionEdited) translationRequests.push(this.translateProductContent(bgTrans, this.isTranslatingInformation, 3));
                    }
                    if (translationRequests.length > 0) {
                        this.ms.add({ severity: 'info', summary: 'AI', detail: 'Моля изчакайте преводите...' });

                        // forkJoin чака ВСИЧКИ Observable в масива да приключат
                        forkJoin(translationRequests).subscribe(() => {
                            this.resetEditFlags();
                            this.executeFinalSave(item);
                        });
                    } else {
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
                    if (generatedTexts[2]) translation.description = generatedTexts[2];
                    // if (generatedTexts[3]) translation.description = generatedTexts[3];

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
        if (this.activeTab === '0') {
            if (!this.isMainInfoValid()) return; // Твоята проверка за задължителни полета

            this.confirmationService.confirm({
                header: this.tr.instant('Addons_Question'), // Заглавие
                message: this.tr.instant('Does_this_product_have_addons?'), // Съобщение
                icon: 'pi pi-question-circle',
                acceptLabel: this.tr.instant('Yes'), // Бутон ДА
                rejectLabel: this.tr.instant('No'), // Бутон НЕ
                acceptButtonStyleClass: 'p-button-success',
                rejectButtonStyleClass: 'p-button-secondary',
                accept: () => {
                    // Потребителят натисна ДА
                    this.activeTab = '3'; // Към Адони
                    this.cdr.detectChanges();
                },
                reject: () => {
                    // Потребителят натисна НЕ
                    // item.addonConfigs = [];
                    this.activeTab = '2'; // Директно към Цени
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
        // const hasBrand = !!item.brand;
        const hasCategories = this.detailService.selectedNodesArray()?.length > 0;
        const hasStatus = item.status !== null && item.status !== undefined;
        const hasLimit = item.saleType !== null && item.saleType !== undefined;
        const weight = item.weight !== undefined && true;
        const img = item.images.length > 0 ? item.images[0] : undefined;
        const isWeightMissing = !weight || weight.toString().trim() === ''; // Проверка за празно
        // Дефинираме списък с полетата и техните условия за валидност
        const fields = [
            { valid: hasCategories, name: 'Категории' },
            { valid: hasStatus, name: 'Статус' },
            { valid: hasLimit, name: 'Лимит' },
            { valid: !isWeightMissing && !this.isWeightInvalid, name: 'Тегло' },
            { valid: img, name: 'Изображение' }
        ];

        // Филтрираме само тези, които НЕ са валидни
        const invalidFieldNames = fields.filter((f) => !f.valid).map((f) => f.name);

        if (invalidFieldNames.length > 0) {
            this.ms.add({
                severity: 'warn',
                summary: 'Внимание',
                // Използваме join, за да изброим имената със запетая
                detail: `Моля, попълнете правилно следните полета: ${invalidFieldNames.join(', ')}!`
            });
            return false;
        }

        const hasPrimary = item.images.some((img) => img.isPrimary);

        if (!hasCategories || !hasStatus || !hasLimit || !weight || item.images.length === 0) {
            this.ms.add({ severity: 'warn', summary: 'Внимание', detail: 'Моля, попълнете Всички полета!' });
            return false;
        }

        if (!hasPrimary && item.images.length > 0) {
            this.ms.add({ severity: 'warn', summary: 'Внимание', detail: 'Моля, изберете главна снимка (звезда)!' });
            return false;
        }

        return true;
    }

    isTitleEdited: boolean = false;
    isShortDescriptionEdited: boolean = false;
    isDescriptionEdited: boolean = false;

    protected markAsEdited(type: number) {
        if (this.selectedLanguage?.code === 'bg') {
            if (type === 1) {
                this.isTitleEdited = true;
            } else if (type === 2) {
                this.isShortDescriptionEdited = true;
            } else if (type === 3) {
                this.isDescriptionEdited = true;
            }
        }
    }

    // Метод за задаване на главна снимка
    setPrimaryImage(selectedImg: IWpImage) {
        const item = this.detailService.selectedItem();
        if (!item || !item.images) return;

        item.images.forEach((img) => {
            // Ако кликнем върху вече избрана звезда, може да я деактивираме (опционално)
            // Тук логиката е: винаги прави избраната True, а другите False
            img.isPrimary = img === selectedImg;
        });
    }

    euroRegularPrice = signal<number | null>(null);
    euroSalePrice = signal<number | null>(null);
    isConverting = signal(false);

    // Проверка дали избраната валута е различна от EUR
    isNotEuro(): boolean {
        return this.selectedSite?.currency?.code !== 'EUR';
    }

    convertFromEuro(target: 'regular' | 'sale') {
        const amount = target === 'regular' ? this.euroRegularPrice() : this.euroSalePrice();
        const targetCurrency = this.selectedSite?.currency?.code;

        if (!amount || !targetCurrency || targetCurrency === 'EUR') return;

        this.isConverting.set(true);

        let g: CurrencyCalc = {
            fromAmount: amount,
            fromCode: 'EUR',
            toCode: targetCurrency
        };
        this.detailService.convertCurrency(g).subscribe({
            next: (result: number) => {
                if (target === 'regular') {
                    this.currentSitePricing!.regularPrice = result;
                } else {
                    this.currentSitePricing!.price = result;
                }
                this.isConverting.set(false);
                this.cdr.detectChanges();
            },
            error: () => {
                this.ms.add({ severity: 'error', summary: 'Error', detail: 'Currency conversion failed' });
                this.isConverting.set(false);
            }
        });
    }

    loadEuroPrices() {
        const pricing = this.currentSitePricing;
        const targetCurrency = this.selectedSite?.currency?.code;

        // Ако няма цени или валутата е вече EUR, няма какво да превръщаме
        if (!pricing || !targetCurrency || targetCurrency === 'EUR') {
            this.euroRegularPrice.set(null);
            this.euroSalePrice.set(null);
            return;
        }

        if (pricing.regularPrice > 0 || pricing.price > 0) {
            this.isConverting.set(true);

            // Масив от заявки, които да изпълним паралелно
            const tasks = [];

            if (pricing.regularPrice > 0) {
                tasks.push(
                    this.detailService
                        .convertCurrency({
                            fromAmount: pricing.regularPrice,
                            fromCode: targetCurrency,
                            toCode: 'EUR'
                        })
                        .pipe(tap((res) => this.euroRegularPrice.set(res)))
                );
            }

            if (pricing.price > 0) {
                tasks.push(
                    this.detailService
                        .convertCurrency({
                            fromAmount: pricing.price,
                            fromCode: targetCurrency,
                            toCode: 'EUR'
                        })
                        .pipe(tap((res) => this.euroSalePrice.set(res)))
                );
            }

            forkJoin(tasks).subscribe({
                next: () => {
                    this.isConverting.set(false);
                    this.cdr.detectChanges();
                },
                error: () => this.isConverting.set(false)
            });
        }
    }

    onTabChange(event: any) {
        this.activeTab = event;
        if (this.activeTab === '2' || this.activeTab === 2) {
            this.loadEuroPrices();
        }
    }

    get isWeightInvalid(): boolean {
        const val = this.detailService.selectedItem()?.weight?.toString().trim();

        // 1. Ако е празно, не е грешка
        if (!val) return false;

        // 2. Проверка за "0": ако започва с 0, следващият символ МОЖЕ да е само разделител
        // Позволява "0", но забранява "06", "055"
        if (val.startsWith('0') && val.length > 1 && val[1] !== '.' && val[1] !== ',') {
            return true;
        }

        // 3. Ако е чисто число (без точка/запетая), проверяваме дължината
        if (!val.includes('.') && !val.includes(',')) {
            // Позволява "1" и "11", но забранява "111", "1111" и т.н.
            return val.length > 2;
        }

        // 4. Ако има разделител, проверяваме позицията му
        // Трябва да е след 1-вата или 2-рата цифра (индекс 1 или 2)
        const separatorIndex = val.indexOf('.') !== -1 ? val.indexOf('.') : val.indexOf(',');

        if (separatorIndex > 2 || separatorIndex === 0) {
            return true;
        }

        // 5. Проверка дали има цифра след разделителя (ако потребителят е сложил такъв)
        // Ако завършва на '.' или ',', го считаме за временно невалидно
        if (val.endsWith('.') || val.endsWith(',')) {
            return true;
        }

        return false;
    }

    // 1. Дефинираме наличните цветове (сложи го под activeTab например)
    protected availableColors: any[] = [
        { name: 'white', label: 'Бял', hex: '#ffffff' },
        { name: 'black', label: 'Черен', hex: '#1a1a1a' },
        { name: 'red', label: 'Червен', hex: '#ff0000' }
    ];
    // 2. Помощен метод за вземане на HEX кода при визуализация на избраното
    getColorHex(colorName: string): string {
        const color = this.availableColors.find((c) => c.name === colorName);
        return color ? color.hex : '#ccc';
    }

    // 3. Помощен метод за вземане на етикета на български
    getColorLabel(colorName: string): string {
        const color = this.availableColors.find((c) => c.name === colorName);
        return color ? color.label : colorName;
    }

    // Добави тези променливи в класа на компонента

    playVideo(videoSrc: string) {
        if (!videoSrc) {
            console.error('Липсва видео линк!');
            return;
        }

        // 1. Поправяме пътя до видеото
        const fullUrl = this.baseUrl + videoSrc;
        console.log('Зареждане на видео от:', fullUrl);
        window.open(fullUrl, '_blank');

        this.ms.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Видео файлът (.mp4) се сваля.'
        });
    }
}
