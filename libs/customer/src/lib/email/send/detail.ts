import { Component, inject } from '@angular/core';
import { EmailSendDetailService } from './detail.service';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'email-send-detail',
    standalone: true,
    imports: [Dialog, Tag, Divider, DatePipe],
    template: `
        <p-dialog
            [breakpoints]="{ '1199px': '85vw', '575px': '95vw' }"
            [visible]="detailService.isVisible()"
            (visibleChange)="detailService.closeDetail()"
            [modal]="true"
            [style]="{ width: '900px' }"
            [contentStyle]="{ 'min-height': '450px', 'max-height': '600px' }"
        >
            <ng-template pTemplate="header">
                <div class="w-full text-center pr-5">
                    <span class="font-bold text-xl">
                        {{ detailService.selectedItem()?.subject || 'Детайли на изпратен имейл' }}
                    </span>
                    <span class="ml-2 text-2xl text-500">#{{ detailService.selectedItem()?.id }}</span>
                </div>
            </ng-template>

            @if (detailService.selectedItem(); as email) {
                <div class="email-header">
                    <div class="flex justify-content-between align-items-center mb-3">
                        <div>
                            <span class="font-bold text-primary">До: </span>
                            <span class="font-bold">{{ email.recipient }}</span>
                        </div>
                        <div class="flex gap-2">
                            <p-tag [severity]="email.seen ? 'success' : 'secondary'" [value]="email.seen ? 'Прочетено' : 'Непрочетено'" [icon]="email.seen ? 'pi pi-eye' : 'pi pi-eye-slash'"> </p-tag>
                            @if (email.confirmed) {
                                <p-tag severity="success" value="Потвърдено" icon="pi pi-check-circle"></p-tag>
                            }
                        </div>
                    </div>

                    <div class="mb-3">
                        <span class="font-bold">От (Конфигурация): </span>
                        <span>{{ email.config.name }} ({{ email.sender }})</span>
                    </div>

                    <div class="mb-3 text-sm text-500">
                        <i class="pi pi-calendar mr-2"></i>
                        <span>Изпратено на: {{ email.createTime | date: 'dd.MM.yyyy HH:mm' }}</span>
                    </div>
                </div>

                <p-divider align="left">
                    <div class="inline-flex align-items-center">
                        <i class="pi pi-envelope mr-2"></i>
                        <b>Съдържание</b>
                    </div>
                </p-divider>

                <div class="email-body-container shadow-1 p-4 border-round bg-white border-1 border-200">
                    <div [innerHTML]="email.body" class="email-content"></div>
                </div>
            }
        </p-dialog>
    `
})
export class EmailSendDetailComponent {
    protected detailService = inject(EmailSendDetailService);

    constructor() {}
}
