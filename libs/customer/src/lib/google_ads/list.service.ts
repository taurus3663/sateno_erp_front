import { Injectable } from '@angular/core';
import { BaseListCrud } from 'xl-util';
import { IGoogleAds } from './interface';
import { ROUTES } from '../api.routes';


@Injectable({
    providedIn: 'root'
})
export class GoogleAdsListService extends BaseListCrud<IGoogleAds> {
    override listRoute: string = ROUTES.googleAds.list;

    constructor() {
        super();
    }

}
