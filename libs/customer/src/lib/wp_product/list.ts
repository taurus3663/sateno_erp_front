import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WpProductListService } from './list.service';
import { WpProductDetailService } from './detail.service';
import { IWpProduct, ProductSaleType, ProductStatus } from './interfaces';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { WpCategoryDetailComponent } from './detail';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TreeTableModule } from 'primeng/treetable';
import { Tooltip } from 'primeng/tooltip';
import { SiteSelectorComponent } from '../_reusables/SiteSelectorComponent';
import { XL_AUTH_CONFIG } from 'xl-auth';
import { IconField } from 'primeng/iconfield';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Image } from 'primeng/image';
import { WpCategoryListService } from '../wp_category/list.service';
import { OverlayBadge } from 'primeng/overlaybadge';
import { WpBrandListService } from '../wp_brand/list.service';
import { InputNumber } from 'primeng/inputnumber';

@Component({
    selector: 'wp_product-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, Toolbar, WpCategoryDetailComponent, TranslatePipe, TreeTableModule, Tooltip, IconField, Select, FormsModule, Image, OverlayBadge, InputNumber],
    template: `
        <p-toolbar class="mb-6" *ngIf="config?.data?.mode !== 'lookup'">
            <ng-template #start>
                <p-button [label]="'New' | translate" icon="pi pi-plus" severity="primary" class="mr-2" (onClick)="detailService.openCreateDialog()"></p-button>
                <p-button severity="warn" [label]="'Delete' | translate" icon="pi pi-trash" outlined />
                <p-button (onClick)="this.openSyncDialog()" [pTooltip]="'Prefered_to_use_when_db_is_empty' | translate" class="ml-5" severity="info" [label]="'Synchronize' | translate" icon="pi pi-sync" outlined></p-button>
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="listService.items()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [paginator]="true"
            [rows]="200"
            [totalRecords]="listService.totalRecords()"
            [loading]="listService.loading()"
            [rowsPerPageOptions]="[10, 20, 50, 200]"
            [tableStyle]="{ 'min-width': '50rem' }"
            [(selection)]="selectedItem"
            [rowHover]="true"
            dataKey="id"
            filterDelay="menu"
            paginatorPosition="both"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Показани: {{listService.items().length}} от {totalRecords} записа"
        >
<!--            <ng-template pTemplate="paginatorleft" style="text-align: center;">-->
<!--                <div class="flex align-items-center px-3 py-1 border-round bg-gray-100 text-sm font-medium text-600 shadow-sm">-->
<!--                    <i class="pi pi-list mr-2 text-primary"></i>-->
<!--                    <span>Показани: <b class="text-900">{{ listService.items().length }}</b></span>-->
<!--                    <span class="mx-2 text-400">/</span>-->
<!--                    <span>Общо: <b class="text-900">{{ listService.totalRecords() }}</b></span>-->
<!--                </div>-->
<!--            </ng-template>-->
            <ng-template #caption>
                <div class="flex justify-content-between align-items-center">
                    <div class="flex gap-3 align-items-center flex-wrap">
                        <p-button label="Clear" [outlined]="true" icon="pi pi-filter-slash" (onClick)="dt.clear()" />

                        <div class="flex gap-2 align-items-center">
                            <ng-container *ngFor="let filter of dt.filters | keyvalue">
                                <p-tag
                                    *ngIf="getFilterValue(filter.value)"
                                    severity="secondary"
                                    [rounded]="true"
                                    class="shadow-1"
                                >
                                    <div class="flex align-items-center gap-2 px-1">
                                        <span class="text-xs font-bold uppercase text-primary">{{ filter.key | titlecase | translate }}:</span>
                                        <span class="text-sm">{{ getFilterValue(filter.value) }}</span>
                                    </div>
                                </p-tag>
                            </ng-container>
                        </div>
                    </div>

                    <p-iconfield iconPosition="left">
                    </p-iconfield>
                </div>
            </ng-template>

            <ng-template pTemplate="header">
                <tr>
                    <th>
                        <p-tableHeaderCheckbox />
                    </th>
                    <th style="width: 5rem">{{ 'Image' | translate }}</th>
                    <th pSortableColumn="sku">
                        <div class="flex items-center justify-between">{{ 'SKU' | translate }} <p-columnFilter type="text" field="sku" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false"> </p-columnFilter></div>
                    </th>
                    <th pSortableColumn="name">
                        <div class="flex items-center justify-between">{{ 'Name' | translate }} <p-columnFilter type="text" field="name" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false"> </p-columnFilter></div>
                    </th>
                    <th pSortableColumn="brand">
                        <div class="flex items-center justify-between">
                            {{ 'Brand' | translate }}
                            <p-columnFilter field="brand" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false">
                                <ng-template #filter let-value let-filter="filterCallback">
                                    <p-select
                                        [ngModel]="value"
                                        [options]="brandLService.items()"
                                        (onChange)="filter($event.value)"
                                        optionLabel="name"
                                        optionValue="name"
                                        placeholder="{{ 'Select_Brand' | translate }}"
                                        [filter]="true"
                                        appendTo="body"
                                        class="w-full"
                                    >
                                        <ng-template #item let-option>
                                            <div class="flex align-items-center gap-2">
                                                <i class="pi pi-bookmark text-primary"></i>
                                                <span>{{ option.name }}</span>
                                            </div>
                                        </ng-template>
                                    </p-select>
                                </ng-template>
                            </p-columnFilter>
                        </div>
                    </th>
                    <th pSortableColumn="quantity">
                        <div class="flex items-center justify-between">
                            {{ 'Quantity' | translate }} <p-columnFilter type="text" field="quantity" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false"> </p-columnFilter>
                        </div>
                    </th>
                    <th pSortableColumn="category">
                        <div class="flex items-center justify-between">
                            {{ 'Categories' | translate }}
                            <p-columnFilter field="category" display="menu" matchMode="contains" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false">
                                <ng-template #filter let-value let-filter="filterCallback">
                                    <p-select
                                        [ngModel]="value"
                                        [options]="categoryLService.items()"
                                        (onChange)="filter($event.value?.split('|')[0].trim())"
                                        optionLabel="data.name"
                                        optionValue="data.name"
                                        placeholder="{{ 'Category' | translate }}"
                                        [filter]="true"
                                        appendTo="body"
                                    >
                                        <ng-template #item let-option>
                                            <div class="flex align-items-center gap-2">
                                                <i class="pi pi-tag text-primary"></i>
                                                <span>{{ option.data.name.split('|')[0].trim() }}</span>
                                            </div>
                                        </ng-template>
                                    </p-select>
                                </ng-template>
                            </p-columnFilter>
                        </div>
                    </th>
                    <!--                    <th pSortableColumn="status">-->
                    <!--                        {{ 'Status' | translate }}-->
                    <!--                        <p-columnFilter type="text" field="status" display="menu">-->
                    <!--                            <ng-template #filter let-value let-filter="filterCallback">-->
                    <!--                                <p-select [ngModel]="value" [options]="productStatus" (onChange)="filter($event.value)" placeholder="Select One">-->
                    <!--                                    <ng-template let-option #item>-->
                    <!--                                        <p-tag [value]="option.label" [severity]="getStatusSeverity(option.value)" />-->
                    <!--                                    </ng-template>-->
                    <!--                                </p-select> </ng-template-->
                    <!--                        ></p-columnFilter>-->
                    <!--                    </th>-->
                    <th pSortableColumn="saleType">
                        <div class="flex items-center justify-between">
                            {{ 'Limited' | translate }}
                            <p-columnFilter type="text" field="saleType" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false">
                                <ng-template #filter let-value let-filter="filterCallback">
                                    <p-select [ngModel]="value" [options]="productSaleType" (onChange)="filter($event.value)" placeholder=" {{ 'Limited' | translate }}"
                                        >-->
                                        <ng-template let-option #item>
                                            <p-tag [value]="option.label" [severity]="getStatusSeverity(option.value)" />
                                        </ng-template>
                                    </p-select>
                                </ng-template>
                            </p-columnFilter>
                        </div>
                    </th>
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
                            <p-overlay-badge [severity]="isSelling(item) ? 'success' : 'danger'" badgeSize="small" styleClass="p-badge-dot">
                                <p-image *ngIf="item.m_image" [src]="this.baseUrl + item.m_image" [alt]="item.names" width="85" [preview]="true" imageClass="border-circle shadow-1" (onImageError)="item.m_image = null"> </p-image>
                            </p-overlay-badge>
                        </div>
                    </td>

                    <td>
<!--                        <p-tag *ngFor="let cat of item.siteConfig" [value]="cat.sku" severity="secondary"> </p-tag>-->
                        <p-tag [value]="item.sku" severity="secondary"> </p-tag>
                    </td>

                    <td>
                        <span [pTooltip]="item.names" tooltipPosition="top" class="cursor-help">
                            {{ item.names }}
                        </span>
                    </td>
                    <td>{{ item.brand?.name ?? '' }}</td>
                    <td>
                        <p-inputNumber
                            #nb
                            [(ngModel)]="item.stockQuantity"
                            [readonly]="!item._isEditing"
                            (onFocus)="item._oldQty = item.stockQuantity; $any($event.target).select()"
                            (dblclick)="item._isEditing = true; nb.input.nativeElement.focus()"
                            (onBlur)="item._isEditing = false; (item.stockQuantity !== item._oldQty ? listService.updateProductField(item) : null)"
                            [min]="0"
                            [showButtons]="false"
                            styleClass="compact-input"
                            [inputSize]="2"
                            [inputStyle]="{'color': item.stockQuantity <= 0 ? '#ef4444' : '#22c55e', 'font-size': '1.1rem', 'font-weight': 'bolder'}"
                            inputClass="w-3rem text-center font-bold p-1 border-none bg-transparent hover:bg-gray-100 cursor-pointer"
                        >
                        </p-inputNumber>
                    </td>

                    <td>
                        <div class="flex flex-col gap-1 w-70">
                            <p-tag *ngFor="let cat of item.categories" [value]="cat.name" severity="secondary"> </p-tag>
                        </div>
                    </td>

                    <!--                    <td>-->
                    <!--                        <p-tag severity="info" [value]="item.unit | unitLabel"> </p-tag>-->
                    <!--                    </td>-->
                    <!--                    <td>-->
                    <!--                        <p-tag [severity]="getStatusSeverity(item.status)" [value]="item.status | statusLabel"> </p-tag>-->
                    <!--                    </td>-->

                    <td>
                        <p-select styleClass="table-status-select"  [(ngModel)]="item.saleType" [options]="productSaleType" (onChange)="listService.updateProductField(item)" variant="filled" class="w-full">
                            <ng-template #dropdownicon style="visibility: hidden;display: none;width: 0;">
                                <span></span>
                            </ng-template>
                            <ng-template #selectedItem let-selectedOption>
                                <p-tag [severity]="selectedOption.value === 0 ? 'info' : 'danger'" [value]="selectedOption.label | translate"> </p-tag>
                            </ng-template>

                            <ng-template #item let-option>
                                <p-tag [severity]="option.value === 0 ? 'info' : 'danger'" [value]="option.label | translate"> </p-tag>
                            </ng-template>
                        </p-select>
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
        <style>
            /* Влияе само на p-select, който има клас 'table-status-select' */
            :host ::ng-deep .table-status-select {
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                width: auto !important; /* Свиваме го до размера на тага */
                min-width: 0 !important;
            }

            /* Премахваме фона на лейбъла само за този селект */
            :host ::ng-deep .table-status-select .p-select-label {
                background: transparent !important;
                padding: 0 !important;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Скриваме стрелката само за този селект */
            :host ::ng-deep .table-status-select .p-select-dropdown {
                display: none !important;
            }

            /* Премахваме фокуса само за този селект */
            :host ::ng-deep .table-status-select.p-focus {
                box-shadow: none !important;
                outline: none !important;
            }

            /* Стилизация за InputNumber (Quantity) */
            :host ::ng-deep .compact-input .p-inputnumber-input {
                width: 3.5rem !important;
                min-width: 0 !important;
            }
        </style>
    `
})
export class WpProductListComponent {
    public listService = inject(WpProductListService);
    public detailService = inject(WpProductDetailService);
    private tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });
    private authConfig = inject(XL_AUTH_CONFIG);
    protected readonly baseUrl = this.authConfig.apiUrl;
    protected categoryLService = inject(WpCategoryListService);
    protected brandLService = inject(WpBrandListService);

    selectedItem!: IWpProduct[] | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }

    constructor() {
        this.categoryLService.loadList(0, 1000);
        this.brandLService.loadList(0, 1000);

        // this.syncCategories(1);
        // this.generateStatusOptions();
        this.generateProductSaleType();
        this.tr.onLangChange.subscribe((lang) => {
            // this.generateStatusOptions();
            this.generateProductSaleType();
        });
    }

    // protected productStatus: any[] = [];
    // private generateStatusOptions() {
    //     this.productStatus = Object.keys(ProductStatus)
    //         .filter((key) => isNaN(Number(key)))
    //         .map((key) => ({
    //             label: this.tr.instant(`PRODUCT_STATUS.${key}`),
    //             value: ProductStatus[key as keyof typeof ProductStatus]
    //         }));
    // }

    protected productSaleType: any[] = [];
    private generateProductSaleType() {
        this.productSaleType = Object.keys(ProductSaleType)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                label: this.tr.instant(key),
                value: ProductSaleType[key as keyof typeof ProductSaleType]
            }));
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

    getStatusSeverity(status: ProductSaleType | string): any {
        switch (status) {
            case ProductSaleType.LIMITED:
                return 'info';
            case ProductSaleType.UNLIMITED:
                return 'danger';
            // case 'publish':
            // case ProductStatus.PUBLISHED:
            //     return 'success';
            // case 'draft':
            // case ProductStatus.DRAFT:
            //     return 'warn';
            // case 'pending':
            // case ProductStatus.PENDING:
            //     return 'danger';
            // default:
            //     return 'info';
        }
    }

    // В твоя .ts файл дефинирай статусите
    // statusOptions = [
    //     { label: 'Active', value: 1 },
    //     { label: 'Inactive', value: 0 },
    //     { label: 'Draft', value: 2 }
    // ];

    isSelling(item: IWpProduct): boolean {
        const isPublished = item.status === ProductStatus.PUBLISHED;
        const hasStock = item.stockQuantity > 0;

        // Ако е UNLIMITED (1), може да се продава и без бройка (зависи от бизнес логиката ти)
        // Но според твоето изискване: статус + бройка + тип
        if (item.saleType === ProductSaleType.LIMITED) {
            return isPublished && hasStock;
        } else {
            return isPublished;
        }
    }

    // Помощен метод за извличане на стойността на филтъра
    getFilterValue(filterMeta: any): string | null {
        if (!filterMeta) return null;

        // Ако е масив (стандартно при PrimeNG с display="menu")
        if (Array.isArray(filterMeta)) {
            const active = filterMeta.find(f => f.value !== null && f.value !== undefined && f.value !== '');
            return active ? active.value : null;
        }

        // Ако е единичен обект
        return filterMeta.value || null;
    }

    removeSingleFilter(table: any, field: string) {
        // 1. Изчистваме стойността в обекта на филтрите на PrimeNG
        if (table.filters[field]) {
            if (Array.isArray(table.filters[field])) {
                table.filters[field].forEach((f: any) => f.value = null);
            } else {
                table.filters[field].value = null;
            }
        }

        // 2. Казваме на таблицата да приложи "празния" филтър (това обновява UI-а)
        table.filter(null, field, 'contains');
    }
}
