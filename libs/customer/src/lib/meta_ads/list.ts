import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { NgClass, NgIf } from '@angular/common';
import { Toolbar } from 'primeng/toolbar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MetaAdsListService } from './list.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MetaAdsDetailService } from './detail.service';
import { IMetaAds } from './interface';
import { TableModule } from 'primeng/table';
import { MetaAdsDetailComponent } from './detail';

@Component({
    selector: 'meta_ads-list',
    standalone: true,
    imports: [Button, NgIf, Toolbar, TranslatePipe, TableModule, NgClass, MetaAdsDetailComponent],
    template: `
        <p-toolbar class="mb-6" *ngIf="config?.data?.mode !== 'lookup'">
            <ng-template #start>
                <p-button [label]="'New' | translate" icon="pi pi-plus" severity="primary" class="mr-2" (onClick)="detailService.openCreateDialog()"></p-button>
                <p-button severity="warn" [label]="'Delete' | translate" icon="pi pi-trash" outlined [disabled]="!selectedItem" />
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
                    <th>{{ 'Id' | translate }}</th>
                    <th>{{ 'Name' | translate }}</th>
                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr (click)="onRowClick(item)" [ngClass]="{ 'cursor-pointer hover:bg-blue-50': this.config?.data?.mode === 'lookup' }">
                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="item"></p-tableCheckbox>
                    </td>

                    <td>{{ item.id }}</td>
                    <td>{{ item.name }}</td>

                    <td>
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary"
                                      (onClick)="detailService.openEditDialog(item)"></p-button>
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger"
                                      (onClick)="onDelete(item.id)"></p-button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <meta_ads-detail *ngIf="config?.data?.mode !== 'lookup'"></meta_ads-detail>
    `
})
export class MetaAdsListComponent {
    public listService = inject(MetaAdsListService);
    public detailService = inject(MetaAdsDetailService);
    private tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });
    private ref = inject(DynamicDialogRef, { optional: true });

    selectedItem!: IMetaAds[] | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }

    onRowClick(category: any) {
        if (this.config?.data?.mode === 'lookup') {
            // Затваряме диалога и връщаме избраната категория на предишния прозорец
            // console.log(category.toString());
            if (this.ref) {
                this.ref.close(category);
            }
        }
    }

    onDelete(id: any) {
        if(confirm(this.tr.instant('Are_you_sure?'))) {
            this.listService.deleteItem(id);
        }
    }
}
