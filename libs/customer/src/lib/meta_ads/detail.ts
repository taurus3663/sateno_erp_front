import { Component, inject } from '@angular/core';
import { MetaAdsDetailService } from './detail.service';
import { Dialog } from 'primeng/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'meta_ads-detail',
    standalone: true,
    imports: [Dialog, TranslatePipe, NgIf, Button, Checkbox, FormsModule, InputText, Tooltip],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ width: '1000px', 'min-width': '1000px', 'min-height': '800px' }">
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <!--                        {{ detailService.selectedItem()?.id ? 'Редакция на клиент #' + detailService.selectedItem()?.id : 'Нов клиент' }}-->
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Meta' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Meta' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div *ngIf="detailService.selectedItem() as item">
                    <div class="grid grid-cols-12 gap-4 pt-4">
                        <div class="col-span-11">
                            <label class="block font-bold mb-2">{{ 'Name' | translate }}</label>
                            <input pInputText [(ngModel)]="item.name" class="w-full" />
                        </div>

                        <div class="flex flex-col items-center">
                            <span class="text-[9px] uppercase font-bold text-gray-400 mb-1">{{ 'Active' | translate }}</span>
                            <p-checkbox  [binary]="true" [(ngModel)]="item.active"></p-checkbox>
                        </div>

                        <div class="col-span-12">
                            <label class="block font-bold mb-2">{{ 'Account_Id' | translate }}</label>
                            <input pInputText [(ngModel)]="item.adAccountId" class="w-full" />
                        </div>

                        <div class="col-span-12">
                            <label class="block font-bold mb-2">{{ 'AccessToken' | translate }}</label>
                            <input pInputText [(ngModel)]="item.accessToken" class="w-full" />
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button label="{{'Save' | translate}}" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
            </ng-template>
        </p-dialog>
    `
})
export class MetaAdsDetailComponent {
    protected detailService = inject(MetaAdsDetailService);
}
