import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { ISite } from './interfaces';
import { ROUTES } from '../api.routes';


@Injectable({ providedIn: 'root' })
export class SiteDetailService extends BaseDetailCrud<ISite> {
    override saveRoute: string = ROUTES.site.save;
    override getRoute: string = ROUTES.site.get;
    override deleteRoute: string = ROUTES.site.delete;

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
