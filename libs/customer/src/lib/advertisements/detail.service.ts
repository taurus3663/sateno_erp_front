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

    public getAdsRecord(data: { ids: any, from?: string, to?: string, timeZone: string }) {
        let params = new HttpParams()
            .set('ids', data.ids)
            .set('timeZone', data.timeZone);

        if (data.from) params = params.set('from', data.from);
        if (data.to) params = params.set('to', data.to);

        return this.http.get(`/ads/meta/campaign/adsrecords`, { params });
    }
}
