import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductMenuOrderListService } from './list.service';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { WpCategoryListService } from '../wp_category/list.service';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { WpProductListComponent } from '../wp_product/list';
import { XL_AUTH_CONFIG } from 'xl-auth';
import { Image } from 'primeng/image';

@Component({
    selector: 'product-menu-order-list',
    standalone: true,
    imports: [CommonModule, Toolbar, Button, TranslatePipe, TableModule, Select, FormsModule, Image],
    template: `
        <p-toolbar>
            <ng-template #start>
                <p-button (onClick)="this.openProductSelector()" [disabled]="!this.selectedCategory" [label]="'add_order_new_produt' | translate" icon="pi pi-plus" severity="primary" class="mr-2"></p-button>

                <p-select
                    [(ngModel)]="selectedCategory"
                    [options]="categoryListService.items()"
                    optionLabel="data.name"
                    optionValue="data"
                    placeholder="{{ 'Category' | translate }}"
                    [filter]="true"
                    appendTo="body"
                    (onChange)="this.onCategoryChange(this.selectedCategory)"
                >
                    <ng-template #item let-option>
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-tag text-primary"></i>
                            <span>{{ option.data.name.split('|')[0].trim() }}</span>
                        </div>
                    </ng-template>
                </p-select>

                <p-button (onClick)="this.saveChanges()" [disabled]="!this.selectedCategory" [label]="'Save' | translate" icon="pi pi-save" severity="primary" class="mr-2 ml-2"></p-button>
            </ng-template>
        </p-toolbar>

        <p-table [value]="draggableItems" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 20, 50, 100]" [tableStyle]="{ 'min-width': '50rem' }" [rowHover]="true" dataKey="products.id" (onRowReorder)="onRowReorder($event)">
            <ng-template pTemplate="header">
                <tr>
                    <!-- Празно поле за иконката за влачене -->
                    <th style="width: 3rem"></th>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th>{{ 'Category' | translate }}</th>
                    <th>{{ 'Name' | translate }}</th>
                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>

            <!-- Добавяме let-index="rowIndex", за да знаем кой ред влачим -->
            <ng-template pTemplate="body" let-item let-index="rowIndex">
                <tr [pReorderableRow]="index" class="cursor-move">
                    <!-- Иконката за влачене -->
                    <td>
                        <i class="pi pi-bars text-primary" pReorderableRowHandle style="cursor: grab; font-size: 1.2rem;"></i>
                    </td>

                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="item"></p-tableCheckbox>
                    </td>

                    <td>{{ item.categoryName }}</td>

                    <td>
                        <div class="flex align-items-center gap-3">
                            <!-- Снимката -->
                            <!-- ЗАБЕЛЕЖКА: Смени 'image' с точното име на полето, което идва от твоя бекенд (напр. image_url, photo, thumbnail) -->
                            <!--                            <img-->
                            <!--                                [src]="item.products.m_image"-->
                            <!--                                [alt]="item.products.names"-->
                            <!--                                style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"-->
                            <!--                            />-->
                            <p-image
                                style="height: 85px;max-height: 85px"
                                height="auto"

                                [src]="this.baseUrl + item.products.m_image"
                                width="85"
                                [preview]="true"
                                imageClass="border-circle shadow-1"
                            ></p-image>

                            <!-- Името на продукта -->
                            <span class="font-bold text-900">{{ item.products.names }}</span>
                        </div>
                    </td>

                    <td>
                        <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="removeItem(item)"></p-button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `
})
export class ProductMenuOrderListComponent {
    protected config = inject(DynamicDialogConfig, { optional: true });
    private ref = inject(DynamicDialogRef, { optional: true });
    private dialogService = inject(DialogService);
    private tr = inject(TranslateService);
    private cdr = inject(ChangeDetectorRef);

    public listService = inject(ProductMenuOrderListService);
    public categoryListService = inject(WpCategoryListService);
    private authConfig = inject(XL_AUTH_CONFIG);
    protected readonly baseUrl = this.authConfig.apiUrl;

    public selectedCategory: any = null;

    // 1. ЛОКАЛЕН МАСИВ ЗА ВЛАЧЕНЕ (вместо read-only computed)
    public draggableItems: any[] = [];
    protected lastParams: any = { first: 0, rows: 1000, filters: {} };

    constructor() {
        this.categoryListService.loadList(0, 1000);

        // 2. EFFECT: Пълним локалния масив, само когато данните се заредят от бекенда
        effect(
            () => {
                const items = this.listService.items();
                const flat: any[] = [];

                items.forEach((order) => {
                    if (Array.isArray(order.products)) {
                        order.products.forEach((p) => {
                            flat.push({
                                categoryName: order.categoryName,
                                products: p
                            });
                        });
                    } else if (order.products) {
                        flat.push(order);
                    }
                });
                this.draggableItems = flat;
            },
            { allowSignalWrites: true }
        );
    }

    onCategoryChange(category: any) {
        if (!category) return;

        const categoryId = category.id;
        this.lastParams.filters = {
            category_id: { value: categoryId, matchMode: 'equals' }
        };

        // Зареждаме достатъчно голям брой (напр. 1000), за да влачим свободно без мързеливо зареждане
        this.listService.loadList(0, this.lastParams.rows, this.lastParams.filters);
    }

    // 3. Събитие при пускане на реда след влачене
    onRowReorder(event: any) {
        // PrimeNG автоматично е пренаредил масива this.draggableItems!
        // Тук само казваме на Angular да обнови изгледа
        this.cdr.detectChanges();
    }

    saveChanges() {
        // Взимаме ID-тата директно от подредения локален масив!
        const allProductIds = this.draggableItems.map((item) => item.products.id);

        const payload = {
            category: this.selectedCategory.id,
            productIds: allProductIds
        };

        console.log('Payload за запис:', payload);
        this.listService.updateList(payload);
    }

    removeItem(itemToRemove: any) {
        // Премахваме директно от локалния масив
        this.draggableItems = this.draggableItems.filter((item) => item.products.id !== itemToRemove.products.id);
        this.cdr.detectChanges();
    }

    openProductSelector() {
        const cleanCategoryName = this.selectedCategory.name.split('|')[0].trim();
        const ref = this.dialogService.open(WpProductListComponent, {
            header: this.tr.instant('Product'),
            width: '100%',
            height: '100%',
            closeOnEscape: true,
            closable: true,
            data: { mode: 'lookup', category_id: cleanCategoryName }
        });

        ref?.onClose.subscribe(async (product: any) => {
            if (product) {
                const newItem: { categoryName: any; products: { names: any; id: any } } = {
                    categoryName: cleanCategoryName,
                    products: {
                        names: product.names,
                        id: product.id
                    }
                };

                // Добавяме новия продукт най-отгоре (или най-отдолу, ако предпочиташ) в локалния масив
                this.draggableItems = [newItem, ...this.draggableItems];
                this.cdr.detectChanges();
            }
        });
    }
}
