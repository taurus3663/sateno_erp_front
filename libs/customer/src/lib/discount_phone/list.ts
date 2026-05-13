import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscountPhoneListService } from './list.service';
import { TranslatePipe } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';


@Component({
    selector: "discount-phone-list",
    standalone: true,
    imports: [CommonModule, TranslatePipe, TableModule],
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
                    <td>{{ item.created | date:'dd.MM.yyyy HH:mm' }}</td>
                    <!--                        <div class="flex gap-2">-->
<!--&lt;!&ndash;                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" (onClick)="detailService.openEditDialog(item)"></p-button>&ndash;&gt;-->
<!--&lt;!&ndash;                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="onDelete(item.id)"></p-button>&ndash;&gt;-->
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


    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters, event.sortField, event.sortOrder);
    }
}
