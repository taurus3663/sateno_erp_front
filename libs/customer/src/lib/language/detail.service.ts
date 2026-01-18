import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { ILanguage } from './interfaces';
import { ROUTES } from '../api.routes';


@Injectable({ providedIn: 'root' })
export class LanguageDetailService extends BaseDetailCrud<ILanguage> {
    override saveRoute: string = ROUTES.language.save;
    override getRoute: string = ROUTES.language.get;
    override deleteRoute: string = ROUTES.language.delete;

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
