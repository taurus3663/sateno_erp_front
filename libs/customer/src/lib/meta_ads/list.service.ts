import { Injectable } from '@angular/core';
import { BaseListCrud } from 'xl-util';
import { IMetaAds } from './interface';
import { ROUTES } from '../api.routes';


@Injectable({
    providedIn: 'root',
})
export class MetaAdsListService extends BaseListCrud<IMetaAds> {
    override listRoute: string = ROUTES.metaAds.list;

    constructor() {
        super();
    }

}
