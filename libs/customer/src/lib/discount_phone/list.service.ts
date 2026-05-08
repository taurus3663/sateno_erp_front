import { Injectable } from '@angular/core';
import { BaseListCrud } from 'xl-util';
import { IDiscountPhone } from './interfaces';
import {ROUTES} from '../api.routes';

@Injectable({
    providedIn: 'root'
})
export class DiscountPhoneListService extends BaseListCrud<IDiscountPhone> {
    override listRoute: string = ROUTES.discountPhone.list;

    constructor() {
        super(undefined);
    }
}
