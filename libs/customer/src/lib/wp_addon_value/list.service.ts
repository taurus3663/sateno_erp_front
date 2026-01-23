import { inject, Injectable } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { IWpAddonValue, IWpAddonValueTranslation } from './interfaces';
import {ROUTES} from '../api.routes';
import {WpAddonValueDetailService} from './detail.service';


@Injectable({
    providedIn: 'root'
})
export class WpAddonValueListService extends BaseListCrud<IWpAddonValue> {
    listRoute = ROUTES.wp_addon_value.list;

    constructor() {
        super(inject(WpAddonValueDetailService));
    }
}
