import { inject, Injectable } from '@angular/core';
import { BaseListCrud } from 'xl-util';
import { IEmailSend } from './interfaces';
import { ROUTES } from '../../api.routes';
import { EmailSendDetailService } from './detail.service';

@Injectable({providedIn: 'root'})
export class EmailSendListService extends BaseListCrud<IEmailSend> {
    listRoute = ROUTES.emailSend.list;

    constructor() {
        super(inject(EmailSendDetailService));
    }
}
