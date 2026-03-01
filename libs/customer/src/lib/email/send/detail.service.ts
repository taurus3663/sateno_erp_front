import { Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { ROUTES } from '../../api.routes';
import { IEmailSend } from './interfaces';

@Injectable({ providedIn: 'root' })
export class EmailSendDetailService extends BaseDetailCrud<IEmailSend> {
    override saveRoute: string = ROUTES.emailSend.save;
    override getRoute: string = ROUTES.emailSend.get;
    override deleteRoute: string = ROUTES.emailSend.delete;

    constructor() {
        super();
    }
}
