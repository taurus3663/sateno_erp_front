import { Component, inject } from '@angular/core';
import { CourierListService } from './list.service';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { CourierDetailService } from './detail.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TranslatePipe } from '@ngx-translate/core';
import { ICourier } from './interfaces';
import { CourierDetailComponent } from './detail';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { Tag } from 'primeng/tag';


@Component({
    selector: 'courier-list',
    standalone: true,
    imports: [CommonModule, TableModule, Toolbar, Button, TranslatePipe, CourierDetailComponent, TableModule, Tag],
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
                    <th>{{ 'Name' | translate }}</th>
                    <th>{{ 'Type' | translate }}</th>
                    <th>{{ 'Status' | translate }}</th>

                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr [ngClass]="{ 'cursor-pointer hover:bg-blue-50': this.config?.data?.mode === 'lookup' }">
                <td (click)="$event.stopPropagation()">
                    <p-tableCheckbox [value]="item"></p-tableCheckbox>
                </td>
                <td>{{ item.id }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.courierType }}</td>

                <td>
                    <p-tag [severity]="item.active ? 'success' : 'danger'" [value]="item.active ? 'Active' : ('Stopped' | translate)"> </p-tag>
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

        <courier-detail *ngIf="config?.data?.mode !== 'lookup'"></courier-detail>
    `
})
export class CourierListComponent {
    public listService = inject(CourierListService);
    public detailService = inject(CourierDetailService);
    protected config = inject(DynamicDialogConfig, { optional: true });

    selectedItem!: ICourier[] | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }

    constructor() {}
}
