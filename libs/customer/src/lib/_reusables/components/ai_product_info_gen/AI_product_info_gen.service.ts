import { inject, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IAIProductInfoGen } from './interfaces';
import { ROUTES } from '../../../api.routes';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WpProductDetailService } from '../../../wp_product/detail.service';

@Injectable({
    providedIn: 'root'
})
export class AIProductInfoGenService {
    private http = inject(HttpClient);
    private wpProductDetailService = inject(WpProductDetailService);

    generateContent(payload: IAIProductInfoGen): Observable<IAIProductInfoGen> {

        // const payload2 = {
        //         schemeId: payload.schemeId,
        //         step: payload.step,
        //         tempImages: this.wpProductDetailService.selectedItem()?.images,
        //         refinement: payload.refinement,
        //         productInfo: this.wpProductDetailService.selectedItem(),
        // };

        const clonedItem = structuredClone(this.wpProductDetailService.selectedItem()!);
        clonedItem.translations = [];
        clonedItem.addonConfigs = [];
        payload.tempImages = this.wpProductDetailService.selectedItem()?.images?? [];
        payload.productInfo = clonedItem;


        return this.http.post<IAIProductInfoGen>(`${ROUTES.wp_product.ai_gen}`, payload);
    }
}
