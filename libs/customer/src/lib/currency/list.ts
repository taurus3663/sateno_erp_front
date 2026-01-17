import { Component, inject } from '@angular/core';
import { CurrencyListService } from './list.service';
import { CurrencyDetailService } from './detail.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ICurrency } from './interfaces';
import { Button } from 'primeng/button';
import { NgClass, NgIf } from '@angular/common';
import { Toolbar } from 'primeng/toolbar';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { CurrencyDetailComponent } from './detail';

@Component({
    selector: 'currency-list',
    standalone: true,
    imports: [Button, NgIf, Toolbar, TranslatePipe, PrimeTemplate, TableModule, Tag, NgClass, CurrencyDetailComponent],
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
                    <th>{{ 'Symbol' | translate }}</th>
                    <th>{{ 'DecimalPlaces' | translate }}</th>
                    <th>{{ 'Code' | translate }}</th>
                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr [ngClass]="{ 'cursor-pointer hover:bg-blue-50': this.config?.data?.mode === 'lookup' }">
                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="item"></p-tableCheckbox>
                    </td>

                    <td>{{ item.id }}</td>
                    <td>{{ item.name }}</td>
                    <td><p-tag severity="success" [value]="item.symbol"> </p-tag></td>
                    <td><p-tag severity="success" [value]="item.decimalPlaces"> </p-tag></td>
                    <td>
                        <p-tag severity="success" [value]="item.code"> </p-tag>
                    </td>
                    <td>
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" (onClick)="detailService.openEditDialog(item)"></p-button>
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="onDelete(item.id)"></p-button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <currency-detail *ngIf="config?.data?.mode !== 'lookup'"></currency-detail>
    `
})
export class CurrencyListComponent {
    public listService = inject(CurrencyListService);
    public detailService = inject(CurrencyDetailService);
    private tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });

    selectedItem!: ICurrency[] | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }

    onDelete(id: any) {
        if (confirm(this.tr.instant('Are_you_sure?'))) {
            this.listService.deleteItem(id);
        }
    }
}
