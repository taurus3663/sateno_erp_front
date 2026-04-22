import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SchemeWpProductListService } from '../../../wp_product_scheme/list.service';
import { Button } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Textarea } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { ProgressBar } from 'primeng/progressbar';
import { WpProductDetailService } from '../../../wp_product/detail.service';
import { AIProductInfoGenService } from './AI_product_info_gen.service';
import { IAIProductInfoGen } from './interfaces';
import { SchemeWpProductDetailService } from '../../../wp_product_scheme/detail.service';
import { SchemeWpProductDetailComponent } from '../../../wp_product_scheme/detail';

@Component({
    selector: 'ai_product_info_gen',
    standalone: true,
    imports: [CommonModule, Button, TranslatePipe, Textarea, FormsModule, Select, ProgressBar, SchemeWpProductDetailComponent],
    template: `
        <div class="flex flex-col h-full overflow-hidden" style="max-height: 85vh;">
            <div class="mb-4 flex-shrink-0">
                <div class="flex justify-between mb-2 text-sm font-bold text-primary">
                    <span>{{ stepTitle | translate }}</span>
                    <span>{{ currentStep() + 1 }} / 4</span>
                </div>
                <p-progressBar [value]="(currentStep() + 1) * 25" [showValue]="false" styleClass="h-2"></p-progressBar>
            </div>

            <div class="flex-grow overflow-y-auto pr-2 custom-scroll" style="min-height: 300px;">

                <div *ngIf="currentStep() === 0" class="flex flex-col gap-3">
                    <label class="font-bold text-900">{{ 'Choose_AI_Instruction_Template' | translate }}</label>
                    <p-select [options]="schemeService.items()" [(ngModel)]="selectedScheme" optionLabel="name" [filter]="true" class="w-full" placeholder="---"> </p-select>
                    <div *ngIf="selectedScheme()" class="animate-fade-in">
                        <div class="p-3 bg-blue-50 border-round border-left-3 border-blue-500 italic text-sm mb-2">
                            {{ selectedScheme().instruction }}
                        </div>

                        <div class="flex justify-end">
                            <p-button
                                [label]="('Edit' | translate) + ' ' + ('Scheme' | translate)"
                                icon="pi pi-pencil"
                                [text]="true"
                                size="small"
                                severity="primary"
                                (onClick)="openSchemeDetail()">
                            </p-button>
                        </div>
                    </div>
                </div>

                <div *ngIf="currentStep() > 0" class="flex flex-col h-full">
                    <div class="flex-grow p-4 border-round bg-surface-50 border-1 border-surface-200 mb-4 overflow-y-auto relative shadow-inner"
                         style="max-height: 400px; min-height: 250px;">

                        <div *ngIf="isGenerating()" class="flex flex-col items-center justify-center h-full gap-3 py-8">
                            <i class="pi pi-android pi-spin text-4xl text-primary"></i>
                            <span class="text-gray-500 italic">{{ 'AI_is_thinking' | translate }}...</span>
                        </div>

                        <div *ngIf="!isGenerating()" class="text-900 line-height-3" style="white-space: pre-wrap;">
                            <i class="pi pi-android mr-2 text-primary font-bold"></i>
                            {{ aiResponse() }}
                        </div>
                    </div>

                    <div class="flex-shrink-0">
                        <div class="flex gap-2 justify-center mb-2" *ngIf="!isGenerating() && !showRefineArea()">
                            <p-button [label]="'Refine' | translate" icon="pi pi-refresh" severity="help" [outlined]="true" (onClick)="showRefineArea.set(true)"></p-button>
                            <p-button [label]="'Apply_&_Next' | translate" icon="pi pi-check" severity="success" (onClick)="applyAndContinue()"></p-button>
                        </div>

                        <div *ngIf="showRefineArea()" class="flex flex-col gap-2 mt-2 p-2 border-round bg-yellow-50 border-1 border-yellow-100 animate-fade-in">
                            <textarea pTextarea [(ngModel)]="userRefinement" rows="3" class="w-full" [placeholder]="'Add_specific_instruction' | translate"></textarea>
                            <div class="flex justify-end gap-2">
                                <p-button [label]="'Cancel' | translate" [text]="true" severity="secondary" (onClick)="showRefineArea.set(false)"></p-button>
                                <p-button [label]="'Send' | translate" icon="pi pi-send" (onClick)="generateAI()"></p-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-between border-t pt-4 mt-4 flex-shrink-0 bg-white">
                <p-button [label]="'Cancel' | translate" severity="danger" [text]="true" (onClick)="ref.close()"></p-button>
                <p-button [label]="'Back' | translate" icon="pi pi-chevron-left" [text]="true" (onClick)="currentStep.set(currentStep() - 1)" *ngIf="currentStep() > 0"></p-button>
                <div class="flex-grow"></div>
                <p-button [label]="'Next' | translate" icon="pi pi-chevron-right" iconPos="right" (onClick)="next()" *ngIf="currentStep() === 0" [disabled]="!selectedScheme()"></p-button>
            </div>
        </div>

        <scheme_wp_product-detail></scheme_wp_product-detail>
    `
})
export class AIProductInfoGenComponent {
    // Инжектиране на услугите за диалога
    public ref = inject(DynamicDialogRef);
    public config = inject(DynamicDialogConfig);
    protected schemeService = inject(SchemeWpProductListService);
    private aiProductDetailService = inject(AIProductInfoGenService);

    // Състояния
    currentStep = signal(0); // 0: Шаблон, 1: Име, 2: Кратко, 3: Описание
    selectedScheme = signal<any>(null);
    aiResponse = signal('');
    isGenerating = signal(false);

    // За малкия прозорец/секция за уточнение
    showRefineArea = signal(false);
    userRefinement = signal('');

    protected schemeDetailService = inject(SchemeWpProductDetailService); // Добавете това

    private generatedTexts: { [key: number]: string } = {};

    constructor() {
        // Зареждаме шаблоните (указанията) при старт
        this.schemeService.loadList(0, 1000);
    }

    get stepTitle(): string {
        const steps = ['Select_scheme', 'Product_Name', 'Short_Description', 'Description'];
        return steps[this.currentStep()];
    }

    next() {
        if (this.currentStep() < 3) {
            this.currentStep.update((s) => s + 1);
            this.generateAI();
        } else {
            this.ref.close(this.generatedTexts);
        }
    }

    generateAI() {
        this.isGenerating.set(true);
        this.aiResponse.set('');

        const payload: IAIProductInfoGen = {
            schemeId: this.selectedScheme().id,
            step: this.currentStep(),
            refinement: this.userRefinement(),
            previousTexts: this.generatedTexts
        };

        this.aiProductDetailService.generateContent(payload).subscribe((value) => {
            this.aiResponse.set(value.responseAI!);
            this.isGenerating.set(false);
            this.showRefineArea.set(false);
            this.userRefinement.set('');
        });
    }

    applyAndContinue() {
        if (this.aiResponse()) {
            // Запаметяваме текста за текущата стъпка
            this.generatedTexts[this.currentStep()] = this.aiResponse();
        }
        this.next();
    }

    openSchemeDetail() {
        const selected = this.selectedScheme();
        if (selected) {
            this.schemeDetailService.openEditDialog(selected);
            // this.schemeDetailService.openDetail(selected);
        }
    }
}
