import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeWpProductListService } from './list.service';
import { SchemeWpProductDetailService } from './detail.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'wp-product_scheme-list',
    standalone: true,
    imports: [CommonModule, Button, Toolbar, TranslatePipe, TableModule],
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
            [rows]=10
            [rowsPerPageOptions]="[10, 20, 50, 200]"
            [loading]="listService.loading()"
            [tableStyle]="{ 'min-width': '50rem' }"
            [rowHover]="true"
            dataKey="id"
            filterDelay="menu"
            paginatorPosition="both"
            [showCurrentPageReport]="true"
        >
            <ng-template pTemplate="header">
                <tr>
                    <th>
                        <p-tableHeaderCheckbox/>
                    </th>

                    <th>
                        <div class="flex items-center justify-between">
                            {{ 'Id' | translate }}
                        </div>
                    </th>

                    <th>
                        <div class="flex items-center justify-between">
                            {{ 'Name' | translate }}
                        </div>
                    </th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>

                <td (click)="$event.stopPropagation()">
                    <p-tableCheckbox [value]="item"></p-tableCheckbox>
                </td>

                <td>{{ item.id ?? '' }}</td>
                <td>{{ item.name ?? '' }}</td>




            </ng-template>



        </p-table>
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
}
