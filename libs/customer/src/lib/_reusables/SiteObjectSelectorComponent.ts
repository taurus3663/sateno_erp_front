import { Component, inject, signal } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SiteListService } from '../site/list.service'; // Твоят сървис за сайтове

@Component({
    standalone: true,
    selector: 'app-site-selector',
    imports: [CommonModule, Select, Button, FormsModule, TranslatePipe],
    template: `
        <div class="flex flex-col gap-5 p-2">
            <label class="font-medium text-lg">{{ label() | translate }}</label>

            <p-select
                [options]="siteService.items()"
                [(ngModel)]="selectedSite"
                optionLabel="name"
                [placeholder]="'Select_Site' | translate"
                class="w-full"
                [appendTo]="'body'">
            </p-select>

            <div class="flex justify-end gap-3 mt-2">
                <p-button [label]="'Cancel' | translate" severity="secondary" [text]="true" (onClick)="close()" />
                <p-button [label]="'Confirm' | translate" icon="pi pi-check" [disabled]="!selectedSite" (onClick)="confirm()" />
            </div>
        </div>
    `
})
export class SiteObjectSelectorComponent {
    protected siteService = inject(SiteListService);
    protected ref = inject(DynamicDialogRef);
    protected config = inject(DynamicDialogConfig);

    // Можеш да подаваш различен текст през config.data
    label = signal(this.config.data?.label || '');
    selectedSite: any | null = null;

    constructor() {
        // Зареждаме сайтовете, ако още не са заредени
        if (this.siteService.items().length === 0) {
            this.siteService.loadList(0, 100);
        }
    }

    close() { this.ref.close(); }
    confirm() { this.ref.close(this.selectedSite); }
}
