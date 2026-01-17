import { inject, Injectable } from '@angular/core';
import { BaseListCrud, ICrudDetailService } from 'xl-util';
import { ICurrency } from './interfaces';
import { ROUTES } from '../api.routes';
import { CurrencyDetailService } from './detail.service';

@Injectable({
    providedIn: 'root'
})
export class CurrencyListService extends BaseListCrud<ICurrency> {
    override listRoute: string = ROUTES.currency.list;


    constructor() {
        super(inject(CurrencyDetailService))
    }
}
