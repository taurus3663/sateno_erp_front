import { ChangeDetectorRef, Component, computed, inject } from '@angular/core';
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

@Component({
    selector: 'product-menu-order-list',
    standalone: true,
    imports: [CommonModule, Toolbar, Button, TranslatePipe, TableModule, Select, FormsModule],
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

        <p-table
            [value]="tableData()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [paginator]="true"
            [rows]="10"
            [totalRecords]="listService.totalRecords()"
            [loading]="listService.loading()"
            [rowsPerPageOptions]="[10, 20, 50]"
            [tableStyle]="{ 'min-width': '50rem' }"
            [rowHover]="true"
            dataKey="id"
        >
            <ng-template pTemplate="header">
                <tr>
                    <th>
                        <p-tableHeaderCheckbox />
                    </th>

                    <th>
                        {{ 'Category' | translate }}
                    </th>

                    <th>
                        {{ 'Name' | translate }}
                    </th>

                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr>
                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="item"></p-tableCheckbox>
                    </td>

                    <td>
                        {{ item.categoryName }}
                    </td>

                    <td>
                        {{ item.products.names }}
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

    public selectedCategory: any = null;


    protected tableData = computed(() => {
        const items = this.listService.items();
        const flat: any[] = [];

        items.forEach(order => {
            // Ако order.products е масив (както в JSON-а от бекенда)
            if (Array.isArray(order.products)) {
                order.products.forEach(p => {
                    flat.push({
                        categoryName: order.categoryName,
                        products: p // Така шаблона {{ item.products.names }} ще работи!
                    });
                });
            } else {
                // За случаите, когато добавяш ръчно от openProductSelector
                flat.push(order);
            }
        });
        return flat;
    });

    // public currentCategoryProducts: any[] = [];

    onCategoryChange(category: any) {
        if (!category) return;

        const categoryId = category.id;
        // 1. Обновяваме глобалния обект с параметри
        this.lastParams.filters = {
            category_id: { value: categoryId, matchMode: 'equals' }
        };

        // 3. Извикваме зареждането
        this.listService.loadList(0, this.lastParams.rows, this.lastParams.filters);
    }

    protected lastParams: any = { first: 0, rows: 200, filters: {} };


    onLazyLoad(event: any) {
        if(!this.lastParams.filters) return;
        this.listService.loadList(event.first, event.rows, this.lastParams.filters);
    }
    constructor() {
        this.categoryListService.loadList(0, 1000);
    }

    saveChanges() {
        // 1. Събираме всички ID-та от всички възможни структури
        const allProductIds: any[] = [];

        this.listService.items().forEach(item => {
            // Ако products е масив (от бекенда)
            if (Array.isArray(item.products)) {
                item.products.forEach((p: any) => allProductIds.push(p.id));
            }
            // Ако products е единичен обект (добавен ръчно)
            else if (item.products && item.products.id) {
                allProductIds.push(item.products.id);
            }
        });

        const payload = {
            category: this.selectedCategory.id,
            productIds: allProductIds // Вече имаш чист масив от ID-та
        };

        console.log("Payload за запис:", payload);
        this.listService.updateList(payload);
    }

    removeItem(itemToRemove: any) {
        this.listService.items.update(currentItems => {
            // Тъй като 'itemToRemove' е обект от плоския списък,
            // трябва да намерим съответната поръчка и да премахнем продукта от нея
            return currentItems.map(order => {
                if (Array.isArray(order.products)) {
                    return {
                        ...order,
                        products: order.products.filter(p => p.id !== itemToRemove.products.id)
                    };
                }
                return order;
            }).filter(order => Array.isArray(order.products) ? order.products.length > 0 : true);
        });
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
                // 1. Създаваме нов обект, спазвайки структурата, която ти показваш в p-template
                const newItem: { categoryName: any; products: { names: any, id: any } } = {
                    categoryName: this.selectedCategory.name, // Избраната от потребителя категория
                    products: {
                        names: product.names, // Това, което p-table очаква: item.products.names
                        id: product.id
                    }
                };

                // 2. Добавяме го чрез "Spread operator" (immutable начин), за да избегнем NG0100 грешката
                // Това създава нов масив, вместо да мутира стария директно
                // const currentList = this.listService.items();
                this.listService.items.update(currentItems => [...currentItems, newItem]);
                // Забележка: Ако listService.items е Signal, използвай:
                // this.listService.items.set([...this.listService.items(), newItem]);
            }
        });
    }
}
