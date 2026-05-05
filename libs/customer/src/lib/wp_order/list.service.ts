import { inject, Injectable, signal } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { IOrder, IOrderStatusStats } from './interfaces';
import {ROUTES} from '../api.routes';
import {OrderDetailService} from './detail.service';
import { ShipmentService } from './shipment.service';


@Injectable({
    providedIn: 'root'
})
export class OrderListService extends BaseListCrud<IOrder> {
    listRoute = ROUTES.wp_order.list;
    blockUI: boolean = false;


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
        console.log(order.wpOrderId);
        let courierName: string | undefined;
        let mode: string | undefined;


        const regex1 = /^\[(OFFICE|LOCKER|ADDRESS)\]\s*(.*)\s*\[(.*?)\]\s*\[(SPEEDY|ECONT|BOXNOW)\]$/i;
        const regex2 = /До\s+(офис|адрес|автомат)\s+(speedy|econt|boxnow)\[(.*?)\]:\s*(.*)/i;

        const addr = order.billing.address_1 || '';
        let match = addr.match(regex1) || addr.match(regex2);

        if(order.savedCourierBilling && order.savedCourierBilling.courierType.length > 0) {
           courierName = order.savedCourierBilling.courierType;
           mode = order.savedCourierBilling.courierShipmentType.toString();
        }
        else if (match) {
            // Проверка кой Regex е съвпаднал (Regex1 започва с '[')
            if (match[0].startsWith('[')) {
                mode = match[1].toUpperCase();
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

    // В самия клас на компонента
    public courierLogos: { [key: string]: string } = {
        'ECONT': 'assets/img/econt-logo.png',
        'SPEEDY': 'assets/img/speedy-logo.png',
        'BOXNOW': 'assets/img/boxnow-logo.png',
        'BOX_NOW': 'assets/img/boxnow-logo.png',
        // 'UNKNOWN': 'assets/img/couriers/default-truck.png' // Fallback ако няма съвпадение
    };

    public printWayBill(order: IOrder, waybillId: string | string[], format: 'A4' | 'A6') {
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
    public statusStats = signal<IOrderStatusStats | null>(null);
    public loadStatusStats() {
        this.http.get<IOrderStatusStats>(ROUTES.wp_order.getStatusStats).subscribe({
            next: (res) => {
                // Записваме резултата в сигнала
                this.statusStats.set(res);
                console.log('📊 Статистиките са заредени:', res);
            },
            error: (err) => {
                console.error('❌ Грешка при зареждане на статистики:', err);
            }
        });
    }

    private shipmentService = inject(ShipmentService);

    public openShipmentDialog(order: IOrder) {
        this.shipmentService.open(order);
    }

    public cancelShipment(order: IOrder) {
        // 1. Заключваме веднага
        this.blockUI = true;

        this.http.post(ROUTES.wp_order.cancelShipment(order.id), {}, {})
            .subscribe({
                next: (response) => {
                    console.log('Успешно анулиране:', response);

                    // 2. Тук НЕ отключваме веднага, защото изчакваме
                    // WebSocket сигнала или ръчния reload() да опресни данните.
                    // Но ако нямаш автоматичен релоад тук, извикай го:
                    // this.reload();
                },
                error: (err) => {
                    console.error('Грешка при анулиране:', err);
                    // 3. ВАЖНО: При грешка отключваме задължително,
                    // за да може потребителят да оперира със системата.
                    this.blockUI = false;
                }
            });
    }

    updateOrderField(item: IOrder) {
        this.http.patch(`${ROUTES.wp_order.patch}`, item).subscribe({
            next: (response) => {
                this.messageService.add({severity: 'success', summary: this.tr.instant("Updated")});
            },
            error: (err) => {}
        })
    }

    openViber(phone: string) {
        if (!phone) return;

        // 1. Махаме абсолютно всичко, което не е цифра (чистим +, интервали, тирета)
        let cleanPhone = phone.replace(/\D/g, '');

        // 2. Ако започва с 0 (напр. 0877...), го правим на 359877...
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '359' + cleanPhone.substring(1);
        }

        // 3. Форматът viber://chat?number= е по-съвместим с новите версии на десктоп
        const url = `viber://chat?number=${cleanPhone}`;

        window.location.assign(url);
    }
}
