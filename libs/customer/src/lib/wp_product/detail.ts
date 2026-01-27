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
import { ProductStatus, ProductUnit } from './interfaces';
import { InputNumber } from 'primeng/inputnumber';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Textarea } from 'primeng/textarea';
import { SiteListService } from '../site/list.service';

@Component({
    selector: 'wp_product-detail',
    standalone: true,
    imports: [Dialog, Button, FormsModule, CommonModule, TranslatePipe, Select, InputText, InputNumber, TabPanel, TabPanels, Tabs, TabList, Tab, Textarea],
    template: `
        <p-dialog [breakpoints]="{ '1199px': '85vw', '575px': '95vw' }" [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ 'min-width': '1000px', 'min-height': '90vh' }">
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
                                                <textarea pInputTextarea rows="5" class="w-full" [(ngModel)]="lang.shortDescription"></textarea>
                                            </div>

                                            <div class="col-span-12">
                                                <label class="block font-bold mb-2">{{ 'Description' | translate }}</label>
                                                <textarea pInputTextarea rows="8" class="w-full" [(ngModel)]="lang.description"></textarea>
                                            </div>
                                        </div>
                                    </ng-container>
                                </div>
                                <div *ngIf="!selectedLanguage"
                                     class="flex flex-column align-items-center justify-content-center p-8 text-gray-400 border-2 border-dashed border-round surface-50">
                                    <i class="pi pi-language text-4xl mb-3"></i>
                                    <span class="text-xl font-medium">{{'Please_select_a_language_to_view_or_add_a_translation.' | translate}}</span>
                                </div>
                            </p-tabpanel>


                            <p-tabpanel value="2">
                                <div class="pt-4">
                                    <ng-container *ngFor="let lang of item.translations">
                                        <div class="grid grid-cols-12 gap-4" *ngIf="lang.language.id === selectedLanguage?.id">
                                            <div class="col-span-12">
                                                <label class="block font-bold mb-2">{{ 'Product_Name' | translate }}</label>
                                                <input pInputText class="w-full" [(ngModel)]="lang.name" />
                                            </div>

                                            <div class="col-span-12">
                                                <label class="block font-bold mb-2">{{ 'Short_Description' | translate }}</label>
                                                <textarea pInputTextarea rows="5" class="w-full" [(ngModel)]="lang.shortDescription"></textarea>
                                            </div>

                                            <div class="col-span-12">
                                                <label class="block font-bold mb-2">{{ 'Description' | translate }}</label>
                                                <textarea pInputTextarea rows="8" class="w-full" [(ngModel)]="lang.description"></textarea>
                                            </div>
                                        </div>
                                    </ng-container>
                                </div>
                                <div *ngIf="!selectedSite"
                                     class="flex flex-column align-items-center justify-content-center p-8 text-gray-400 border-2 border-dashed border-round surface-50">
                                    <i class="pi pi-language text-4xl mb-3"></i>
                                    <span class="text-xl font-medium">{{'Please_select_a_site_to_view' | translate}}</span>
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
                            [options]="languageService.items()"
                            [(ngModel)]="selectedLanguage"
                            (onChange)="onLanguageChange()"
                            optionLabel="name"
                            placeholder="Избери език"
                            [style]="{ width: '220px' }">
                        </p-select>

                        <p-select
                            [options]="siteService.items()"
                            [(ngModel)]="selectedSite"
                            (onChange)="onSiteChange()"
                            optionLabel="name"
                            [placeholder]="('Choose' | translate) + ' ' + ('Site' | translate)"
                            [style]="{ width: '220px' }">
                        </p-select>
                    </div>

                    <div class="flex gap-2 items-end">
                        <p-button
                            label="Отказ"
                            severity="secondary"
                            [text]="true"
                            (onClick)="detailService.closeDetail()" />

                        <p-button
                            label="Запис"
                            icon="pi pi-check"
                            [loading]="detailService.isSaving()"
                            (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
                    </div>

                </div>
            </ng-template>
        </p-dialog>
    `
})
export class WpCategoryDetailComponent {
    protected detailService = inject(WpProductDetailService);
    protected languageService = inject(LanguageListService);
    protected siteService = inject(SiteListService);
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
                m_image: '',
                name: '',
                price: 0,
                regularPrice: 0,
                shortDescription: '',
                sku: '',
                slug: '',
                status_p: ProductStatus.DRAFT,
                wpProductId: 0,
                language: { ...this.selectedLanguage }
            });
        }
        // this.currentTranslation = item.translations.find(
        //     value => value.id === this.selectedLanguage.id
        // ) || null;
    }
    onSiteChange() {

    }

    constructor() {
        this.languageService.loadList(0, 1000);
        this.siteService.loadList(0, 1000);
        this.tr.onLangChange.subscribe((lang) => {
            this.generateUnitOptions();
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
}
