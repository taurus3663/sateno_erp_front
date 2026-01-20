import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IWpCategory } from './interfaces';
import { ROUTES } from '../api.routes';
import { Observable, tap } from 'rxjs';


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


    // 1. Метод за взимане на името на конкретен език
    getTranslation(categoryId: number, languageId: number): Observable<string> {
        return this.http.get(ROUTES.wp_category.getTranslation, {
            params: { categoryId, languageId },
            responseType: 'text' // Важно: казваме, че очакваме чист текст (името)
        });
    }

    // 2. Метод за запис/обновяване на превода
    saveTranslation(categoryId: number, languageId: number, name: string): Observable<any> {
        this.isSaving.set(true);
        // Използваме обекта, който Java очаква (Upsert логика)
        return this.http.post(ROUTES.wp_category.updateTranslation, {
            categoryId,
            languageId,
            name
        }).pipe(
            tap(() => this.isSaving.set(false))
        );
    }
}
