import { inject, Injectable, signal } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { IWpProduct } from './interfaces';
import {ROUTES} from '../api.routes';
import { WpProductDetailService } from './detail.service';
import { map, Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { sanitizeWrapperScript } from 'nx/src/command-line/init/implementation/dot-nx/add-nx-scripts';
import { XL_AUTH_CONFIG } from 'xl-auth';


@Injectable({
    providedIn: 'root'
})
export class WpProductListService extends BaseListCrud<IWpProduct> {
    listRoute = ROUTES.wp_product.list;

    private authConfig = inject(XL_AUTH_CONFIG);
    protected readonly baseUrl = this.authConfig.apiUrl;

    constructor() {
        super(inject(WpProductDetailService) as any);
    }

    public syncBrands(siteId: any) {
        this.loading.set(true);
        this.http.post(`${ROUTES.wp_product.sync}/${siteId}`, {}).subscribe({
            next: (res) => {
                this.loadList(0, 10);
                this.loading.set(false);
            },
            error: (err) => {
                this.loading.set(false);
            }
        });
    }

    // Инжектираме Sanitizer-а
    private sanitizer = inject(DomSanitizer);
    // В компонента или сервиза
    // Правилната функция за взимане на защитена снимка
    public getSafeImage(path: string): Observable<SafeUrl> {
        const fullUrl = `${this.baseUrl}/${path}`; // Пълният път до Spring

        return this.http.get(fullUrl, { responseType: 'blob' }).pipe(
            map((blob: Blob) => {
                const objectURL = URL.createObjectURL(blob);
                // Използваме инжектирания sanitizer
                return this.sanitizer.bypassSecurityTrustUrl(objectURL);
            })
        );
    }

    updateProductField(item: IWpProduct) {
        // Тук викаш API-то за частичен ъпдейт (PATCH)
        this.http.patch(`${ROUTES.wp_product.patch}`, item).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: this.tr.instant("Updated")});
            },
            error: () => {
                // Връщаме старата стойност при грешка, ако е необходимо
            }
        });
    }

    // Сигнал, който държи само променените обекти
    public pendingChanges = signal<IWpProduct[]>([]);

    addToPendingChanges(item: IWpProduct) {
        this.pendingChanges.update(changes => {
            const index = changes.findIndex(c => c.id === item.id);
            if (index > -1) {
                changes[index] = { ...item }; // Обновяваме съществуваща промяна
                return [...changes];
            }
            return [...changes, { ...item }]; // Добавяме нова
        });
    }

    clearChanges() {
        this.pendingChanges.set([]);
    }

    saveAllChanges() {
        const changes = this.pendingChanges();

        for (const change of changes) {
            this.updateProductField(change);
        }
        this.clearChanges();
        // Изпращаме масив от обекти към бекенда
        // return this.http.put('', changes);
    }

    resetItemsMeta() {
        // Използваме метода .update() на Signal-а
        this.items.update(currentItems => {
            // Map създава нов масив с "чисти" обекти
            return currentItems.map(item => {
                const newItem = { ...item }; // Копираме обекта

                // Изтриваме временните променливи
                delete (newItem as any)._oldQty;
                delete (newItem as any)._isDirty;
                delete (newItem as any)._isEditing;

                return newItem;
            });
        });
    }
}
