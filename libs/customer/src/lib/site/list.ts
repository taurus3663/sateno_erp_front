import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteListService } from './list.service';
import { SiteDetailService } from './detail.service';
import { ISite } from './interfaces';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { SiteDetailComponent } from './detail';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';


@Component({
    selector: 'customer-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, Toolbar, SiteDetailComponent, TranslatePipe],
    template: `
        <p-toolbar class="mb-6" *ngIf="config?.data?.mode !== 'lookup'">
            <ng-template #start>
                <p-button [label]="'New' | translate" icon="pi pi-plus" severity="primary" class="mr-2"
                          (onClick)="detailService.openCreateDialog()"></p-button>
                <p-button severity="warn" [label]="'Delete' | translate" icon="pi pi-trash" outlined
                          [disabled]="!selectedItem" />
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
                    <th>{{ 'Url' | translate }}</th>
                    <th>{{ 'Consumer_key' | translate }}</th>
                    <th>{{ 'Consumer_secret' | translate }}</th>
                    <th>{{ 'Currency' | translate }}</th>
                    <th>{{ 'Status' | translate }}</th>
                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr [ngClass]="{'cursor-pointer hover:bg-blue-50': this.config?.data?.mode === 'lookup'}">
                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="item"></p-tableCheckbox>
                    </td>

                    <td>{{ item.id }}</td>
                    <td>{{ item.name }}</td>
                    <td><p-tag [severity]="item.isActive ? 'success' : 'danger'"
                               [value]=" item.isActive ? 'Yes' : 'No' | translate"></p-tag></td>
                    <td>{{ item.url }}</td>
                    <td>{{ item.currency }}</td>
                    <td>
                        <p-tag [severity]="item.active ? 'success' : 'danger'"
                               [value]=" item.active ? 'Active' : 'Blocked' | translate"></p-tag>
                    </td>
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

        <site-detail *ngIf="config?.data?.mode !== 'lookup'"></site-detail>
    `
})
export class SiteListComponent {
    public listService = inject(SiteListService);
    public detailService = inject(SiteDetailService);
    private tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });


    selectedItem!: ISite[] | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }

    onDelete(id: any) {
        if(confirm(this.tr.instant('Are_you_sure?'))) {
            this.listService.deleteItem(id);
        }
    }
}
