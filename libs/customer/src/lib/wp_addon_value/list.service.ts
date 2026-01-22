import { inject, Injectable } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { IWpAddonValue, IWpAddonValueTranslation } from './interfaces';
import {ROUTES} from '../api.routes';
import {WpAddonDetailService} from './detail.service';


@Injectable({
    providedIn: 'root'
})
export class WpAddonListService extends BaseListCrud<IWpAddonValue> {
    listRoute = ROUTES.site.list;

    constructor() {
        super(inject(WpAddonDetailService));
    }
}
