import { inject, Injectable } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { IOrder } from './interfaces';
import {ROUTES} from '../api.routes';
import {OrderDetailService} from './detail.service';


@Injectable({
    providedIn: 'root'
})
export class OrderListService extends BaseListCrud<IOrder> {
    listRoute = ROUTES.wp_order.list;

    constructor() {
        super(inject(OrderDetailService));
    }

    public syncBrands(siteId: any) {
        this.loading.set(true);
        this.http.post(`${ROUTES.wp_order.sync}/${siteId}`, {})
            .subscribe({
                next: (res) => {
                    this.loadList(0, 10);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                }
            });
    }
}
