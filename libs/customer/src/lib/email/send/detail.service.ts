import { Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { ROUTES } from '../../api.routes';
import { IEmailSend } from './interfaces';

@Injectable({ providedIn: 'root' })
export class EmailSendDetailService extends BaseDetailCrud<IEmailSend> {
    override saveRoute: string = ROUTES.email.sent_list_save;
    override getRoute: string = ROUTES.email.sent_list;
    override deleteRoute: string = ROUTES.email.sent_list_delete;

    constructor() {
        super();
    }
}
