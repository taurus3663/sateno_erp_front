import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IWpAddonValue } from './interfaces';
import { ROUTES } from '../api.routes';


@Injectable({ providedIn: 'root' })
export class WpAddonDetailService extends BaseDetailCrud<IWpAddonValue> {
    override saveRoute: string = ROUTES.wp_addon.save;
    override getRoute: string = ROUTES.wp_addon.get;
    override deleteRoute: string = ROUTES.wp_addon.delete;

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
