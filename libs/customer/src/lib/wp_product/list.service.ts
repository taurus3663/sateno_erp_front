import { inject, Injectable } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { IWpProduct } from './interfaces';
import {ROUTES} from '../api.routes';
import { WpProductDetailService } from './detail.service';


@Injectable({
    providedIn: 'root'
})
export class WpProductListService extends BaseListCrud<IWpProduct> {
    listRoute = ROUTES.wp_product.list;

    constructor() {
        super(inject(WpProductDetailService) as any);
    }

    public syncBrands(siteId: any) {
        console.log(siteId);
        this.http.post(`${ROUTES.wp_product.sync}/${siteId}`, {})
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
