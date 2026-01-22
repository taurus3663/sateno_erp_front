import { Component, inject } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WpAddonDetailService } from './detail.service';
import { Checkbox } from 'primeng/checkbox';
import { CurrencyListService } from '../currency/list.service';
import { Select } from 'primeng/select';
import { LanguageListService } from '../language/list.service';


@Component({
    selector: 'site-detail',
    standalone: true,
    imports: [Dialog, Button, InputText, FormsModule, CommonModule, ButtonDirective, TranslatePipe, Checkbox, Select],
    template: `
        <p-dialog [visible]="detailService.isVisible()" (visibleChange)="detailService.closeDetail()" [modal]="true"
                  [style]="{ width: '500px' }">
            <!--                        [header]="detailService.selectedItem()?.id ? 'Редакция на потребител #' + detailService.selectedItem()?.id : 'Нов потребител'"
-->
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <!--                        {{ detailService.selectedItem()?.id ? 'Редакция на клиент #' + detailService.selectedItem()?.id : 'Нов клиент' }}-->
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Site' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Site' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div class="grid grid-cols-12 gap-4 pt-2" *ngIf="detailService.selectedItem() as item">
                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Name' | translate }}</label>
                        <input pInputText [(ngModel)]="item.name" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Currency' | translate }}</label>

                        <p-select [options]="currencyService.items()" [(ngModel)]="item.currency" optionLabel="name"
                                  placeholder="Избери валута" dataKey="id" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Language' | translate }}</label>

                        <p-select [options]="languageService.items()" [(ngModel)]="item.language" optionLabel="name"
                                  placeholder="Избери Език" dataKey="id" class="w-full" />
                    </div>

                    <div class="col-span-8">
                        <label class="block font-bold mb-2">{{ 'Url' | translate }}</label>
                        <input pInputText [(ngModel)]="item.url" class="w-full" />
                    </div>

                    <div class="col-span-4">
                        <label class="block font-bold mb-2">{{ 'Active' | translate }}</label>
                        <!--                        <input pInputText [(ngModel)]="item.isActive" class="w-full" />-->
                        <p-checkbox [(ngModel)]="item.active" [binary]="true"></p-checkbox>
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Consumer_key' | translate }}</label>
                        <input pInputText [(ngModel)]="item.consumerKey" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-2">{{ 'Consumer_secret' | translate }}</label>
                        <input pInputText [(ngModel)]="item.consumerSecret" class="w-full" />
                    </div>

                    <!--                    <button type="button" pButton icon="pi pi-search" (click)="openLookup()"></button>-->
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()"
                          (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
            </ng-template>
        </p-dialog>
    `
})
export class SiteDetailComponent {
    activeTab: any = 0;
    protected detailService = inject(WpAddonDetailService);
    protected currencyService = inject(CurrencyListService);
    protected languageService = inject(LanguageListService);


    constructor() {
        // Зареждаме всички валути (напр. първите 1000), за да ги има в падащото меню
        // Това се вика веднъж при създаване на компонента
        this.currencyService.loadList(0, 1000);
        this.languageService.loadList(0, 1000);
    }
    // private tr = inject(TranslateService);
}
