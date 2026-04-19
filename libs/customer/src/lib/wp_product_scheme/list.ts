import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeWpProductListService } from './list.service';
import { SchemeWpProductDetailService } from './detail.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import {SchemeWpProductDetailComponent} from './detail';

@Component({
    selector: 'wp-product_scheme-list',
    standalone: true,
    imports: [CommonModule, Button, Toolbar, TranslatePipe, TableModule, SchemeWpProductDetailComponent],
    template: `
        <p-toolbar class="mb-6" *ngIf="config?.data?.mode !== 'lookup'">
            <ng-template #start>
                <p-button [label]="'New' | translate" icon="pi pi-plus" severity="primary" class="mr-2" (onClick)="detailService.openCreateDialog()"></p-button>
<!--                <p-button severity="warn" [label]="'Delete' | translate" icon="pi pi-trash" outlined [disabled]="!selectedItem" />-->
            </ng-template>
        </p-toolbar>

        <p-table
            [value]="listService.items()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[10, 20, 50, 200]"
            [loading]="listService.loading()"
            [tableStyle]="{ 'min-width': '50rem' }"
            [rowHover]="true"
            dataKey="id"
            paginatorPosition="bottom"
        >
            <ng-template pTemplate="header">
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="id" style="width: 10rem">{{ 'Id' | translate }} <p-sortIcon field="id" /></th>
                    <th pSortableColumn="name">{{ 'Name' | translate }} <p-sortIcon field="name" /></th>
                    <th style="width: 8rem" *ngIf="config?.data?.mode !== 'lookup'"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr [pSelectableRow]="item" (dblclick)="detailService.openEditDialog(item)">
                    <td>
                        <p-tableCheckbox [value]="item" (click)="$event.stopPropagation()"></p-tableCheckbox>
                    </td>
                    <td>{{ item.id }}</td>
                    <td>{{ item.name ?? '' }}</td>
                    <td *ngIf="config?.data?.mode !== 'lookup'">
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" (onClick)="detailService.openEditDialog(item)"></p-button>
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="onDelete(item.id)"></p-button>
                        </div>
                    </td>
                </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="4" class="text-center p-4">
                        {{ 'No_records_found' | translate }}
                    </td>
                </tr>
            </ng-template>
        </p-table>
        <scheme_wp_product-detail></scheme_wp_product-detail>
    `
})
export class WpProductSchemeListComponent {
    protected listService = inject(SchemeWpProductListService);
    protected detailService = inject(SchemeWpProductDetailService);
    protected tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters, event.sortField, event.sortOrder);
    }

    onDelete(id: any) {
        if (confirm(this.tr.instant('Are_you_sure?'))) {
            this.listService.deleteItem(id);
        }
    }
}
