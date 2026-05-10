import { Injectable } from '@angular/core';
import { BaseListCrud } from 'xl-util';
import { IWpProductHistory } from './interface';
import { ROUTES } from '../api.routes';


@Injectable({
    providedIn: 'root'
})
export class WpProductHistoryListService extends BaseListCrud<IWpProductHistory> {
    override listRoute: string = ROUTES.productHistory.list;

    constructor() {
        super();
    }
}
