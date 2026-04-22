import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeWpProductDetailService } from './detail.service';
import { Dialog } from 'primeng/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'scheme_wp_product-detail',
    standalone: true,
    imports: [CommonModule, Dialog, TranslatePipe, Button, Textarea, InputText, FormsModule],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ 'min-width': '1000px', 'min-height': '100vh', width: '100%' }">
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Scheme' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Scheme' | translate) }}
                    </span>
                </div>
            </ng-template>

            <div class="grid grid-cols-12 gap-4 pt-4" *ngIf="detailService.selectedItem() as item">
                <div class="col-span-12">
                    <label class="block font-bold mb-2">{{ 'Name' | translate }}</label>
                    <input pInputText class="w-full" [(ngModel)]="item.name"/>
                </div>

                <div class="col-span-12 mt-3">
                    <label class="block font-bold mb-2">{{ 'Instruction' | translate }} {{'Title' | translate}}</label>
                    <textarea pTextarea class="w-full" [(ngModel)]="item.title" rows="35" [autoResize]="true" style="max-height: 10vh"></textarea>
                </div>

                <div class="col-span-12 mt-3">
                    <label class="block font-bold mb-2">{{ 'Instruction' | translate }} {{'Short' | translate}}</label>
                    <textarea pTextarea class="w-full" [(ngModel)]="item.shortDescription" rows="35" [autoResize]="true" style="max-height: 15vh"></textarea>
                </div>

                <div class="col-span-12 mt-3">
                    <label class="block font-bold mb-2">{{ 'Instruction' | translate }}</label>
                    <textarea pTextarea class="w-full" [(ngModel)]="item.description" rows="35" [autoResize]="true" style="max-height: 30vh"></textarea>
                </div>
            </div>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button [label]="'Cancel' | translate" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                    <p-button [label]="'Save' | translate" icon="pi pi-check" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class SchemeWpProductDetailComponent {
    protected detailService = inject(SchemeWpProductDetailService);
}
