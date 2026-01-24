import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IWpAddon, IWpAddonDetailDto } from './interfaces';
import { ROUTES } from '../api.routes';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class WpAddonDetailService extends BaseDetailCrud<IWpAddon> {
    override saveRoute: string = ROUTES.wp_addon.save;
    override getRoute: string = ROUTES.wp_addon.get;
    override deleteRoute: string = ROUTES.wp_addon.delete;

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

    /**
     * Взима конкретен превод за името на групата
     */
    getTranslation(addonId: number, langId: number): Observable<string> {
        return this.http.get(`${ROUTES.wp_addon.get_translation}`, {
            params: { addonId, langId },
            responseType: 'text'
        });
    }

    /**
     * Записва/Обновява превод за името на групата
     */
    saveTranslation(addonId: number, langId: number, name: string): Observable<any> {
        return this.http.post(ROUTES.wp_addon.save_translation, {
            addonId,
            langId,
            name
        });
    }

    /**
     * Записва нова стойност в справочника (през диалога за бързо добавяне)
     */
    quickSaveValue(value: any): Observable<any> {
        return this.http.post(ROUTES.wp_addon.save_value, value);
    }

    /**
     * Взима абсолютно всички съществуващи стойности от справочника (за нов аддон)
     * Очаква Java: GET /wp_addon/values/all
     */
    getAllAvailableValues(): Observable<any[]> {
        return this.http.get<any[]>(`${ROUTES.wp_addon.values_all}`);
    }

    // В WpAddonDetailService
    override saveItem(payload: any): Observable<any> {
        // Тук използваш чистия HttpClient
        return this.http.post(this.saveRoute, payload);
    }

    getAddonSelectedValues(id: any): Observable<IWpAddonDetailDto> {
        return this.http.get<IWpAddonDetailDto>(`${ROUTES.wp_addon.get_selected_values}/${id}`);
    }
}
