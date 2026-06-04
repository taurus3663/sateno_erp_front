import { Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IGoogleAds } from './interface';
import { ROUTES } from '../api.routes';
import { Observable } from 'rxjs';


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

    getGoogleAuthUrl(id: number): Observable<string> {
        // Извикваш функцията от ROUTES и подаваш ID-то
        const url = ROUTES.googleAds.generateToken(id);
        return this.http.post(url, {}, { responseType: 'text' });
    }
}
