import { Component, inject } from '@angular/core';
import { EmailDetailService } from './detail.service';
import { Dialog } from 'primeng/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { NgIf } from '@angular/common';

@Component({
    selector: 'email-detail',
    standalone: true,
    imports: [Dialog, TranslatePipe, Button, InputText, FormsModule, TabPanel, TabPanels, Tabs, TabList, Tab, NgIf],
    template: `
        <p-dialog [breakpoints]="{ '1199px': '85vw', '575px': '95vw' }" [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ width: '900px' }">
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <i class=" mr-2 text-primary"></i>
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Email' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Email' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div class="pt-2" *ngIf="detailService.selectedItem() as item">
                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Name' | translate }}</label>
                        <input pInputText [(ngModel)]="item.name" class="w-full" />
                    </div>


                </div>
            </ng-template>

            <ng-template #footer>
                <div class="flex gap-2 justify-end border-t border-surface-200 pt-4">
                    <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                    <p-button label="Запис на всички промени" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class EmailDetailComponent {
    protected detailService = inject(EmailDetailService);

    constructor() {}
}
