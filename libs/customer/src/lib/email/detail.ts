import { Component, inject } from '@angular/core';
import { EmailDetailService } from './detail.service';
import { Dialog } from 'primeng/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { NgIf } from '@angular/common';
import { Checkbox } from 'primeng/checkbox';
import { ToggleButton } from 'primeng/togglebutton';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Textarea } from 'primeng/textarea';
import { Editor } from 'primeng/editor';
import { SelectButton } from 'primeng/selectbutton';
import { EmailType, IEmail } from './interfaces';

@Component({
    selector: 'email-detail',
    standalone: true,
    imports: [Dialog, TranslatePipe, Button, InputText, FormsModule, TabPanel, TabPanels, Tabs, TabList, Tab, NgIf, Checkbox, ToggleSwitch, Editor, SelectButton],
    template: `
        <p-dialog
            [breakpoints]="{ '1199px': '85vw', '575px': '95vw' }"
            [visible]="detailService.isVisible()"
            (visibleChange)="detailService.closeDetail()"
            [modal]="true"
            [style]="{ width: '900px' }"
            [contentStyle]="{ 'min-height': '450px', 'max-height': '600px' }"
        >
            <ng-template #header>
                <div class="w-full text-center">
                    <span class="text-xl font-bold">
                        <i class=" mr-2 text-primary"></i>
                        {{ detailService.selectedItem()?.id ? ('Edit' | translate) + ' ' + ('Email' | translate) + ' #' + detailService.selectedItem()?.id : ('New' | translate) + ' ' + ('Email' | translate) }}
                    </span>
                </div>
            </ng-template>

            <ng-template #content>
                <div class="pt-2" *ngIf="detailService.selectedItem() as item">
                    <div class="grid grid-cols-12 gap-4 mb-4">
                        <div class="col-span-12 md:col-span-8">
                            <label class="block font-bold mb-2">{{ 'Name' | translate }}</label>
                            <input pInputText [(ngModel)]="item.name" class="w-full" [placeholder]="'Name' | translate" />
                        </div>
                        <div class="col-span-12 md:col-span-4 flex align-items-end gap-2 pb-1">
                            <p-checkbox [(ngModel)]="item.active" [binary]="true" inputId="active"></p-checkbox>
                            <label for="active" class="font-bold">{{ 'Active' | translate }}</label>
                        </div>
                    </div>

                    <p-tabs value="0">
                        <p-tablist>
                            <p-tab value="0"><i class="pi pi-send mr-2"></i>{{ 'SMTP_Settings' | translate }}</p-tab>
                            <p-tab value="1"><i class="pi pi-inbox mr-2"></i>{{ 'IMAP_POP3_Settings' | translate }}</p-tab>
                            <p-tab value="2"><i class="pi pi-pencil mr-2"></i>{{ 'Signature' | translate }}</p-tab>
                        </p-tablist>

                        <p-tabpanels>
                            <p-tabpanel value="0">
                                <div class="grid grid-cols-12 gap-4">
                                    <div class="col-span-12 md:col-span-8">
                                        <label class="block font-bold mb-2">{{ 'SMTP_Host' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.hostSmtp" class="w-full" />
                                    </div>
                                    <div class="col-span-12 md:col-span-4">
                                        <label class="block font-bold mb-2">{{ 'Port' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.portSmtp" class="w-full" />
                                    </div>
                                    <div class="col-span-12 md:col-span-6">
                                        <label class="block font-bold mb-2">{{ 'Username' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.usernameSmtp" class="w-full" />
                                    </div>
                                    <div class="col-span-12 md:col-span-6">
                                        <label class="block font-bold mb-2">{{ 'Password' | translate }}</label>
                                        <input pInputText type="password" [(ngModel)]="item.passwordSmtp" class="w-full" />
                                    </div>
                                    <div class="col-span-12 flex align-items-center gap-3 mt-2">
                                        <p-toggle-switch [(ngModel)]="item.sslSmtp" inputId="ssl_smtp"></p-toggle-switch>
                                        <label for="ssl_smtp" class="font-bold cursor-pointer">
                                            {{ (item.sslSmtp ? 'SSL_Enabled' : 'SSL_Disabled') | translate }}
                                        </label>
                                    </div>

                                    <div class="col-span-12 md:col-span-6 flex justify-end align-items-center mt-2">
                                        <p-button
                                            [label]="'Test_Connection' | translate"
                                            icon="pi pi-bolt"
                                            [outlined]="true"
                                            severity="help"
                                            [loading]="detailService.isTestingConnection()"
                                            [disabled]="!item.id"
                                            (onClick)="detailService.testConnection(item.id)"
                                        >
                                        </p-button>
                                    </div>

                                    <div class="col-span-12" *ngIf="!item.id">
                                        <small class="text-secondary italic">* {{ 'Save_before_test' | translate }}</small>
                                    </div>
                                </div>
                            </p-tabpanel>

                            <p-tabpanel value="1">
                                <div class="grid grid-cols-12 gap-4">
                                    <div class="col-span-12 md:col-span-8">
                                        <label class="block font-bold mb-2">{{ 'Incoming_Host' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.host" class="w-full" />
                                    </div>
                                    <div class="col-span-12 md:col-span-4">
                                        <label class="block font-bold mb-2">{{ 'Port' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.port" class="w-full" />
                                    </div>
                                    <div class="col-span-12">
                                        <label class="block font-bold mb-2">{{ 'Username' | translate }}</label>
                                        <input pInputText [(ngModel)]="item.username" class="w-full" />
                                    </div>
                                    <div class="col-span-12">
                                        <label class="block font-bold mb-2">{{ 'Password' | translate }}</label>
                                        <input pInputText type="password" [(ngModel)]="item.password" class="w-full" />
                                    </div>

                                    <div class="col-span-12">
                                        <label class="block font-bold mb-2">{{ 'Protocol_Type' | translate }}</label>
                                        <p-selectButton
                                            [(ngModel)]="item.emailType"
                                            [options]="EmailType"
                                            optionLabel="label"
                                            optionValue="value"
                                        >
                                        </p-selectButton>
                                    </div>

                                    <div class="col-span-12 flex align-items-center gap-3 mt-2">
                                        <p-toggle-switch [(ngModel)]="item.ssl" inputId="ssl"></p-toggle-switch>
                                        <label for="ssl" class="font-bold cursor-pointer">
                                            {{ (item.ssl ? 'SSL_Enabled' : 'SSL_Disabled') | translate }}
                                        </label>
                                    </div>

                                    <div class="col-span-12 flex justify-end mt-4">
                                        <p-button
                                            [label]="'Test_Incoming_Connection' | translate"
                                            icon="pi pi-refresh"
                                            severity="help"
                                            [outlined]="true"
                                            [disabled]="!item.id"
                                            (onClick)="detailService.testIncomingConnection(item.id)">
                                        </p-button>
                                    </div>



                                </div>
                            </p-tabpanel>

                            <p-tabpanel value="2">
                                <label class="block font-bold mb-2">{{ 'Email_Signature' | translate }}</label>
                                <p-editor [(ngModel)]="item.signature" class="w-full" [style]="{ height: '320px' }"> </p-editor>
                            </p-tabpanel>
                        </p-tabpanels>
                    </p-tabs>
                </div>
            </ng-template>
            <ng-template #footer>
                <div class="flex gap-2 justify-end border-t border-surface-200 pt-4">
                    <p-button label="Отказ" severity="secondary" [text]="true" (onClick)="detailService.closeDetail()" />
                    <p-button label="Запис" icon="pi pi-check" [loading]="detailService.isSaving()" (onClick)="detailService.saveItem(detailService.selectedItem()!)" />
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class EmailDetailComponent {
    protected detailService = inject(EmailDetailService);

    constructor() {}

    protected EmailType = [
        { label: 'IMAP', value: 'IMAP' },
        { label: 'POP3', value: 'POP3' }
    ];
}
