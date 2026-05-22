import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
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
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'wp_product-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, Toolbar, WpCategoryDetailComponent, TranslatePipe, TreeTableModule, Tooltip, IconField, Select, FormsModule, Image, OverlayBadge, InputNumber, InputIcon, InputText],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [
        `
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
            /* 1. Фиксираме височината на самия ред */
            :host ::ng-deep .p-datatable-tbody > tr {
                height: 103px !important;
            }

            /* 2. Пречим на клетките да се раздуват */
            :host ::ng-deep .p-datatable-tbody > tr > td {
                height: 103px !important;
                padding: 0 0.5rem !important;
                border-bottom: 1px solid #f1f1f1;
            }

            /* 3. Вътрешен контейнер за контрол на съдържанието */
            .fixed-cell {
                height: 103px;
                display: flex;
                align-items: center;
                overflow: hidden;
            }

            /* 4. Текстът не трябва да минава на нов ред */
            .text-truncate {
                white-space: nowrap;
                text-overflow: ellipsis;
                display: block;
                width: 100%;
            }

            /* 5. Фиксираме снимките */
            .fixed-img {
                width: 75px;
                height: 75px;
                object-fit: cover;
            }`
    ],
    template: `
        <p-toolbar class="mb-6" *ngIf="config?.data?.mode !== 'lookup'">
            <ng-template #start>
                <p-button [label]="'New' | translate" icon="pi pi-plus" severity="primary" class="mr-2" (onClick)="detailService.openCreateDialog()"></p-button>
                <p-button severity="warn" [label]="'Delete' | translate" icon="pi pi-trash" outlined (onClick)="questRemove(selectedItem)" [disabled]="!selectedItem || !selectedItem.length" />
                <p-button (onClick)="this.openSyncDialog()" [pTooltip]="'Prefered_to_use_when_db_is_empty' | translate" class="ml-5" severity="info" [label]="'Synchronize' | translate" icon="pi pi-sync" outlined></p-button>
            </ng-template>

<!--            <ng-template #center>-->
<!--                <p-iconfield *ngIf="config?.data?.mode !== 'lookup'" iconPosition="left">-->
<!--                    <p-inputicon styleClass="pi pi-search" />-->
<!--                    <input pInputText type="text" [(ngModel)]="searchValue" (input)="onSearch($event)" [placeholder]="'Search_by_name_or_sku...' | translate" class="p-inputtext-sm w-full md:w-20rem" />-->
<!--                    <p-inputicon *ngIf="searchValue" styleClass="pi pi-times cursor-pointer" (click)="clearSearch()" />-->
<!--                </p-iconfield>-->
<!--            </ng-template>-->
        </p-toolbar>

        <p-table
            #dt
            [value]="listService.items()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [paginator]="true"
            [rows]=rows
            [loading]="listService.loading()"
            [totalRecords]="listService.totalRecords()"
            [rowsPerPageOptions]="[10, 20, 50, 200]"
            [tableStyle]="{ 'min-width': '80rem' }"
            [(selection)]="selectedItem"
            [rowHover]="true"
            dataKey="id"
            filterDelay="menu"
            paginatorPosition="both"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Показани: {{ listService.items().length }} от {totalRecords} записа"
            [rowTrackBy]="trackByProductId"
            [filters]="this.lastParams.filters"
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
                <div class="flex flex-wrap align-items-center justify-content-between gap-3 w-full">

                    <div class="flex align-items-center gap-3 flex-1">
                        <p-button label="Clear" [outlined]="true" icon="pi pi-filter-slash" (onClick)="dt.clear()" size="small" />

                        <div class="flex gap-2 align-items-center overflow-auto">
                            <ng-container *ngFor="let filter of dt.filters | keyvalue">
                                <p-tag *ngIf="getFilterValue(filter.value)" severity="secondary" [rounded]="true" class="shadow-1">
                                    <div class="flex align-items-center gap-2 px-1">
                                        <span class="text-xs font-bold uppercase text-primary">{{ filter.key | titlecase | translate }} :</span>
                                        <span class="text-sm">{{ getFilterValue(filter.value) }}</span>
                                    </div>
                                </p-tag>
                            </ng-container>
                        </div>
                    </div>

                    <div class="flex-1 flex justify-content-center">
                        <p-iconfield  iconPosition="left">
                            <p-inputicon styleClass="pi pi-search" />
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="searchValue"
                                (keyup.enter)="onSearch($event)"
                                [placeholder]="'Search_by_name_or_sku...' | translate"
                                class="p-inputtext-sm w-full md:w-25rem border-round-xl shadow-1"
                            />
                            <p-inputicon *ngIf="searchValue" styleClass="pi pi-times cursor-pointer" (click)="clearSearch()" />
                        </p-iconfield>
                    </div>

                    <div class="flex-1 flex justify-content-end">
                    </div>

                </div>
            </ng-template>

            <ng-template pTemplate="header">
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th style="width: 7rem">{{ 'Image' | translate }}</th>
                    <th style="width: 10rem">
                        <div class="flex items-center justify-between">
                            {{ 'SKU' | translate }}
<!--                            <p-columnFilter type="text" field="sku" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false"></p-columnFilter>-->
                        </div>
                    </th>
                    <th style="width: 25rem">
                        <div class="flex items-center justify-between">
                            {{ 'Name' | translate }}
<!--                            <p-columnFilter type="text" field="name" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false"></p-columnFilter>-->
                        </div>
                    </th>
                    <th style="width: 10rem">
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
                    <th style="width: 8rem" pSortableColumn="stockQuantity">
                        <div class="flex items-center justify-between">
                            {{ 'Quantity' | translate }}
                            <p-sortIcon field="stockQuantity"></p-sortIcon>
                        </div>
                        <p-columnFilter type="text" field="quantity" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false"></p-columnFilter>
                    </th>
                    <th style="width: 12rem">
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
                    <th style="width: 10rem" pSortableColumn="saleType">
                        <div class="flex items-center justify-between">
                            {{ 'Limited' | translate }}
                            <p-columnFilter type="text" field="saleType" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false">
                                <ng-template #filter let-value let-filter="filterCallback">
                                    <p-select scrollHeight="150px" [filter]="true" appendTo="body" [ngModel]="value" [options]="productSaleType" (onChange)="filter($event.value)" placeholder=" {{ 'Limited' | translate }}"
                                        >-->
                                        <ng-template let-option #item>
                                            <p-tag [value]="option.label" [severity]="getStatusSeverity(option.value)" />
                                        </ng-template>
                                    </p-select>
                                </ng-template>
                            </p-columnFilter>
                        </div>
                    </th>
                    <th style="width: 5rem"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr style="height: 103px; min-height: 103px" [ngClass]="{ 'cursor-pointer hover:bg-blue-50': this.config?.data?.mode === 'lookup' }" (click)="onRowClick(item)">
                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="item"></p-tableCheckbox>
                    </td>

                    <td>
                        <div class="flex justify-content-center">
                            <p-overlay-badge [severity]="isSelling(item) ? 'success' : 'danger'" badgeSize="small" styleClass="p-badge-dot">
                                <p-image style="height: 85px;max-height: 85px" height="auto"  loading="lazy" *ngIf="item.m_image" [src]="this.baseUrl + item.m_image" [alt]="item.names" width="85" [preview]="true" imageClass="border-circle shadow-1" (onImageError)="item.m_image = null"></p-image>
                            </p-overlay-badge>
                        </div>
                    </td>

                    <td>
                        <!--                        <p-tag *ngFor="let cat of item.siteConfig" [value]="cat.sku" severity="secondary"> </p-tag>-->
                        <p-tag [value]="item.sku" severity="secondary"></p-tag>
                    </td>

                    <td>
                        <span [pTooltip]="item.names" tooltipPosition="top" class="cursor-help">
                            {{ item.names }}
                        </span>
                    </td>
<!--                    <td>{{ item.brand?.name ?? '' }}</td>-->
                    <td>{{ item.brandName ?? '' }}</td>

                    <td>
                        <div (dblclick)="item._isEditing = true">
                            <p-inputNumber
                                #nb
                                *ngIf="item._isEditing"
                                [(ngModel)]="item.stockQuantity"
                                (onBlur)="onInputBlur(item)"
                                (onFocus)="onInputFocus(item)"
                                autofocus
                                [inputSize]="4"
                                inputClass="w-3rem text-center font-bold p-1 border-1 border-primary"
                            ></p-inputNumber>

                            <span *ngIf="!item._isEditing" class="text-xl font-bold cursor-pointer hover:text-primary transition-colors" [style.color]="item.stockQuantity <= 0 ? '#ef4444' : '#22c55e'">
                                {{ item.stockQuantity }}
                            </span>
                        </div>
                    </td>

                    <td>
                        <div class="categories-container">
                            <div class="flex flex-wrap gap-1">
                                <p-tag
                                    *ngFor="let cat of item.categories"
                                    [value]="cat.name"
                                    severity="secondary"
                                    styleClass="text-xs">
                                </p-tag>
                            </div>
                        </div>
                    </td>

                    <td>
                        <p-select styleClass="table-status-select" [(ngModel)]="item.saleType" [options]="productSaleType" (onChange)="listService.updateProductField(item)" variant="filled" class="w-full">
                            <ng-template #dropdownicon style="visibility: hidden;display: none;width: 0;">
                                <span></span>
                            </ng-template>
                            <ng-template #selectedItem let-selectedOption>
                                <p-tag [severity]="selectedOption.value === 0 ? 'info' : 'danger'" [value]="selectedOption.label | translate"></p-tag>
                            </ng-template>

                            <ng-template #item let-option>
                                <p-tag [severity]="option.value === 0 ? 'info' : 'danger'" [value]="option.label | translate"></p-tag>
                            </ng-template>
                        </p-select>
                    </td>
                    <td>
                        <div class="flex gap-2" *ngIf="config?.data?.mode !== 'lookup'">
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" (onClick)="detailService.openEditDialog(item)"></p-button>
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="questRemove(item.id)"></p-button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <div
            *ngIf="listService.pendingChanges().length > 0"
            class=" fixed right-0 w-full bg-white shadow-lg border-t-1 p-3 flex justify-content-between align-items-center z-5"
            style="width: unset;
    display: flex;
    bottom: 5px;
    right: 5px;"
        >
            <div class="flex align-items-center gap-3 ml-4">
                <i class="pi pi-exclamation-circle text-orange-100 text-xl"></i>
                <span class="font-medium"> {{ 'Have' | translate }} {{ listService.pendingChanges().length }} {{ 'not_saved_records' | translate }} </span>
            </div>
            <div class="flex gap-2 mr-4">
                <p-button label="{{ 'Cancel' | translate }}" icon="pi pi-times" severity="secondary" [text]="true" (onClick)="cancelAllChanges()"></p-button>
                <p-button label="{{ 'Save' | translate }}" icon="pi pi-save" severity="success" (onClick)="saveChanges()"></p-button>
            </div>
        </div>

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
    protected categoryLService = inject(WpCategoryListService);
    protected brandLService = inject(WpBrandListService);

    selectedItem!: IWpProduct[] | null;

    private lastRequestTime: number = 0;
    private readonly COOLDOWN_MS = 500;

    onLazyLoad(event: any) {
        const currentTime = Date.now();

        // Проверяваме дали са минали 5 секунди от последната заявка
        if (currentTime - this.lastRequestTime < this.COOLDOWN_MS) {
            console.warn(`Заявката е блокирана. Моля изчакайте ${((this.COOLDOWN_MS - (currentTime - this.lastRequestTime)) / 1000).toFixed(1)} сек.`);
            return;
        }

        // Обновяваме времето на последната заявка
        this.lastRequestTime = currentTime;

        // Изпълняваме стандартната логика
        console.log('Изпълнявам Lazy Load:', event.first);
        this.listService.loadList(
            event.first,
            event.rows,
            event.filters,
            event.sortField,
            event.sortOrder
        );
    }

    trackByProductId(index: number, item: IWpProduct) {
        return item.id;
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

        if(this.config?.data.rows != null) {
            this.rows = this.config?.data.rows;
        }
        if(this.config?.data.category_id) {
            const catId = this.config.data.category_id;
            this.lastParams.filters = {
                category: { value: catId, matchMode: 'contains' }
            };
        }
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

    protected searchValue: string = '';
    private searchTimeout: any;
    protected lastParams: any = { first: 0, rows: 200, filters: {} };

    private executeSearch(value: string) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            // Копираме текущите филтри, за да не загубим избрания статус
            let filters = { ...this.lastParams.filters };

            if (value && value.trim() !== '') {
                // 'customer' е името на параметъра, който Java-та ще очаква
                filters['name_sku'] = { value: value.trim(), matchMode: 'contains' };
            } else {
                // Ако няма текст, премахваме глобалния филтър
                delete filters['name_sku'];
            }

            // Винаги връщаме на страница 0 (първа), когато правим ново търсене
            this.listService.loadList(0, this.lastParams.rows, filters);
            // this.listService.loadStatusStats();

            // Обновяваме локалното състояние
            this.lastParams.filters = filters;
            this.lastParams.first = 0;
        }, 1000); // 400ms е златната среда за изчакване
    }

    onSearch(event: any) {
        // Взимаме стойността независимо дали е събитие или директен низ
        const value = event?.target?.value !== undefined ? event.target.value : event;

        this.executeSearch(value);
    }
    clearSearch() {
        this.searchValue = '';
        this.executeSearch('');
    }




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
            const active = filterMeta.find((f) => f.value !== null && f.value !== undefined && f.value !== '');
            return active ? active.value : null;
        }

        // Ако е единичен обект
        return filterMeta.value || null;
    }

    removeSingleFilter(table: any, field: string) {
        // 1. Изчистваме стойността в обекта на филтрите на PrimeNG
        if (table.filters[field]) {
            if (Array.isArray(table.filters[field])) {
                table.filters[field].forEach((f: any) => (f.value = null));
            } else {
                table.filters[field].value = null;
            }
        }

        // 2. Казваме на таблицата да приложи "празния" филтър (това обновява UI-а)
        table.filter(null, field, 'contains');
    }

    onInputBlur(item: any) {
        item._isEditing = false;
        if (item.stockQuantity !== item._oldQty) {
            // Маркираме продукта като променен
            item._isDirty = true;
            this.listService.addToPendingChanges(item);
        }
    }

    onInputFocus(item: any) {
        // Важно: записваме старата бройка само ако още нямаме записана такава
        // (предотвратява презаписване на оригинала, ако потребителят цъкне два пъти)
        if (item._oldQty === undefined) {
            item._oldQty = item.stockQuantity;
        }
    }

    saveChanges() {
        this.listService.saveAllChanges();
        this.listService.resetItemsMeta();
    }

    cancelAllChanges() {
        // Най-лесният начин да "върнете" старите стойности е да презаредите текущата страница
        this.listService.clearChanges();
        const table = document.querySelector('p-table') as any;
        // Или просто викаме loadList със сегашните параметри
        this.listService.loadList(this.listService.lastFirst, this.listService.lastRows, this.listService.lastFilters);
        this.listService.resetItemsMeta();
    }
    protected ref = inject(DynamicDialogRef, { optional: true });
    onRowClick(product: IWpProduct) {
        // Проверяваме дали сме в режим lookup
        if (this.config?.data?.mode === 'lookup') {
            console.log('Product selected via row click:', product);

            // Затваряме диалога и връщаме избрания обект
            if (this.ref) {
                this.ref.close(product);
            }
        }
    }
    protected rows = 50;

    private confirmationService = inject(ConfirmationService);

    protected questRemove(target: any) {
        let idsToDelete: any[];

        // Проверяваме дали target е масив (bulk delete) или единично ID/Обект
        if (Array.isArray(target)) {
            // Ако е масив от обекти (от тикчетата)
            idsToDelete = target.map(item => item.id);
        } else if (target && typeof target === 'object' && target.id) {
            // Ако е подаден цял обект (например от реда)
            idsToDelete = [target.id];
        } else {
            // Ако е подадено директно ID
            idsToDelete = [target];
        }

        if (idsToDelete.length === 0) return;

        this.confirmationService.confirm({
            header: this.tr.instant('Are_you_sure?'),
            message: idsToDelete.length > 1
                ? `${this.tr.instant('Delete')} ${idsToDelete.length} ${this.tr.instant('Product')}?`
                : undefined,
            acceptLabel: this.tr.instant('Yes'),
            rejectLabel: this.tr.instant('No'),
            accept: () => {
                // ПРАВИЛНОТО ИЗВИКВАНЕ: Подаваме масива с ID-та
                this.listService.deleteItem(idsToDelete);

                // Нулираме селекцията, ако сме трили масово
                if (Array.isArray(target)) {
                    this.selectedItem = [];
                }
            }
        });
    }
}
