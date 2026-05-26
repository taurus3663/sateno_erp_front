import { Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IMetaAds } from './interface';
import { ROUTES } from '../api.routes';


@Injectable({
    providedIn: 'root'
})
export class MetaAdsDetailService extends BaseDetailCrud<IMetaAds> {
    override saveRoute: string = ROUTES.metaAds.save;
    override getRoute: string = ROUTES.metaAds.get;
    override deleteRoute: string = ROUTES.metaAds.delete;

    constructor() {
        super();
    }

}
