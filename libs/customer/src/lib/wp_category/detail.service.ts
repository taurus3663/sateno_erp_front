import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IWpCategory } from './interfaces';
import { ROUTES } from '../api.routes';


@Injectable({ providedIn: 'root' })
export class WpCategoryDetailService extends BaseDetailCrud<IWpCategory> {
    override saveRoute: string = ROUTES.wp_category.save;
    override getRoute: string = ROUTES.wp_category.get;
    override deleteRoute: string = ROUTES.wp_category.delete;

    constructor() {
        super();

        effect(() => {
            const data = this.selectionService.selectedItem();
            if(data && this.isVisible()) {
                this.selected(data);
            }
        });
    }

    private selected(data: any) {
        const current = this.selectedItem(); // Вземаме текущия сигнал
        if (current) {
            this.selectedItem.set({
                ...current,
            });
        }
    }
}
