import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IWpProduct } from '../wp_product/interfaces';
import { ROUTES } from '../api.routes';


@Injectable({ providedIn: 'root' })
export class SchemeWpProductDetailService extends BaseDetailCrud<IWpProduct> {
    override saveRoute: string = ROUTES.schemeWpproduct.save;
    override getRoute: string = ROUTES.schemeWpproduct.get;
    override deleteRoute: string = ROUTES.schemeWpproduct.delete;

    constructor() {
        super();
    }



}
