import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscountPhoneListService } from './list.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';


@Component({
    selector: 'discount-phone-list',
    standalone: true,
    imports: [CommonModule, TranslatePipe, TableModule, Button],
    template: `
        <!--        <p-toolbar class="mb-6" *ngIf="config?.data?.mode !== 'lookup'">-->
        <!--            <ng-template #start>-->
        <!--                <p-button [label]="'New' | translate" icon="pi pi-plus" severity="primary" class="mr-2" (onClick)="detailService.openCreateDialog()"></p-button>-->
        <!--                &lt;!&ndash;                <p-button severity="warn" [label]="'Delete' | translate" icon="pi pi-trash" outlined [disabled]="!selectedItem" />&ndash;&gt;-->
        <!--            </ng-template>-->
        <!--        </p-toolbar>-->

        <p-table
            [value]="listService.items()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [paginator]="true"
            [rows]="50"
            [totalRecords]="listService.totalRecords()"
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
                    <th pSortableColumn="phone">{{ 'Phone' | translate }} <p-sortIcon field="name" /></th>
                    <th pSortableColumn="site">{{ 'Site' | translate }} <p-sortIcon field="name" /></th>
                    <th pSortableColumn="hasOrder" style="width: 10rem">{{ 'Has_Order' | translate }} <p-sortIcon field="hasOrder" /></th>
                    <th pSortableColumn="time">{{ 'Time' | translate }} <p-sortIcon field="name" /></th>
                    <!--                    <th style="width: 8rem"></th>-->
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr [pSelectableRow]="item">
                    <td>
                        <p-tableCheckbox [value]="item" (click)="$event.stopPropagation()"></p-tableCheckbox>
                    </td>
                    <td>{{ item.id }}</td>
                    <td>{{ item.phone ?? '' }}</td>
                    <td>{{ item.site ?? '' }}</td>
                    <td>
                        <span
                            [ngClass]="item.hasOrder ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
                            class="px-2.5 py-1 text-xs font-medium rounded-full inline-block"
                        >
                            {{ (item.hasOrder ? 'Yes' : 'No') | translate }}
                        </span>
                    </td>
                    <td>{{ item.created | date: 'dd.MM.yyyy HH:mm' }}</td>
                    <!--                        <div class="flex gap-2">-->
                    <!--&lt;!&ndash;                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" (onClick)="detailService.openEditDialog(item)"></p-button>&ndash;&gt;-->
                    <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="onDelete(item.id)"></p-button
                    >
                    <!--                        </div>-->
                    <!--                    </td>-->
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
    `
})
export class DiscountPhoneListComponent {
    protected listService = inject(DiscountPhoneListService);
    protected tr = inject(TranslateService);

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters, event.sortField, event.sortOrder);
    }

    onDelete(id: any) {
        if (confirm(this.tr.instant('Are_you_sure?'))) {
            this.listService.deleteItem(id);
        }
    }
}
