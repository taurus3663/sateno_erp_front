import { inject, Injectable } from '@angular/core';
import { BaseListCrud } from 'xl-util';
import { ISchemeWpProduct } from './interfaces';
import {ROUTES} from '../api.routes';
import { SchemeWpProductDetailService } from './detail.service';


@Injectable({
    providedIn: 'root'
})
export class SchemeWpProductListService extends BaseListCrud<ISchemeWpProduct> {
    listRoute = ROUTES.schemeWpproduct.list;

    constructor() {
        super(inject(SchemeWpProductDetailService) as any);
    }
}
