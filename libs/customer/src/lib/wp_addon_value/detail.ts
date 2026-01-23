import { Component, effect, inject, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WpAddonValueDetailService } from './detail.service';
import { Select } from 'primeng/select';
import { LanguageListService } from '../language/list.service';


@Component({
    selector: 'wp_addon_value-detail',
    standalone: true,
    imports: [Dialog, Button, FormsModule, CommonModule, TranslatePipe, Select, InputText],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ width: '500px' }">
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
                <div class="grid grid-cols-12 gap-4 pt-2" *ngIf="detailService.selectedItem() as item">
                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Select_Language' | translate }}</label>
                        <p-select [options]="languageService.items()" [(ngModel)]="selectedLanguage" (onChange)="onLanguageChange()" optionLabel="name" placeholder="Избери език" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Value_Label' | translate }} ({{ selectedLanguage?.code }})</label>
                        <input pInputText [ngModel]="currentTranslationLabel()" (ngModelChange)="onLabelChange($event)" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Slug' | translate }}</label>
                        <input pInputText [(ngModel)]="item.slug" [disabled]="true" class="w-full opacity-70" />
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
            </ng-template>
        </p-dialog>
    `
})
export class WpAddonValueDetailComponent {
    activeTab: any = 0;
    protected detailService = inject(WpAddonValueDetailService);
    // protected currencyService = inject(CurrencyListService);
    protected languageService = inject(LanguageListService);

    selectedLanguage: any = null;
    currentTranslationLabel = signal<string>('');
    constructor() {
        this.languageService.loadList(0, 1000);

        // Ефект за инициализация при отваряне
        effect(() => {
            const isVisible = this.detailService.isVisible();
            const item = this.detailService.selectedItem();

            if (isVisible && item) {
                // Изчакваме езиците да се заредят
                setTimeout(() => {
                    const languages = this.languageService.items();
                    if (languages.length > 0 && !this.selectedLanguage) {
                        this.selectedLanguage = languages[0];
                        this.onLanguageChange();
                    }
                }, 0);
            }
        });
    }

    onLanguageChange() {
        const item = this.detailService.selectedItem();
        if (!item || !this.selectedLanguage) return;

        // Взимаме превода от обекта (translations е Map в DTO-то ти)
        const translations = (item as any).translations || {};
        const langCode = this.selectedLanguage.code;

        // При Addon Value полето обикновено е 'label'
        // Ако в Java идва като обект {label: '...'}, ползвай translations[langCode]?.label
        const label = translations[langCode]?.label || translations[langCode] || '';

        this.currentTranslationLabel.set(label);
    }

    onLabelChange(newVal: string) {
        this.currentTranslationLabel.set(newVal);
        const item = this.detailService.selectedItem();

        if (item && this.selectedLanguage) {
            if (!item.translations) item.translations = {};

            const langCode = this.selectedLanguage.code;

            // Проверяваме дали вече съществува обект за този език
            if (item.translations[langCode] && typeof item.translations[langCode] === 'object') {
                item.translations[langCode].label = newVal;
                // Уверяваме се, че languageCode присъства, дори и при обновяване
                item.translations[langCode].languageCode = langCode;
            } else {
                // Създаваме нов обект, който отговаря на интерфейса IWpAddonValueTranslation
                item.translations[langCode] = {
                    label: newVal,
                    languageCode: langCode // Вече TypeScript ще е доволен
                };
            }
        }
    }
}
