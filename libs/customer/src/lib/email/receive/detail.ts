import { Component, inject } from '@angular/core';
import { EmailReceiveDetailService } from './detail.service';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { DatePipe } from '@angular/common';
import { Tag } from 'primeng/tag';
import { PrimeTemplate } from 'primeng/api';

@Component({
    selector: 'email-receive-detail',
    standalone: true,
    imports: [Dialog, Divider, DatePipe, Tag, PrimeTemplate],
    template: `
        <p-dialog
            [breakpoints]="{ '1199px': '85vw', '575px': '95vw' }"
            [visible]="detailService.isVisible()"
            (visibleChange)="detailService.closeDetail()"
            [modal]="true"
            [style]="{ width: '900px' }"
            [contentStyle]="{ 'min-height': '450px', 'max-height': '600px', padding: '20px' }"
        >
            <ng-template pTemplate="header">
                <div class="w-full text-center pr-5"> <span class="font-bold text-xl">
            {{ detailService.selectedItem()?.subject || 'Детайли на имейл' }}
        </span>
                    <span class="ml-2 text-2xl text-500">#{{ detailService.selectedItem()?.id }}</span>
                </div>
            </ng-template>

            @if (detailService.selectedItem(); as email) {
                <div class="email-header">
                    <div class="flex justify-content-between align-items-center mb-3">
                        <div>
                            <span class="font-bold">От: </span>
                            <span>{{ email.sender }}</span>
                        </div>
                        <p-tag [value]="email.direction === 1 ? 'Получен' : 'Изпратен'" [severity]="email.direction === 1 ? 'info' : 'success'"> </p-tag>
                    </div>

                    <div class="mb-3">
                        <span class="font-bold">До: </span>
                        <span>{{ email.recipient }}</span>
                    </div>

                    <div class="mb-3 text-sm text-500">
                        <i class="pi pi-calendar mr-2"></i>
                        <span>{{ email.createTime | date: 'dd.MM.yyyy HH:mm' }}</span>
                    </div>
                </div>

                <p-divider></p-divider>

                <div class="email-body-container shadow-1 p-3 border-round bg-white">
                    <div [innerHTML]="email.body" class="email-content"></div>
                </div>
            }
        </p-dialog>
    `,
    styles: [
        `
            .email-body-container {
                border: 1px solid #dee2e6;
                overflow-y: auto;
                background-color: #fdfdfd;
            }
            .email-content {
                font-family: Arial, sans-serif;
                line-height: 1.6;
            }
            /* Стилизиране на бутона за потвърждение, ако е вмъкнат в имейла */
            :host ::ng-deep .email-content a {
                text-decoration: none;
            }
        `
    ]
})
export class EmailReceiveDetailComponent {
    protected detailService = inject(EmailReceiveDetailService);

    constructor() {}
}
