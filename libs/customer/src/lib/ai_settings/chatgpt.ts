import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { ProgressSpinner } from 'primeng/progressspinner';
import { NgIf } from '@angular/common';
import { ChatGptSettingsService } from './chatgpt.service';

@Component({
    selector: 'app-chatgpt-settings',
    standalone: true,
    imports: [FormsModule, CardModule, InputText, Button, Select, InputNumber, ProgressSpinner, NgIf],
    template: `
        <div class="p-4 max-w-2xl mx-auto">
            <p-card>
                <ng-template pTemplate="header">
                    <div class="flex align-items-center gap-3 p-4 border-b border-surface-200">
                        <i class="pi pi-sparkles text-2xl text-primary"></i>
                        <span class="text-xl font-bold">ChatGPT Настройки</span>
                    </div>
                </ng-template>

                <ng-template pTemplate="content">
                    <div *ngIf="service.isLoading(); else formTpl" class="flex justify-center py-8">
                        <p-progress-spinner strokeWidth="4" styleClass="w-12 h-12" />
                    </div>

                    <ng-template #formTpl>
                        <div class="grid grid-cols-12 gap-5 py-2">

                            <div class="col-span-12">
                                <label class="block font-bold mb-2 text-sm text-surface-600">API Key</label>
                                <input
                                    pInputText
                                    type="password"
                                    class="w-full"
                                    placeholder="sk-proj-..."
                                    [ngModel]="service.config()['apiKey']"
                                    (ngModelChange)="updateConfig('apiKey', $event)"
                                />
                            </div>

                            <div class="col-span-12 md:col-span-6">
                                <label class="block font-bold mb-2 text-sm text-surface-600">Модел</label>
                                <p-select
                                    [options]="modelOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="w-full"
                                    [ngModel]="service.config()['model']"
                                    (ngModelChange)="updateConfig('model', $event)"
                                />
                            </div>

                            <div class="col-span-12 md:col-span-6">
                                <label class="block font-bold mb-2 text-sm text-surface-600">Температура (0 – 2)</label>
                                <p-inputNumber
                                    class="w-full"
                                    [min]="0"
                                    [max]="2"
                                    [step]="0.1"
                                    [minFractionDigits]="1"
                                    [maxFractionDigits]="2"
                                    [ngModel]="tempAsNumber()"
                                    (ngModelChange)="updateConfig('temperature', $event?.toString() ?? '1.0')"
                                />
                            </div>

                        </div>
                    </ng-template>
                </ng-template>

                <ng-template pTemplate="footer">
                    <div class="flex justify-end pt-2">
                        <p-button
                            label="Запис"
                            icon="pi pi-check"
                            [loading]="service.isSaving()"
                            [disabled]="service.isLoading()"
                            (onClick)="service.save()"
                        />
                    </div>
                </ng-template>
            </p-card>
        </div>
    `
})
export class ChatGptSettingsComponent implements OnInit {
    protected service = inject(ChatGptSettingsService);

    protected modelOptions = [
        { label: 'GPT-4o', value: 'gpt-4o' },
        { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
        { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
    ];

    ngOnInit() {
        this.service.load();
    }

    protected tempAsNumber(): number {
        return parseFloat(this.service.config()['temperature'] ?? '1.0');
    }

    protected updateConfig(key: string, value: string) {
        this.service.config.update(cfg => ({ ...cfg, [key]: value }));
    }
}
