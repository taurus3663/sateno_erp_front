import { Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { ICourier } from './interfaces';
import { ROUTES } from '../api.routes';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CourierDetailService extends BaseDetailCrud<ICourier> {
    override saveRoute: string = ROUTES.courier.save;
    override getRoute: string = ROUTES.courier.get;
    override deleteRoute: string = ROUTES.courier.delete;

    constructor() {
        super();
    }

    testCourier(item: ICourier): Observable<any> {
        // Пътят до твоя нов контролер
        return this.http.post(ROUTES.courier.test_connection, item);
    }
}
