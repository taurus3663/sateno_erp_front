import { inject, Injectable } from '@angular/core';
import { BaseListCrud } from 'xl-util';
import { ICourier } from './interfaces';
import { ROUTES } from '../api.routes';
import { CourierDetailService } from './detail.service';


@Injectable({
    providedIn: 'root',
})
export class CourierListService extends BaseListCrud<ICourier> {
    listRoute = ROUTES.courier.list;

    constructor() {
        super(inject(CourierDetailService));
    }
}
