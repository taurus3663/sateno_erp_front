import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ROUTES } from '../api.routes';
import { IWpAttributeType, IWpAttributeValue } from './interfaces';

@Injectable({ providedIn: 'root' })
export class WpAttributeListService {
    private http = inject(HttpClient);

    types = signal<IWpAttributeType[]>([]);
    values = signal<IWpAttributeValue[]>([]);
    loading = signal(false);

    loadTypes() {
        this.loading.set(true);
        this.http.get<IWpAttributeType[]>(ROUTES.wp_attribute.type_list).subscribe({
            next: data => { this.types.set(data); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    loadValues(typeId: number) {
        this.http.get<IWpAttributeValue[]>(ROUTES.wp_attribute.value_by_type(typeId)).subscribe(
            data => this.values.set(data)
        );
    }

    saveType(dto: IWpAttributeType) {
        return this.http.post<number>(ROUTES.wp_attribute.type_save, dto);
    }

    deleteType(id: number) {
        return this.http.delete(ROUTES.wp_attribute.type_delete(id));
    }

    saveValue(dto: IWpAttributeValue) {
        return this.http.post<number>(ROUTES.wp_attribute.value_save, dto);
    }

    deleteValue(id: number) {
        return this.http.delete(ROUTES.wp_attribute.value_delete(id));
    }

    loadTypesWithValues() {
        return this.http.get<IWpAttributeType[]>(ROUTES.wp_attribute.type_list_with_values);
    }
}
