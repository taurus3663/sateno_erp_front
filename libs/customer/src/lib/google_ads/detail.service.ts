import { Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IGoogleAds } from './interface';
import { ROUTES } from '../api.routes';


@Injectable({
    providedIn: 'root'
})
export class GoogleAdsDetailService extends BaseDetailCrud<IGoogleAds> {
    override saveRoute: string = ROUTES.googleAds.save;
    override getRoute: string = ROUTES.googleAds.get;
    override deleteRoute: string = ROUTES.googleAds.delete;

    constructor() {
        super();
    }
}
