import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AdvertisementsDetailService {

    private http = inject(HttpClient);


    public getCampaigns(siteId: number) {
       return this.http.get(`/ads/meta/campaign/${siteId}`);
    }

    public getAdsRecord(data: { id: any, from?: Date, to?: Date }) {
        let params = new HttpParams()
            .set('id', data.id);

        if (data.from) params = params.set('from', data.from.toISOString());
        if (data.to) params = params.set('to', data.to.toISOString());

        return this.http.get(`/ads/meta/campaign/adsrecords`, { params });
    }
}
