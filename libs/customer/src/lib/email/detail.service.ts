import { Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IEmail } from './interfaces';
import { ROUTES } from '../api.routes';

@Injectable({providedIn: 'root'})
export class EmailDetailService extends BaseDetailCrud<IEmail> {
    override saveRoute: string = ROUTES.email.save;
    override getRoute: string = ROUTES.email.get;
    override deleteRoute: string = ROUTES.email.delete;

    constructor() {
        super();
    }


}
