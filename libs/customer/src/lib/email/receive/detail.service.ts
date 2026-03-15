import { Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { ROUTES } from '../../api.routes';
import { IEmailReceive } from './interfaces';

@Injectable({ providedIn: 'root' })
export class EmailReceiveDetailService extends BaseDetailCrud<IEmailReceive> {
    override saveRoute: string = ROUTES.email.receive_list_save;
    override getRoute: string = ROUTES.email.receive_list;
    override deleteRoute: string = ROUTES.email.receive_list_delete;

    constructor() {
        super();
    }
}
