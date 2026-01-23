import { Component, effect, inject, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Checkbox } from 'primeng/checkbox';
import { CurrencyListService } from '../currency/list.service';
import { Select } from 'primeng/select';
import { LanguageListService } from '../language/list.service';
import { WpCategoryDetailService } from './detail.service';


@Component({
    selector: 'wp_category-detail',
    standalone: true,
    imports: [Dialog, Button, InputText, FormsModule, CommonModule, ButtonDirective, TranslatePipe, Select],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true"
                  [style]="{ width: '500px' }">
            <!--                        [header]="detailService.selectedItem()?.id ? 'Редакция на потребител #' + detailService.selectedItem()?.id : 'Нов потребител'"
-->
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <!--                        {{ detailService.selectedItem()?.id ? 'Редакция на клиент #' + detailService.selectedItem()?.id : 'Нов клиент' }}-->
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Category' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Category' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div class="grid grid-cols-12 gap-4 pt-2" *ngIf="detailService.selectedItem() as item">

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Select Language' | translate }}</label>
                        <p-select [options]="languageService.items()"
                                  [(ngModel)]="selectedLanguage"
                                  (onChange)="onLanguageChange()"
                                  optionLabel="name"
                                  placeholder="Избери език"
                                  class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Category Name' | translate }} ({{selectedLanguage?.name}})</label>
                        <input pInputText [ngModel]="currentTranslationName()" (ngModelChange)="currentTranslationName.set($event)" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">Родителска категория</label>
                        <div class="p-inputgroup max-w-md">
                            <input pInputText [readonly]="true"
                                   [placeholder]="selectedParentName() || 'Основна категория'"
                                   class="w-90" />
                            <button type="button" pButton
                                    icon="pi pi-search"
                                    (click)="openParentLookup()"
                                    severity="secondary">
                            </button>

                            <button *ngIf="selectedParentId()"
                                    type="button" pButton
                                    icon="pi pi-times"
                                    (click)="clearParent()"
                                    severity="danger">
                            </button>
                        </div>
                    </div>

<!--                    <div class="col-span-12">-->
<!--                        <label class="block font-bold mb-2">{{ 'Global Slug' | translate }}</label>-->
<!--                        <input pInputText [(ngModel)]="item.slug" class="w-full opacity-60" />-->
<!--                    </div>-->


                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()"
                          (onClick)="onSave()" />
            </ng-template>
        </p-dialog>
    `
})
export class WpCategoryDetailComponent {
    protected detailService = inject(WpCategoryDetailService);
    protected languageService = inject(LanguageListService);

    selectedLanguage: any = null;
    currentTranslationName = signal<string>(''); // Сигнал

    constructor() {
        this.languageService.loadList(0, 1000);

        effect(() => {
            const isVisible = this.detailService.isVisible();
            const item = this.detailService.selectedItem();

            if (isVisible && item) {

                if(item.parentId){
                    this.selectedParentId.set(item.parentId);
                    this.selectedParentName.set(item.parentName);
                } else this.clearParent();

                // Използваме setTimeout тук, за да гарантираме, че инициализацията
                // се случва СЛЕД като диалогът е напълно зареден в DOM
                setTimeout(() => {
                    const languages = this.languageService.items();
                    if (languages.length > 0) {
                        this.selectedLanguage = languages[0];
                        this.onLanguageChange();
                    }
                });
            }
        });
    }

    onLanguageChange() {
        const categoryId = this.detailService.selectedItem()?.id;
        if (categoryId && this.selectedLanguage) {
            this.detailService.getTranslation(categoryId, this.selectedLanguage.id)
                .subscribe(val => {
                    // Когато използваме Signal, просто правим .set()
                    // Ако все пак имаш NG0100, Promise.resolve() е тук за застраховка
                    Promise.resolve().then(() => {
                        this.currentTranslationName.set(val || '');
                    });
                });
        }
    }

    onSave() {
        const item = this.detailService.selectedItem();
        if (item && this.selectedLanguage) {
            // ВАЖНО: Тук подаваме стойността на сигнала като currentTranslationName()
            this.detailService.saveTranslation(
                item.id,
                this.selectedLanguage.id,
                this.currentTranslationName(), // Взимаме стринга от сигнала
                this.selectedParentId()
            ).subscribe({
                next: (savedItem) => {
                    // Опционално: затвори диалога или покажи съобщение
                    this.detailService.closeDetail();
                    this.detailService.onSaveSuccess$.next(savedItem);
                }
            });
        }
    }

    // Сигнали за името и ID на родителя
    selectedParentName = signal<string | null>(null);
    selectedParentId = signal<number | null>(null);

    async openParentLookup() {
        // Отваряме същия списък с категории, но в режим 'lookup'
        const result = await this.detailService.openLookup('wp_category/list', 'Избери родител');

        if (result) {
            // Резултатът е обекта, който идва от onRowClick в списъка
            this.selectedParentId.set(result.id);
            this.selectedParentName.set(result.name); // Тук ще е "BG | EN"
        }
    }

    clearParent() {
        this.selectedParentId.set(null);
        this.selectedParentName.set(null);
    }
}
