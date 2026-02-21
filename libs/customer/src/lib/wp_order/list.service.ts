import { inject, Injectable } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { IOrder } from './interfaces';
import {ROUTES} from '../api.routes';
import {OrderDetailService} from './detail.service';


@Injectable({
    providedIn: 'root'
})
export class OrderListService extends BaseListCrud<IOrder> {
    listRoute = ROUTES.wp_order.list;


    constructor() {
        super(inject(OrderDetailService));
    }

    public syncBrands(siteId: any) {
        this.loading.set(true);
        this.http.post(`${ROUTES.wp_order.sync}/${siteId}`, {})
            .subscribe({
                next: (res) => {
                    this.loadList(0, 10);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                }
            });
    }

    public getCourierType(order: IOrder) {
        let courierName: string | undefined;
        let mode: string | undefined;


        const regex1 = /^\[(OFFICE|LOCKER|ADDRESS)\]\s*(.*)\s*\[(.*?)\]\s*\[(SPEEDY|ECONT|BOXNOW)\]$/i;
        const regex2 = /До\s+(офис|адрес|автомат)\s+(speedy|econt|boxnow)\[(.*?)\]:\s*(.*)/i;

        const addr = order.billing.address_1 || '';
        let match = addr.match(regex1) || addr.match(regex2);

        if (match) {
            // Проверка кой Regex е съвпаднал (Regex1 започва с '[')
            if (match[0].startsWith('[')) {
                // mode = match[1].toUpperCase();
                // rawText = match[2].trim();
                // officeId = match[3];
                courierName = match[4].toUpperCase();
            } else {
                // Regex2
                const typeMap: any = { офис: 'OFFICE', адрес: 'ADDRESS', автомат: 'LOCKER' };
                mode = typeMap[match[1].toLowerCase()] || 'OFFICE';
                courierName = match[2].toUpperCase();
            }
        } else {
            // --- 4 & 5: FALLBACK ЛОГИКА (Чист адрес + shipping_lines) ---
            const shippingLine = order.shippingLines?.[0];
            if (shippingLine) {
                const title = shippingLine.method_title.toLowerCase();
                // Търсим Куриер
                if (title.includes('econt')) courierName = 'ECONT';
                else if (title.includes('speedy')) courierName = 'SPEEDY';
                else if (title.includes('boxnow')) courierName = 'BOXNOW';

                // Търсим Тип
                if (title.includes('адрес') || title.includes('aдрес')) mode = 'ADDRESS';
                else if (title.includes('автомат') || title.includes('aвтомат') || title.includes('locker')) mode = 'LOCKER';
                else mode = 'OFFICE';
            }
        }

    return {"mode": mode, "courierName": courierName};
    }

    public printSpeedy(order: IOrder, waybillId: string | string[], format: 'A4' | 'A6') {
        this.http.post(ROUTES.wp_order.generateWayBillPrint(order.id, waybillId, format), {}, {
            responseType: 'blob',
        })
            .subscribe({
                next: (response) => {
                    // 2. Създаваме Blob от байтовете
                    const blob = new Blob([response as BlobPart], { type: 'application/pdf' });

                    // 3. Генерираме временен URL и го отваряме в нов таб
                    const fileURL = URL.createObjectURL(blob);
                    const printWindow = window.open(fileURL, '_blank');

                    // 4. Добра практика: освобождаваме паметта след кратко време
                    if (printWindow) {
                        printWindow.addEventListener('load', () => {
                            // URL.revokeObjectURL(fileURL); // Може да се изчисти тук или след време
                        });
                    }
                },
                error: (err) => {
                    console.error('Грешка при генериране на PDF:', err);
                    // Тук можеш да добавиш toast съобщение за потребителя
                }
            });
    }
}
