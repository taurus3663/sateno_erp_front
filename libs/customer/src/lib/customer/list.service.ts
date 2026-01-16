import { inject, Injectable } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { ICustomer } from './interfaces';
import {ROUTES} from '../api.routes';
import {DetailService} from './detail.service';


@Injectable({
    providedIn: 'root'
})
export class CustomerListService extends BaseListCrud<ICustomer> {
    listRoute = ROUTES.customer.list;

    constructor() {
        super(inject(DetailService));
    }
}
