import { ChangeDetectorRef, Component, effect, inject, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import { WpAddonDetailService } from './detail.service';
import { Select } from 'primeng/select';
import { LanguageListService } from '../language/list.service';
import { PickList } from 'primeng/picklist';
import { PrimeTemplate } from 'primeng/api';
import { IWpAddonValue } from '../wp_addon_value/interfaces';
import { Tooltip } from 'primeng/tooltip';
import { WpAddonValueDetailService } from '../wp_addon_value/detail.service';
import { WpAddonValueDetailComponent } from '../wp_addon_value/detail';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';


@Component({
    selector: 'wp_addon-detail',
    standalone: true,
    imports: [Dialog, Button, InputText, FormsModule, CommonModule, TranslatePipe, Select, PickList, PrimeTemplate, ButtonDirective, Tooltip, WpAddonValueDetailComponent],
    template: `
        <p-dialog [breakpoints]="{ '1199px': '75vw', '575px': '90vw' }" [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ width: '850px' }">
            <!--                        [header]="detailService.selectedItem()?.id ? 'Редакция на потребител #' + detailService.selectedItem()?.id : 'Нов потребител'"
-->
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <!--                        {{ detailService.selectedItem()?.id ? 'Редакция на клиент #' + detailService.selectedItem()?.id : 'Нов клиент' }}-->
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Addon' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Addon' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div class="grid grid-cols-12 gap-4 pt-2" *ngIf="detailService.selectedItem() as item">
                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Select_Language' | translate }}</label>
                        <p-select [options]="languageService.items()" [(ngModel)]="selectedLanguage" (onChange)="onLanguageChange()" optionLabel="name" placeholder="Избери език" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Group_name' | translate }} ({{ selectedLanguage?.code }})</label>
                        <input pInputText [ngModel]="currentTranslationName()" (ngModelChange)="currentTranslationName.set($event)" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Slug' | translate }}</label>
                        <input pInputText [(ngModel)]="item.slug" disabled class="w-full" />
                    </div>

                    <div class="col-span-12 mt-2">
                        <label class="block font-bold mb-2">{{ 'addQuickValue' | translate }}</label>
                        <div class="flex gap-2">
                            <input pInputText #newValueInput placeholder="{{ 'New_value' | translate }} ..." class="flex-grow" />
                            <button pButton icon="pi pi-plus" (click)="addQuickValue(newValueInput)"></button>
                        </div>
                    </div>

                    <div class="col-span-12 mt-4">
                        <label class="block font-bold mb-2">{{ 'Addon_values' | translate }}</label>
                        <p-pickList
                            [filterBy]="'slug'"
                            sourceFilterPlaceholder="Търси в налични..."
                            [showSourceFilter]="true"
                            [showTargetFilter]="false"
                            [source]="availableValues"
                            [target]="selectedValues"
                            [responsive]="true"
                            [sourceStyle]="{ height: '200px' }"
                            [targetStyle]="{ height: '200px' }"
                            sourceHeader="Налични"
                            targetHeader="Избрани"
                        >
                            <ng-template let-val pTemplate="item">
                                <div class="flex items-center justify-between w-full pr-2">
                                    <div>{{ val.translations[selectedLanguage?.code]?.label || ('No_translate' | translate) }}</div>

                                    <button
                                        pButton
                                        icon="pi pi-language"
                                        class="p-button-rounded p-button-text p-button-sm p-0 h-8 w-8 min-w-[2rem]"
                                        (click)="$event.stopPropagation(); openEditDialog(val)"
                                        [pTooltip]="'Add_translate' | translate"
                                    ></button>
                                </div>
                            </ng-template>
                        </p-pickList>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="onSaveAll()" />
            </ng-template>
        </p-dialog>
        <wp_addon_value-detail *ngIf="config?.data?.mode !== 'lookup'"></wp_addon_value-detail>
    `
})
export class WpAddonDetailComponent {
    activeTab: any = 0;
    protected detailService = inject(WpAddonDetailService);
    protected languageService = inject(LanguageListService);

    protected addonValueDetailService = inject(WpAddonValueDetailService);
    protected config = inject(DynamicDialogConfig, { optional: true });

    // Списъци за PickList
    availableValues: IWpAddonValue[] = [];
    selectedValues: IWpAddonValue[] = [];

    selectedLanguage: any = null;
    currentTranslationName = signal<string>(''); // Сигнал

    constructor() {
        this.languageService.loadList(0, 1000);

        effect(() => {
            const isVisible = this.detailService.isVisible();
            const item = this.detailService.selectedItem();

            if (isVisible && item) {
                // Обгръщаме всичко в един setTimeout
                setTimeout(() => {
                    // 1. Езикова инициализация
                    const languages = this.languageService.items();
                    if (languages.length > 0) {
                        this.selectedLanguage = languages[0];
                        this.onLanguageChange();
                    }

                    // 2. Зареждане на стойностите
                    if (item.id != undefined) {
                        this.detailService.getAddonSelectedValues(item.id).subscribe((res) => {
                            // Пълним масивите тук
                            this.availableValues = res.availableValues ?? [];
                            this.selectedValues = res.selectedValues ?? [];
                            this.cdr.detectChanges(); // Ръчно обновяване
                        });
                    } else {
                        this.detailService.getAllAvailableValues().subscribe((res) => {
                            this.availableValues = res;
                            this.selectedValues = [];
                            this.cdr.detectChanges();
                        });
                    }
                }, 0); // 0ms е достатъчно
            }
        });
    }

    openEditDialog(val: any) {
        setTimeout(() => {
            this.addonValueDetailService.openEditDialog(val);
            console.log(val);
        }, 0);
    }

    loadValues(addonGroupId: number | null) {
        if (!addonGroupId) {
            // Ако е нов аддон, просто взимаме всички налични стойности
            this.detailService.getAllAvailableValues().subscribe((res) => {
                this.availableValues = res;
                this.selectedValues = [];
            });
            return;
        }

        // // Ако е редакция, викаме Detail метода, който ти написах за Java
        // this.detailService.getAddonDetail(addonGroupId).subscribe((res) => {
        //     this.availableValues = res.availableValues;
        //     this.selectedValues = res.selectedValues;
        // });
    }

    onLanguageChange() {
        const item = this.detailService.selectedItem();
        if (!item || !this.selectedLanguage) return;

        // Взимаме кода на езика (напр. 'bg' или 'en')
        const langCode = this.selectedLanguage.code;

        // Проверяваме дали в обекта има превод за този език
        // Приемаме, че Java връща translations като Map<string, string>
        const translations = (item as any).translations || {};

        // Обновяваме името, което се вижда в input полето
        const nameForLang = translations[langCode] || '';

        // Ако ползваш сигнал за името:
        this.currentTranslationName.set(nameForLang);

        // А ако ползваш променлива с ngModel:
        // this.currentName = nameForLang;
    }

    // onSave() {
    //     const item = this.detailService.selectedItem();
    //     if (item && this.selectedLanguage) {
    //         // ВАЖНО: Тук подаваме стойността на сигнала като currentTranslationName()
    //         this.detailService
    //             .saveTranslation(
    //                 item.id,
    //                 this.selectedLanguage.id,
    //                 this.currentTranslationName() // Взимаме стринга от сигнала
    //             )
    //             .subscribe({
    //                 next: (savedItem) => {
    //                     // Опционално: затвори диалога или покажи съобщение
    //                     this.detailService.closeDetail();
    //                     this.detailService.onSaveSuccess$.next(savedItem);
    //                 }
    //             });
    //     }
    // }

    onSaveAll() {
        const item = this.detailService.selectedItem();
        if (!item || !this.selectedLanguage) return;

        // Сглобяваме обекта ръчно (Custom Payload)
        const payload = {
            id: item.id,
            slug: item.slug,
            name: this.currentTranslationName(),
            langId: this.selectedLanguage.id,
            valueIds: this.selectedValues.map((v) => v.id)
        };

        // Директна HTTP заявка чрез сервиза
        this.detailService.saveItem(payload).subscribe({
            next: (response) => {
                console.log('Записът е успешен:', response);

                // 1. Затваряме диалога
                this.detailService.closeDetail();

                // 2. Ръчно казваме на списъка да се обнови (ако имаш такъв сигнал)
                this.detailService.onSaveSuccess$.next(response);

                // Можеш да добавиш обикновен alert тук, ако не искаш Toast
                // alert('Записано успешно!');
            },
            error: (err) => {
                console.error('Грешка при обикновената заявка:', err);
                alert('Възникна грешка при записа.');
            }
        });
    }

    private cdr = inject(ChangeDetectorRef);
    addQuickValue(input: any) {
        const val = input.value.trim();
        if (!val) return;

        this.detailService
            .quickSaveValue({
                label: val,
                langId: this.selectedLanguage.id
            })
            .subscribe((newVal) => {
                // 3. Обновяваме масива с нов референс
                this.availableValues = [newVal, ...this.availableValues];
                input.value = '';

                // 4. КЛЮЧЪТ: Форсираме Angular да прерисува веднага
                this.cdr.detectChanges();
            });
    }
}
