import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { ICustomer } from './interfaces';
import { ROUTES } from '../api.routes';


@Injectable({ providedIn: 'root' })
export class DetailService extends BaseDetailCrud<ICustomer> {
    override saveRoute: string = ROUTES.customer.save;
    override getRoute: string = ROUTES.customer.get;
    override deleteRoute: string = ROUTES.customer.delete;

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
