import { Component, inject } from '@angular/core';
import { GoogleAdsDetailService } from './detail.service';
import { Button } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Checkbox } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { NgIf } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';


@Component({
    selector: 'google_ads-detail',
    standalone: true,
    imports: [Button, TranslatePipe, Checkbox, InputText, FormsModule, Dialog, NgIf, Tooltip],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true" [style]="{ width: '1000px', 'min-width': '1000px', 'min-height': '800px' }">
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Google' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Google' | translate) }}
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
                            <p-checkbox [binary]="true" [(ngModel)]="item.active"></p-checkbox>
                        </div>

                        <div class="col-span-11">
                            <label class="block font-bold mb-2">{{ 'Client_id' | translate }}</label>
                            <input pInputText [(ngModel)]="item.clientId" class="w-full" />
                        </div>

                        <div class="col-span-11">
                            <label class="block font-bold mb-2">{{ 'Client_secret' | translate }}</label>
                            <input pInputText [(ngModel)]="item.clientSecret" class="w-full" />
                        </div>

                        <div class="col-span-11">
                            <label class="block font-bold mb-2">{{ 'Login_customer_id' | translate }}</label>
                            <input pInputText [(ngModel)]="item.loginCustomerId" class="w-full" />
                        </div>

                        <div class="col-span-11">
                            <label class="block font-bold mb-2">{{ 'Refresh_token' | translate }}</label>
                            <div class="flex gap-2">
                                <input pInputText [(ngModel)]="item.refreshToken" class="w-full" disabled />
                                <p-button
                                    icon="pi pi-key"
                                    severity="info"
                                    pTooltip="Генерирай нов токен"
                                    (onClick)="onGenerateToken(item)"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button label="{{ 'Save' | translate }}" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
            </ng-template>
        </p-dialog>
    `
})
export class GoogleAdsDetailComponent {
    protected detailService = inject(GoogleAdsDetailService);

    protected onGenerateToken(item: any) {
        if (!item.id) {
            // Можеш да добавиш toast за предупреждение, че първо трябва да се запази профила
            return;
        }

        // Викаме сервиза, за да получим URL-а
        this.detailService.getGoogleAuthUrl(item.id).subscribe({
            next: (url: string) => {
                // Пренасочваме потребителя към Google
                window.location.href = url;
            },
            error: (err) => {
                console.error("Грешка при генериране на URL", err);
            }
        });
    }
}
