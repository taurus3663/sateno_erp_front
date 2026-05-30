import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AdvertisementsDetailService {

    private http = inject(HttpClient);


    public getCampaigns(siteId: number) {
       return this.http.get(`/ads/meta/campaign/${siteId}`);
    }
}
