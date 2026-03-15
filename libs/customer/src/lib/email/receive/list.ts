import { Component, inject } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { EmailReceiveListService } from './list.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmailReceiveDetailService } from './detail.service';
import { IEmailReceive } from './interfaces';
import { TranslatePipe } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { CommonModule, NgClass } from '@angular/common';
import { Tag } from 'primeng/tag';
import { EmailReceiveDetailComponent } from './detail';
import { Tooltip } from 'primeng/tooltip';


@Component({
    selector: 'email-receive-list',
    standalone: true,
    imports: [CommonModule, Toolbar, Button, TranslatePipe, TableModule, NgClass, Tag, EmailReceiveDetailComponent, Tooltip],
    template: `
        <p-toolbar class="mb-6" *ngIf="config?.data?.mode !== 'lookup'">
            <ng-template #start>
                <p-button [label]="'New' | translate" icon="pi pi-plus" severity="primary" class="mr-2" (onClick)="detailService.openCreateDialog()"></p-button>
                <p-button severity="warn" [label]="'Delete' | translate" icon="pi pi-trash" outlined />
            </ng-template>
        </p-toolbar>

        <p-table
            [value]="listService.items()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [paginator]="true"
            [rows]="10"
            [totalRecords]="listService.totalRecords()"
            [loading]="listService.loading()"
            [rowsPerPageOptions]="[10, 20, 50]"
            [tableStyle]="{ 'min-width': '50rem' }"
            [(selection)]="selectedItem"
            [rowHover]="true"
            dataKey="id"
            stripedRows
        >
            <ng-template pTemplate="header">
                <tr>
                    <th>
                        <p-tableHeaderCheckbox />
                    </th>
                    <th>{{ 'Id' | translate }}</th>
                    <th>{{ 'Type' | translate }}</th>
                    <th>{{ 'Sender' | translate }}</th>
                    <th>{{ 'Recipient' | translate }}</th>
                    <th>{{ 'Sent' | translate }}</th>
                    <th>{{ 'Subject' | translate }}</th>
                    <th>{{ 'Seen' | translate }}</th>
                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr [ngClass]="{ 'cursor-pointer hover:bg-blue-50': this.config?.data?.mode === 'lookup' }">
                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="item"></p-tableCheckbox>
                    </td>
                    <td>{{ item.id }}</td>
                    <td>{{ item.direction | translate }}</td>
                    <td>{{ item.sender }}</td>
                    <td>{{ item.recipient }}</td>
                    <td>{{ item.createTime | date: 'dd.MM.yyyy HH:mm' }}</td>
                    <td [pTooltip]="item.subject" tooltipPosition="top">{{ item.subject | slice: 0 : 10 }}{{ item.subject.length > 10 ? '...' : '' }}</td>
                    <td>
                        <p-tag [severity]="item.seen ? 'success' : 'danger'" [value]="(item.seen ? 'Yes' : 'No') | translate" [rounded]="true"> </p-tag>
                    </td>

                    <td>
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" (onClick)="detailService.openEditDialog(item)"></p-button>
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="this.listService.deleteItem(item.id)"></p-button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <email-receive-detail *ngIf="config?.data?.mode !== 'lookup'"></email-receive-detail>
    `
})
export class EmailReceiveListComponent {
    public listService = inject(EmailReceiveListService);
    public detailService = inject(EmailReceiveDetailService);
    protected config = inject(DynamicDialogConfig, { optional: true });

    selectedItem!: IEmailReceive | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }
}
