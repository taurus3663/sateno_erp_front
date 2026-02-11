import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WpProductListService } from './list.service';
import { WpProductDetailService } from './detail.service';
import { IWpProduct, ProductStatus, ProductUnit } from './interfaces';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { WpCategoryDetailComponent } from './detail';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TreeTableModule } from 'primeng/treetable';
import { Tooltip } from 'primeng/tooltip';
import { SiteSelectorComponent } from '../_reusables/SiteSelectorComponent';
import { StatusLabelPipe } from './productStatus.pipe';
import { UnitLabelPipe } from './productUnit.pipe';
import {XL_AUTH_CONFIG} from 'xl-auth';


@Component({
    selector: 'wp_product-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, Toolbar, WpCategoryDetailComponent, TranslatePipe, TreeTableModule, Tooltip, StatusLabelPipe, UnitLabelPipe],
    template: `
        <p-toolbar class="mb-6" *ngIf="config?.data?.mode !== 'lookup'">
            <ng-template #start>
                <p-button [label]="'New' | translate" icon="pi pi-plus" severity="primary" class="mr-2" (onClick)="detailService.openCreateDialog()"></p-button>
                <p-button severity="warn" [label]="'Delete' | translate" icon="pi pi-trash" outlined />
                <p-button (onClick)="this.openSyncDialog()" [pTooltip]="'Prefered_to_use_when_db_is_empty' | translate" class="ml-5" severity="info" [label]="'Synchronize' | translate" icon="pi pi-sync" outlined></p-button>
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
        >
            <ng-template pTemplate="header">
                <tr>
                    <th>
                        <p-tableHeaderCheckbox />
                    </th>
                    <th style="width: 5rem">{{ 'Image' | translate }}</th>
                    <th>{{ 'Id' | translate }}</th>
                    <th>{{ 'Name' | translate }}</th>
                    <th>{{ 'Quantity' | translate }}</th>
                    <th>{{ 'Unit' | translate }}</th>
                    <th>{{ 'Status' | translate }}</th>
                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr [ngClass]="{ 'cursor-pointer hover:bg-blue-50': this.config?.data?.mode === 'lookup' }">
                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="item"></p-tableCheckbox>
                    </td>

                    <td>
                        <div class="flex justify-content-center">
                            <img *ngIf="item.m_image" [src]="this.baseUrl + item.m_image" class="w-3rem h-3rem border-round shadow-1" style="width: 10em" (error)="item.m_image = null" />
                        </div>
                    </td>

                    <td>{{ item.id }}</td>
                    <td>
                        <span [pTooltip]="item.names" tooltipPosition="top" class="cursor-help">
                            {{ item.names }}
                        </span>
                    </td>
                    <td>{{ item.stockQuantity }}</td>
                    <td>
                        <p-tag severity="info" [value]="item.unit | unitLabel"> </p-tag>
                    </td>
                    <td>
                        <p-tag [severity]="getStatusSeverity(item.status)" [value]="item.status | statusLabel"> </p-tag>
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

        <wp_product-detail *ngIf="config?.data?.mode !== 'lookup'"></wp_product-detail>
    `
})
export class WpProductListComponent {
    public listService = inject(WpProductListService);
    public detailService = inject(WpProductDetailService);
    private tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });
    private authConfig = inject(XL_AUTH_CONFIG);
    protected readonly baseUrl = this.authConfig.apiUrl;

    selectedItem!: IWpProduct[] | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }

    constructor() {
        // this.syncCategories(1);
    }

    private dialogService = inject(DialogService);
    openSyncDialog() {
        const ref = this.dialogService.open(SiteSelectorComponent, {
            header: this.tr.instant('Choose'),
            width: '450px',
            data: { label: 'Sync_From_Which_Site' }
        });
        ref?.onClose.subscribe((siteId: number) => {
            if (siteId) {
                // alert(siteId);
                this.listService.syncBrands(siteId);
            }
        });
    }

    getStatusSeverity(status: ProductStatus | string): any {
        switch (status) {
            case 'publish':
            case ProductStatus.PUBLISHED:
                return 'success';
            case 'draft':
            case ProductStatus.DRAFT:
                return 'warn';
            case 'private':
            case ProductStatus.PRIVATE:
                return 'danger';
            default:
                return 'info';
        }
    }
}
