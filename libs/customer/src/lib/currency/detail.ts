import { Component, inject } from '@angular/core';
import { CurrencyDetailService } from './detail.service';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    selector: 'currency-detail',
    standalone: true,
    imports: [InputNumberModule, Dialog, Button, InputText, FormsModule, CommonModule, ButtonDirective, TranslatePipe, InputNumberModule],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ width: '500px' }">
            <!--                        [header]="detailService.selectedItem()?.id ? 'Редакция на потребител #' + detailService.selectedItem()?.id : 'Нов потребител'"
-->
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
<!--                        {{ detailService.selectedItem()?.id ? 'Редакция на валута #' + detailService.selectedItem()?.id : 'Нова валута' }}-->
                        {{ detailService.selectedItem()?.id
                        ? ( 'Edit' | translate ) + ' ' + ( 'Currency' | translate ) + ' #' + detailService.selectedItem()?.id
                        : ( 'New' | translate ) + ' ' + ( 'Currency' | translate )
                        }}                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div class="grid grid-cols-12 gap-4 pt-2" *ngIf="detailService.selectedItem() as item">
                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Name' | translate }}</label>
                        <input pInputText [(ngModel)]="item.name" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Code' | translate }}</label>
                        <input pInputText [(ngModel)]="item.code" class="w-full" />

                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Symbol' | translate }}</label>
                        <input pInputText [(ngModel)]="item.symbol" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'DecimalPlaces' | translate }}</label>
                        <p-inputNumber [(ngModel)]="item.decimalPlaces" inputId="integeronly" class="w-full"></p-inputNumber>
                    </div>

                    <!--                    <button type="button" pButton icon="pi pi-search" (click)="openLookup()"></button>-->
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
            </ng-template>
        </p-dialog>
    `
})
export class CurrencyDetailComponent {
    activeTab: any = 0;
    public detailService = inject(CurrencyDetailService);
    protected tr = inject(TranslateService);
}
