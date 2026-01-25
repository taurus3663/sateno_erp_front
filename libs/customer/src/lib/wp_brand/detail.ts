import { Component, effect, inject, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageListService } from '../language/list.service';
import { WpBrandDetailService } from './detail.service';
import { InputText } from 'primeng/inputtext';


@Component({
    selector: 'wp_brand-detail',
    standalone: true,
    imports: [Dialog, Button, FormsModule, CommonModule, TranslatePipe, InputText],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ width: '500px' }">
            <!--                        [header]="detailService.selectedItem()?.id ? 'Редакция на потребител #' + detailService.selectedItem()?.id : 'Нов потребител'"
-->
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <!--                        {{ detailService.selectedItem()?.id ? 'Редакция на клиент #' + detailService.selectedItem()?.id : 'Нов клиент' }}-->
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Brand' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Brand' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div class="grid grid-cols-12 gap-4 pt-2" *ngIf="detailService.selectedItem() as item">
                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Name' | translate }}</label>
                        <input pInputText [(ngModel)]="item.name" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Slug' | translate }}</label>
                        <input pInputText [(ngModel)]="item.slug" disabled class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Description' | translate }}</label>
                        <input pInputText [(ngModel)]="item.description" class="w-full" />
                    </div>


                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()"
                                          (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
            </ng-template>
        </p-dialog>
    `
})
export class WpCategoryDetailComponent {
    protected detailService = inject(WpBrandDetailService);

    constructor() {
        effect(() => {});
    }
}
