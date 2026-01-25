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
import { WpProductDetailService } from './detail.service';
import { ProductUnit } from './interfaces';


@Component({
    selector: 'wp_product-detail',
    standalone: true,
    imports: [Dialog, Button, FormsModule, CommonModule, ButtonDirective, TranslatePipe, Select],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true"
                  [style]="{ width: '500px' }">
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
                <div class="grid grid-cols-12 gap-4 pt-2" *ngIf="detailService.selectedItem() as item">


                    <div class="col-12 md:col-3">
                        <label>{{ 'Unit' | translate }}</label>
                        <p-select [options]="productUnit" [(ngModel)]="item.unit" optionLabel="label" optionValue="value"></p-select>
                    </div>





                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()" />
<!--                          (onClick)="onSave()" />-->
            </ng-template>
        </p-dialog>
    `
})
export class WpCategoryDetailComponent {
    protected detailService = inject(WpProductDetailService);
    protected languageService = inject(LanguageListService);
    protected tr = inject(TranslateService);

    constructor() {
        this.languageService.loadList(0, 1000);
        this.tr.onLangChange.subscribe(lang => {
              this.generateUnitOptions();
        })
        effect(() => {
        });
    }

    protected productUnit: any[] = [];
    private generateUnitOptions() {
        this.productUnit = Object.keys(ProductUnit)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                // Вече instant() ще има достъп до преводите, защото се вика след смяна на езика
                label: this.tr.instant(`UNIT.${key}`),
                value: ProductUnit[key as keyof typeof ProductUnit]
            }));
    }
}
