import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { ICurrency } from './interfaces';
import { ROUTES } from '../api.routes';

@Injectable({ providedIn: 'root' })
export class CurrencyDetailService extends BaseDetailCrud<ICurrency> {
    override saveRoute: string = ROUTES.currency.save;
    override getRoute: string = ROUTES.currency.get;
    override deleteRoute: string = ROUTES.currency.delete;

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
