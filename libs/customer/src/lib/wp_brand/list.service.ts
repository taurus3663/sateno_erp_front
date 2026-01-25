import { inject, Injectable } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { IWpBrand } from './interfaces';
import {ROUTES} from '../api.routes';
import { WpBrandDetailService } from './detail.service';


@Injectable({
    providedIn: 'root'
})
export class WpBrandListService extends BaseListCrud<IWpBrand> {
    listRoute = ROUTES.wp_brand.list;

    constructor() {
        super(inject(WpBrandDetailService) as any);
    }
}
