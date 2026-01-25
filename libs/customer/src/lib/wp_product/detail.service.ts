import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IWpProduct } from './interfaces';
import { ROUTES } from '../api.routes';


@Injectable({ providedIn: 'root' })
export class WpProductDetailService extends BaseDetailCrud<IWpProduct> {
    override saveRoute: string = ROUTES.wp_product.save;
    override getRoute: string = ROUTES.wp_product.get;
    override deleteRoute: string = ROUTES.wp_product.delete;

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

    override openEditDialog(item: IWpProduct) {
        // 1. Първо отваряме диалога и слагаме това, което имаме (за да не чака потребителя)
        this.selectedItem.set({ ...item });
        this.isVisible.set(true);
        this.loading.set(true);

        this.http.get<IWpProduct>(`${ROUTES.wp_product.get}/${item.id}`).subscribe({
            next: (fullData) => {
                // 3. Заменяме лекото DTO с пълното (вече имаш translations, unit и т.н.)
                this.selectedItem.set(fullData);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                // Опционално: покажи грешка
            }
        });
    }




}
