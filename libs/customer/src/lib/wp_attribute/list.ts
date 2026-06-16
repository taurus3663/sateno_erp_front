import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { WpAttributeListService } from './list.service';
import { LanguageListService } from '../language/list.service';
import { IWpAttributeType, IWpAttributeValue } from './interfaces';

@Component({
    selector: 'wp-attribute-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe, ButtonModule, TableModule, Toolbar, Dialog, InputText, Select, Checkbox],
    template: `
        <div class="grid grid-cols-12 gap-4">
            <!-- LEFT: Types -->
            <div class="col-span-4">
                <p-toolbar class="mb-3">
                    <ng-template #start>
                        <span class="font-bold text-lg">{{ 'Attribute_Types' | translate }}</span>
                    </ng-template>
                    <ng-template #end>
                        <p-button icon="pi pi-plus" size="small" (onClick)="openTypeDialog()"></p-button>
                    </ng-template>
                </p-toolbar>

                <p-table [value]="service.types()" [loading]="service.loading()" [rowHover]="true" dataKey="id">
                    <ng-template pTemplate="body" let-type>
                        <tr [class.bg-primary-50]="selectedType()?.id === type.id" class="cursor-pointer" (click)="selectType(type)">
                            <td>
                                <div class="flex flex-column">
                                    <span class="font-semibold">{{ type.label }}</span>
                                    <span class="text-xs text-color-secondary">{{ type.slug }}</span>
                                </div>
                            </td>
                            <td class="text-center">
                                <i class="pi" [ngClass]="type.multipleValues ? 'pi-list-check text-primary' : 'pi-check-circle text-color-secondary'" [title]="type.multipleValues ? 'Мulti' : 'Single'"></i>
                            </td>
                            <td style="width: 6rem">
                                <div class="flex gap-1">
                                    <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" size="small" (onClick)="openTypeDialog(type); $event.stopPropagation()"></p-button>
                                    <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="deleteType(type); $event.stopPropagation()"></p-button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="3" class="text-center p-4 text-color-secondary">{{ 'No_records_found' | translate }}</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>

            <!-- RIGHT: Values for selected type -->
            <div class="col-span-8">
                <p-toolbar class="mb-3">
                    <ng-template #start>
                        <span class="font-bold text-lg">
                            {{ selectedType() ? selectedType()!.label + ' — ' + ('Attribute_Values' | translate) : ('Select_Attribute_Type' | translate) }}
                        </span>
                    </ng-template>
                    <ng-template #end>
                        <p-button icon="pi pi-plus" size="small" [disabled]="!selectedType()" (onClick)="openValueDialog()"></p-button>
                    </ng-template>
                </p-toolbar>

                <p-table [value]="service.values()" [rowHover]="true" dataKey="id">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>{{ 'Name' | translate }}</th>
                            <th>{{ 'Slug' | translate }}</th>
                            <th style="width: 6rem"></th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-val>
                        <tr>
                            <td>{{ val.label }}</td>
                            <td class="text-color-secondary text-sm">{{ val.slug }}</td>
                            <td>
                                <div class="flex gap-1">
                                    <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" size="small" (onClick)="openValueDialog(val)"></p-button>
                                    <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="deleteValue(val)"></p-button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="3" class="text-center p-4 text-color-secondary">
                                {{ selectedType() ? ('No_records_found' | translate) : ('Select_Attribute_Type' | translate) }}
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Type Dialog -->
        <p-dialog [(visible)]="typeDialogVisible" [modal]="true" [style]="{ width: '700px', height: '700px' }">
            <ng-template #header>
                <span class="font-bold">{{ editingType.id ? ('Edit' | translate) : ('New' | translate) }} {{ 'Attribute_Type' | translate }}</span>
            </ng-template>
            <ng-template #content>
                <div class="grid grid-cols-12 gap-3 pt-2" *ngIf="typeDialogVisible">
                    <div class="col-span-12">
                        <label class="block font-bold mb-1">{{ 'Slug' | translate }}</label>
                        <input pInputText [(ngModel)]="editingType.slug" (ngModelChange)="onTypeSlugInput($event)" placeholder="pa_example" class="w-full" />
                    </div>

                    <div class="col-span-12 flex align-items-center gap-2">
                        <p-checkbox [(ngModel)]="editingType.multipleValues" [binary]="true" inputId="multiVal"></p-checkbox>
                        <label for="multiVal">{{ 'Multiple_Values' | translate }}</label>
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-1">{{ 'Select_Language' | translate }}</label>
                        <p-select [options]="languageService.items()" [(ngModel)]="selectedLang" optionLabel="name" class="w-full" (onChange)="onTypeLangChange()"></p-select>
                    </div>

                    <div class="col-span-12" *ngIf="selectedLang">
                        <label class="block font-bold mb-1">{{ 'Name' | translate }} ({{ selectedLang.code }})</label>
                        <input pInputText [ngModel]="typeCurrentLabel()" (ngModelChange)="onTypeLabelChange($event)" class="w-full" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button [label]="'Cancel' | translate" severity="secondary" [text]="true" (onClick)="typeDialogVisible = false"></p-button>
                <p-button [label]="'Save' | translate" icon="pi pi-check" [loading]="saving()" (onClick)="saveType()"></p-button>
            </ng-template>
        </p-dialog>

        <!-- Value Dialog -->
        <p-dialog [(visible)]="valueDialogVisible" [modal]="true" [style]="{ width: '700px', height: '700px' }">
            <ng-template #header>
                <span class="font-bold">{{ editingValue.id ? ('Edit' | translate) : ('New' | translate) }} {{ 'Attribute_Value' | translate }}</span>
            </ng-template>
            <ng-template #content>
                <div class="grid grid-cols-12 gap-3 pt-2" *ngIf="valueDialogVisible">
                    <div class="col-span-12">
                        <label class="block font-bold mb-1">{{ 'Slug' | translate }}</label>
                        <input pInputText [(ngModel)]="editingValue.slug" (ngModelChange)="onValueSlugInput($event)" placeholder="example-value" class="w-full" />
                    </div>

                    <div class="col-span-12">
                        <label class="block font-bold mb-1">{{ 'Select_Language' | translate }}</label>
                        <p-select [options]="languageService.items()" [(ngModel)]="selectedLang" optionLabel="name" class="w-full" (onChange)="onValueLangChange()"></p-select>
                    </div>

                    <div class="col-span-12" *ngIf="selectedLang">
                        <label class="block font-bold mb-1">{{ 'Value_Label' | translate }} ({{ selectedLang.code }})</label>
                        <input pInputText [ngModel]="valueCurrentLabel()" (ngModelChange)="onValueLabelChange($event)" class="w-full" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button [label]="'Cancel' | translate" severity="secondary" [text]="true" (onClick)="valueDialogVisible = false"></p-button>
                <p-button [label]="'Save' | translate" icon="pi pi-check" [loading]="saving()" (onClick)="saveValue()"></p-button>
            </ng-template>
        </p-dialog>
    `
})
export class WpAttributeListComponent implements OnInit {
    protected service = inject(WpAttributeListService);
    protected languageService = inject(LanguageListService);
    private tr = inject(TranslateService);

    selectedType = signal<IWpAttributeType | null>(null);
    saving = signal(false);

    typeDialogVisible = false;
    valueDialogVisible = false;

    editingType: IWpAttributeType = this.emptyType();
    editingValue: IWpAttributeValue = this.emptyValue();

    selectedLang: any = null;
    typeCurrentLabel = signal('');
    valueCurrentLabel = signal('');

    ngOnInit() {
        this.service.loadTypes();
        this.languageService.loadList(0, 1000);
    }

    selectType(type: IWpAttributeType) {
        this.selectedType.set(type);
        this.service.loadValues(type.id!);
    }

    // ── Type dialog ──────────────────────────────────────────────────────────

    openTypeDialog(type?: IWpAttributeType) {
        this.editingType = type ? { ...type, translations: { ...(type.translations || {}) } } : this.emptyType();
        this.selectedLang = this.languageService.items()[0] ?? null;
        this.onTypeLangChange();
        this.typeDialogVisible = true;
    }

    onTypeLangChange() {
        const code = this.selectedLang?.code;
        if (!code) return;
        const val = this.editingType.translations?.[code];
        this.typeCurrentLabel.set(typeof val === 'string' ? val : (val?.label ?? ''));
    }

    onTypeLabelChange(label: string) {
        this.typeCurrentLabel.set(label);
        const code = this.selectedLang?.code;
        if (code) this.editingType.translations[code] = label;
    }

    onTypeSlugInput(val: string) {
        this.editingType.slug = val;
    }

    saveType() {
        this.saving.set(true);
        this.service.saveType(this.editingType).subscribe({
            next: () => {
                this.saving.set(false);
                this.typeDialogVisible = false;
                this.service.loadTypes();
            },
            error: () => this.saving.set(false)
        });
    }

    deleteType(type: IWpAttributeType) {
        if (!confirm(this.tr.instant('Are_you_sure?'))) return;
        this.service.deleteType(type.id!).subscribe(() => {
            if (this.selectedType()?.id === type.id) {
                this.selectedType.set(null);
                this.service.values.set([]);
            }
            this.service.loadTypes();
        });
    }

    // ── Value dialog ─────────────────────────────────────────────────────────

    openValueDialog(val?: IWpAttributeValue) {
        this.editingValue = val ? { ...val, translations: { ...(val.translations || {}) } } : this.emptyValue();
        this.selectedLang = this.languageService.items()[0] ?? null;
        this.onValueLangChange();
        this.valueDialogVisible = true;
    }

    onValueLangChange() {
        const code = this.selectedLang?.code;
        if (!code) return;
        const val = this.editingValue.translations?.[code];
        this.valueCurrentLabel.set(typeof val === 'string' ? val : (val?.label ?? ''));
    }

    onValueLabelChange(label: string) {
        this.valueCurrentLabel.set(label);
        const code = this.selectedLang?.code;
        if (code) this.editingValue.translations[code] = label;
    }

    onValueSlugInput(val: string) {
        this.editingValue.slug = val;
    }

    saveValue() {
        this.saving.set(true);
        this.editingValue.typeId = this.selectedType()!.id!;
        this.service.saveValue(this.editingValue).subscribe({
            next: () => {
                this.saving.set(false);
                this.valueDialogVisible = false;
                this.service.loadValues(this.selectedType()!.id!);
            },
            error: () => this.saving.set(false)
        });
    }

    deleteValue(val: IWpAttributeValue) {
        if (!confirm(this.tr.instant('Are_you_sure?'))) return;
        this.service.deleteValue(val.id!).subscribe(() => {
            this.service.loadValues(this.selectedType()!.id!);
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private emptyType(): IWpAttributeType {
        return { slug: '', multipleValues: false, translations: {} };
    }

    private emptyValue(): IWpAttributeValue {
        return { slug: '', typeId: 0, translations: {} };
    }
}
