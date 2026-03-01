import { Component, inject } from '@angular/core';
import { EmailSendDetailService } from './detail.service';
import { Dialog } from 'primeng/dialog';

@Component({
    selector: 'email-send-detail',
    standalone: true,
    imports: [Dialog],
    template: `
        <p-dialog
            [breakpoints]="{ '1199px': '85vw', '575px': '95vw' }"
            [visible]="detailService.isVisible()"
            (visibleChange)="detailService.closeDetail()"
            [modal]="true"
            [style]="{ width: '900px' }"
            [contentStyle]="{ 'min-height': '450px', 'max-height': '600px' }"
        >
        </p-dialog>
    `
})
export class EmailSendDetailComponent {
    protected detailService = inject(EmailSendDetailService);

    constructor() {}
}
