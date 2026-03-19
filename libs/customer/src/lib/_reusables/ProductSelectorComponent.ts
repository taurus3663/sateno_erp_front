import { Component, inject, signal } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { WpProductListService } from '../wp_product/list.service';
import { XL_AUTH_CONFIG } from 'xl-auth';
import { Image } from 'primeng/image'; // Твоят сървис за сайтове

@Component({
    standalone: true,
    selector: 'app-product-selector',
    imports: [CommonModule, Select, Button, FormsModule, TranslatePipe, Image],
    template: `
        <div class="flex flex-col gap-5 p-2">

            <p-select
                [(ngModel)]="selectedSiteId"
                [options]="productListService.items()"
                optionLabel="sku"
                optionValue="id"
                [filter]="true"
                filterBy="sku,brand.name"
                [placeholder]="'Choose' | translate"
                class="w-full custom-product-select"
                [appendTo]="'body'"
                [virtualScroll]="true"
                [virtualScrollItemSize]="60"
                [lazy]="true"
                (onLazyLoad)="loadNextPage($event)"
            >
                <ng-template #selectedItem let-selectedOption>
                    <div class="flex align-items-center gap-2" *ngIf="selectedOption">
                        <div class="flex-shrink-0">
                            @if (selectedOption.m_image) {
                                <p-image
                                    [src]="baseUrl + selectedOption.m_image"
                                    [alt]="selectedOption.sku"
                                    width="100"
                                    height="auto"
                                    imageClass="border-circle shadow-1 object-cover h-full"
                                >
                                </p-image>
                            } @else {
                                <div class="border-circle bg-gray-200 flex align-items-center justify-content-center w-full h-full shadow-1">
                                    <i class="pi pi-image text-gray-400 text-xl"></i>
                                </div>
                            }
                        </div>
                       <div>

                         <p class="font-bold text-medium">{{selectedOption.names}}</p>

                           <div class="flex align-items-center gap-2">
                               <span class="font-bold text-900">{{'Sku' | translate}} {{ selectedOption.sku }}</span>
                               <span>|</span>
                               <span class="font-bold text-900">{{'Brand' | translate}} {{ selectedOption.brand?.name }}</span>
                           </div>

                           <small class="text-orange-600 font-medium text-xl">
                               {{ 'Quantity' | translate }}: {{ selectedOption.stockQuantity }}
                           </small>
                       </div>
                    </div>
                </ng-template>

                <ng-template #item let-product>
                    <div class="flex align-items-center gap-3 p-1">
                        <div class="flex-shrink-0" style="width: 45px; height: 45px;">
                            @if (product.m_image) {
                                <p-image
                                    [src]="baseUrl + product.m_image"
                                    [alt]="product.sku"
                                    width="45"
                                    imageClass="border-circle shadow-1 object-cover h-full"
                                 >
                                </p-image>
                            } @else {
                                <div class="border-circle bg-gray-200 flex align-items-center justify-content-center w-full h-full shadow-1">
                                    <i class="pi pi-image text-gray-400 text-xl"></i>
                                </div>
                            }
                        </div>
                        <div class="flex flex-column">
                            <span class="font-bold text-900">{{ product.sku }}</span>
                            <small class="text-secondary">{{ product.brand?.name }} (Stock: {{ product.stockQuantity }})</small>
                        </div>
                    </div>
                </ng-template>
            </p-select>

            <div class="flex justify-end gap-3 mt-2">
                <p-button [label]="'Cancel' | translate" severity="secondary" [text]="true" (onClick)="close()" />
                <p-button [label]="'Confirm' | translate" icon="pi pi-check" [disabled]="!selectedSiteId" (onClick)="confirm()" />
            </div>
        </div>
    `
})
export class ProductSelectorComponent {
    protected productListService = inject(WpProductListService);
    protected ref = inject(DynamicDialogRef);
    protected config = inject(DynamicDialogConfig);
    private authConfig = inject(XL_AUTH_CONFIG);
    protected readonly baseUrl = this.authConfig.apiUrl;

    selectedSiteId: number | null = null;

    constructor() {
        if (this.productListService.items().length === 0) {
            this.productListService.loadList(0, 10);
        }
        setTimeout(() => {
            console.log(this.productListService.items());
        }, 5000);
    }

    close() {
        this.ref.close();
    }
    confirm() {
        this.ref.close(this.selectedSiteId);
    }

    // В SiteSelectorComponent добави този метод:

    loadNextPage(event: any) {
        // event.first = индексът на първия елемент, който трябва да се покаже
        // event.rows = броят редове на страница (обикновено 10 или 20)

        console.log('Loading page starting from:', event.first);

        // Извикваме сервиза за следващата порция данни
        // Сървисът ти трябва да е направен така, че да ОБЕДИНЯВА новите данни със старите
        this.productListService.loadList(event.first, 10);
    }
}
