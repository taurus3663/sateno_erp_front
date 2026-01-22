import { inject, Injectable } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { IWpAddon } from './interfaces';
import {ROUTES} from '../api.routes';
import {WpAddonDetailService} from './detail.service';


@Injectable({
    providedIn: 'root'
})
export class WpAddonListService extends BaseListCrud<IWpAddon> {
    listRoute = ROUTES.wp_addon.list;

    constructor() {
        super(inject(WpAddonDetailService));
    }
}
