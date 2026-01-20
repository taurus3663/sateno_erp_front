import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WpCategoryListService } from './list.service';
import { WpCategoryDetailService } from './detail.service';
import { IWpCategory } from './interfaces';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { WpCategoryDetailComponent } from './detail';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpClient } from '@angular/common/http';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';


@Component({
    selector: 'customer-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, Toolbar, WpCategoryDetailComponent, TranslatePipe, TreeTableModule],
    template: `
        <p-toolbar class="mb-6" *ngIf="config?.data?.mode !== 'lookup'">
            <ng-template #start>
                <p-button [label]="'New' | translate" icon="pi pi-plus" severity="primary" class="mr-2" (onClick)="detailService.openCreateDialog()"></p-button>
                <p-button severity="warn" [label]="'Delete' | translate" icon="pi pi-trash" outlined [disabled]="!selectedItem" />
            </ng-template>
        </p-toolbar>

        <p-treeTable
            [value]="listService.items()"
            [columns]="cols"
            [paginator]="true"
            [rows]="10"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [totalRecords]="listService.totalRecords()"
            [loading]="listService.loading()"
            (onNodeExpand)="onNodeExpand($event)"
            [scrollable]="true"
            [tableStyle]="{ 'min-width': '50rem' }"
            [(selection)]="selectedItem"
            dataKey="id"
        >
            <ng-template #header let-columns>
                <tr>
                    <th *ngFor="let col of columns">
                        {{ col.header | translate }}
                    </th>
                    <th style="width: 10rem"></th>
                </tr>
            </ng-template>

            <ng-template #body let-rowNode let-rowData="rowData" let-columns="columns">
                <tr [ttRow]="rowNode"
                    (click)="onRowClick(rowData)"
                    [class.cursor-pointer]="config?.data?.mode === 'lookup'">

                    <td *ngFor="let col of columns; let i = index">
            <span (click)="$event.stopPropagation()" *ngIf="i === 0">
                <p-treetable-toggler [rowNode]="rowNode" />
            </span>

                        {{ rowData[col.field] }}
                    </td>

                    <td (click)="$event.stopPropagation()">
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" (onClick)="detailService.openEditDialog(rowData)"></p-button>
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="onDelete(rowData.id)"></p-button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-treeTable>

        <wp_category-detail *ngIf="config?.data?.mode !== 'lookup'"></wp_category-detail>
    `
})
export class WpCategoryListComponent {
    public listService = inject(WpCategoryListService);
    public detailService = inject(WpCategoryDetailService);
    private tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });

    cols = [
        { field: 'id', header: 'Id' },
        { field: 'name', header: 'Name' },
        { field: 'slug', header: 'Slug' },
        { field: '', header: '' },
        // { field: 'count', header: 'Count' },
        // { field: 'displayType', header: 'Display_Type' }
    ];

    selectedItem!: TreeNode<IWpCategory> | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }

    onDelete(id: any) {
        if (confirm(this.tr.instant('Are_you_sure?'))) {
            this.listService.deleteItem(id);
        }
    }

    onNodeExpand(event: any) {
        // Викаме loadChildren от специфичния ни сървис
        this.listService.loadChildren(event.node);
    }

    constructor() {
        // this.syncCategories(1);
    }

    protected http = inject(HttpClient);
    // В твоя компонент или сървис
    syncCategories(id: number) {
        const url = 'wpcategory/sync';
        const params = { siteId: id.toString() }; // Подаваме параметъра siteId

        this.http.post<any>(url, {}, { params }).subscribe({
            next: (res) => {
                console.log('Синхронизацията стартира успешно. Провери конзолата на бекенда!');
            },
            error: (err) => {
                console.error('Грешка при синхронизация:', err);
            }
        });
    }


    // В WpCategoryListComponent
    // protected config = inject(DynamicDialogConfig, { optional: true });
    private ref = inject(DynamicDialogRef, { optional: true });

    onRowClick(category: any) {
        if (this.config?.data?.mode === 'lookup') {
            // Затваряме диалога и връщаме избраната категория на предишния прозорец
            console.log(category.toString());
            if (this.ref) {
                this.ref.close(category);
            }
        }
    }
}
