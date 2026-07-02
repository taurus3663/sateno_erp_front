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

    public getAdsRecord(data: { ids: any; from?: string; to?: string; timeZone: string }) {
        let params = new HttpParams().set('ids', data.ids).set('timeZone', data.timeZone);

        if (data.from) params = params.set('from', data.from);
        if (data.to) params = params.set('to', data.to);

        return this.http.get(`/ads/meta/campaign/adsrecords`, { params });
    }

    public getGoogleCampaigns(siteId: number) {
        return this.http.get(`/ads/google/campaign/${siteId}`);
    }

    public getGoogleAdsRecord(data: { ids: any; from?: string; to?: string; timeZone: string }) {
        let params = new HttpParams().set('ids', data.ids).set('timeZone', data.timeZone);

        if (data.from) params = params.set('from', data.from);
        if (data.to) params = params.set('to', data.to);

        return this.http.get(`/ads/google/campaign/adsrecords`, { params });
    }

    public resyncMeta() {
        return this.http.post(`/ads/meta/resync`, {}, { responseType: 'text' });
    }

    public resyncGoogle() {
        return this.http.post(`/ads/google/resync`, {}, { responseType: 'text' });
    }

    public backfillMeta() {
        return this.http.post(`/ads/meta/backfill`, {}, { responseType: 'text' });
    }

    public backfillGoogle() {
        return this.http.post(`/ads/google/backfill`, {}, { responseType: 'text' });
    }
}
