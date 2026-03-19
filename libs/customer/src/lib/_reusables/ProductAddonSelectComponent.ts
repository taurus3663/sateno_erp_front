import { Component, inject, signal } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'app-product-addon-selector',
    imports: [CommonModule, Select, Button, FormsModule, TranslatePipe],
    template: `
        <div class="flex flex-col gap-5 p-2">
            <label class="font-medium text-lg">{{ label() | translate }}</label>

            <p-select
                [options]="addons()"
                [(ngModel)]="selectedAddon"

                [placeholder]="'Choose' | translate"
                class="w-full"
                [appendTo]="'body'">
                <ng-template #selectedItem let-selectedOption>
                    <div *ngIf="selectedOption">
                        {{ getTranslation(selectedOption) }}
                        <span *ngIf="selectedOption.priceModifier > 0" class="text-green-600 font-bold ml-2">
                    +{{ selectedOption.priceModifier | number: '1.2-2' }} {{ selectedOption.site?.currency?.symbol || selectedOption.site?.currency?.code }}
                </span>
                        <span *ngIf="selectedOption.priceModifier === 0" class="text-secondary opacity-50 italic ml-2">
                    ({{ 'Free' | translate }})
                </span>
                    </div>
                </ng-template>

                <ng-template #item let-option>
                    <div class="flex justify-content-between w-full">
                        <span>{{ getTranslation(option) }}</span>
                        <span *ngIf="option.priceModifier > 0" class="text-green-600 font-bold ml-2">
                    +{{ option.priceModifier | number: '1.2-2' }} {{ option.site?.currency?.symbol || option.site?.currency?.code }}
                </span>
                        <span *ngIf="option.priceModifier === 0" class="text-secondary opacity-50 italic ml-2">
                    ({{ 'Free' | translate }})
                </span>
                    </div>
                </ng-template>

            </p-select>

            <div class="flex justify-end gap-3 mt-2">
                <p-button [label]="'Cancel' | translate" severity="secondary" [text]="true" (onClick)="close()" />
                <p-button [label]="'Confirm' | translate" icon="pi pi-check" [disabled]="!selectedAddon" (onClick)="confirm()" />
            </div>
        </div>
    `
})
export class ProductAddonSelectComponent {
    protected ref = inject(DynamicDialogRef);
    protected config = inject(DynamicDialogConfig);

    label = signal(this.config.data?.label || '');
    addons = signal(this.config.data?.items || []);

    // Пазим целия избран обект, за да имаме id и priceModifier
    selectedAddon: any = null;

    // Помощна функция за намиране на превод според езика на сайта
    getTranslation(option: any): string {
        if (!option?.addonValue?.translations) return '';

        // Вземаме кода на езика от обекта на сайта (напр. 'bg')
        const siteLangCode = option.site?.language?.code || 'bg';

        // Търсим превод, който съвпада с езика на сайта
        const translation = option.addonValue.translations.find(
            (t: any) => t.language.code === siteLangCode
        );

        // Връщаме намерения превод или първия наличен като fallback
        return translation ? translation.label : option.addonValue.translations[0]?.label || 'No label';
    }

    close() { this.ref.close(); }

    confirm() {
        // Връщаме целия обект, за да може в OrderDetail да сметнем цената
        this.ref.close(this.selectedAddon);
    }
}
