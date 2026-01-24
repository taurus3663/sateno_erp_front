import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerListService } from './list.service';
import { DetailService } from './detail.service';
import { ICustomer } from './interfaces';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { CustomerDetailComponent } from './detail';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';


@Component({
    selector: 'customer-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, Toolbar, CustomerDetailComponent, TranslatePipe],
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
                    <th>{{'Customer' | translate}}</th>
                    <th>{{'Phone' | translate}}</th>
                    <th>{{'Address' | translate}}</th>
                    <th>{{'EIK' | translate}}</th>
                    <th>{{'Type' | translate}}</th>
                    <th>{{'Email' | translate}}</th>
                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-user>
                <tr [ngClass]="{'cursor-pointer hover:bg-blue-50': this.config?.data?.mode === 'lookup'}">
                    <td (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="user"></p-tableCheckbox>
                    </td>

                    <td>{{ user.id }}</td>
                    <td>{{ user.firstName }} {{ user.middleName }} {{ user.lastName }}</td>
                    <td>{{user.phone}}</td>
                    <td>{{user.address}}</td>
                    <td>{{ user.eik }}</td>
                    <td>
                        <p-tag
                            [severity]="user.eik ? 'warn' : 'info'"
                            [value]="(user.eik ? 'Company' : 'Person') | translate">
                        </p-tag>
                    </td>
                    <td>{{ user.email }}</td>
                    <td>
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" (onClick)="detailService.openEditDialog(user)"></p-button>
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="onDelete(user.id)"></p-button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <customer-detail *ngIf="config?.data?.mode !== 'lookup'"></customer-detail>
    `
})
export class CustomerListComponent {
    public listService = inject(CustomerListService);
    public detailService = inject(DetailService);
    private tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });


    selectedItem!: ICustomer[] | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }

    onDelete(id: any) {
        if(confirm(this.tr.instant('Are_you_sure?'))) {
            this.listService.deleteItem(id);
        }
    }
}
