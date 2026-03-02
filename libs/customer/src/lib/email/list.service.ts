import { inject, Injectable } from '@angular/core';
import { BaseListCrud } from 'xl-util';
import { IEmail } from './interfaces';
import { ROUTES } from '../api.routes';
import { EmailDetailService } from './detail.service';

@Injectable({providedIn: 'root'})
export class EmailListService extends BaseListCrud<IEmail>{
    listRoute = ROUTES.email.list;


    constructor() {
        super(inject(EmailDetailService));
    }

}
