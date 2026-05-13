import { Injectable } from '@angular/core';
import { BaseListCrud } from 'xl-util';
import { ROUTES } from '../api.routes';
import { IProductMenuOrder } from './interface';

@Injectable({
    providedIn: 'root'
})
export class ProductMenuOrderListService extends BaseListCrud<IProductMenuOrder> {
    override listRoute: string = ROUTES.wpProductOrder.list;

    constructor() {
        super();
    }

    updateList(payload: any) {
        this.http.post(`${ROUTES.wpProductOrder.save}`, payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: this.tr.instant("Updated")});
            },
            error: () => {
                // Връщаме старата стойност при грешка, ако е необходимо
            }
        })
    }

}
