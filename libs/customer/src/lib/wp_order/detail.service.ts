import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IOrder } from './interfaces';
import { ROUTES } from '../api.routes';


@Injectable({ providedIn: 'root' })
export class OrderDetailService extends BaseDetailCrud<IOrder> {
    override saveRoute: string = ROUTES.wp_order.save;
    override getRoute: string = ROUTES.wp_order.get;
    override deleteRoute: string = ROUTES.wp_order.delete;

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
