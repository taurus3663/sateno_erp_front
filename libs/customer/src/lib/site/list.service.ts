import { inject, Injectable } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { ISite } from './interfaces';
import {ROUTES} from '../api.routes';
import {SiteDetailService} from './detail.service';


@Injectable({
    providedIn: 'root'
})
export class SiteListService extends BaseListCrud<ISite> {
    listRoute = ROUTES.site.list;

    constructor() {
        super(inject(SiteDetailService));
    }
}
