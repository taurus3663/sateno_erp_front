import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IWpBrand } from './interfaces';
import { ROUTES } from '../api.routes';


@Injectable({ providedIn: 'root' })
export class WpBrandDetailService extends BaseDetailCrud<IWpBrand> {
    override saveRoute: string = ROUTES.wp_brand.save;
    override getRoute: string = ROUTES.wp_brand.get;
    override deleteRoute: string = ROUTES.wp_brand.delete;

    constructor() {
        super();

        effect(() => {
            const data = this.selectionService.selectedItem();
            if (data && this.isVisible()) {
                this.selected(data);
            }
        });
    }

    private selected(data: any) {
        const current = this.selectedItem(); // Вземаме текущия сигнал
        if (current) {
            this.selectedItem.set({
                ...current
            });
        }
    }




}
