import { Component, inject } from '@angular/core';
import { EmailListService } from './list.service';
import { EmailDetailService } from './detail.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { IEmail } from './interfaces';
import { EmailDetailComponent } from './detail';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';

@Component({
    selector: 'email-list',
    standalone: true,
    imports: [CommonModule, EmailDetailComponent, TableModule, TranslatePipe, Toolbar, Button],
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
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr [ngClass]="{ 'cursor-pointer hover:bg-blue-50': this.config?.data?.mode === 'lookup' }">
                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="item"></p-tableCheckbox>
                    </td>
                    <td>{{ item.id }}</td>
                </tr></ng-template
            >
        </p-table>

        <email-detail *ngIf="config?.data?.mode !== 'lookup'"></email-detail>
    `
})
export class EmailListComponent {
    public listService = inject(EmailListService);
    public detailService = inject(EmailDetailService);
    protected config = inject(DynamicDialogConfig, { optional: true });

    selectedItem!: IEmail | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }
}
