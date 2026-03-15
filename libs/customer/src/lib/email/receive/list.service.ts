import { inject, Injectable } from '@angular/core';
import { BaseListCrud } from 'xl-util';
import { IEmailReceive } from './interfaces';
import { ROUTES } from '../../api.routes';
import { EmailReceiveDetailService } from './detail.service';

@Injectable({providedIn: 'root'})
export class EmailReceiveListService extends BaseListCrud<IEmailReceive> {
    listRoute = ROUTES.email.receive_list;

    constructor() {
        super(inject(EmailReceiveDetailService));
    }
}
