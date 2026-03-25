import { effect, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IOrder } from './interfaces';
import { ROUTES } from '../api.routes';
import { IWpProduct } from '../wp_product/interfaces';
import { lastValueFrom } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class OrderDetailService extends BaseDetailCrud<IOrder> {
    override saveRoute: string = ROUTES.wp_order.save;
    override getRoute: string = ROUTES.wp_order.get;
    override deleteRoute: string = ROUTES.wp_order.delete;

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

    public async getProduct(product: any): Promise<IWpProduct | null> {
        return await lastValueFrom(this.http.get<IWpProduct>(`${ROUTES.wp_product.get}/${product.id}`));
    }

    public async calculateCustomShippingField(order:IOrder): Promise<number> {
        let {targetId, shipmentType, courierType, saved, shipping, billing} = this.regexCheck(order);

        const payload = {
            site: order.site?.url,
            currency: order.currency,
            cart_total: order.totalPriceFCoutier?.toString(),

            // Калкулираме теглото (Тегло * Бройка)
            cart_weight: order.orderLine.reduce((total, line) => {
                return total + (parseFloat(line.weight || '0.5') * (line.quantity || 1));
            }, 0),

            courierType: courierType,           // null или Enum String
            courierShipmentType: shipmentType, // null или Enum String
            targetId: targetId,

            cityName: (saved?.city as any)?.name || shipping?.city || billing?.city || '',
            postcode: (saved?.city as any)?.postCode || shipping?.postcode || billing?.postcode || '',

            items: order.orderLine.map(line => ({
                productId: line.productId,
                productName: line.productName,
                sku: line.sku,
                quantity: line.quantity,
                price: line.price,
                weight: line.weight
            }))
        };

        return lastValueFrom(this.http.post<number>(`${ROUTES.checkout.recalculate_price_custom_field}`, payload));
    }

    private regexCheck(order: IOrder) {
        const saved = order.savedCourierBilling;
        const billing = order.billing;
        const shipping = order.shipping;
        const shippingLine = order.shippingLines?.[0];

        // 1. Инициализираме като null (за да не гърми Java Enum-а с "")
        let targetId: string | null = null;
        let shipmentType: string | null = null;
        let courierType: string | null = null;

        // --- СТЪПКА 1: Проверка на SAVED SETTINGS ---
        if (saved) {
            shipmentType = saved.courierShipmentType;
            courierType = saved.courierType;
            const office = saved.office as any;
            if (office) targetId = office.code || office.id || '';
            // targetId = '47620';
        }
        // --- СТЪПКА 2: REGEX ВЪРХУ АДРЕСА (Използваме твоите Regex-и) ---
        else {
            const addr = (shipping?.address_1 || billing?.address_1 || '').trim();

            // Твоите дефиниции
            const regex1 = /^\[(OFFICE|LOCKER|ADDRESS)\]\s*(.*)\s*\[(.*?)\]\s*\[(SPEEDY|ECONT|BOXNOW)\]$/i;
            const regex2 = /До\s+(офис|aдрес|автомат)\s+(speedy|econt|boxnow)(?:-[a-z]+)?\s*\[(.*?)\]:\s*(.*)/i;

            let match = addr.match(regex1) || addr.match(regex2);

            if (match) {
                if (match[0].startsWith('[')) { // Regex 1
                    shipmentType = match[1].toUpperCase();
                    targetId = match[3];
                    courierType = match[4].toUpperCase();
                } else { // Regex 2
                    const typeMap: any = { 'офис': 'OFFICE', 'aдрес': 'ADDRESS', 'автомат': 'LOCKER' };
                    shipmentType = typeMap[match[1].toLowerCase()] || 'OFFICE';
                    courierType = match[2].toUpperCase();
                    targetId = match[3];
                }
            }

            // --- СТЪПКА 3: FALLBACK КЪМ SHIPPING LINES (Ако Regex-ът не хване нищо) ---
            if (!courierType && shippingLine) {
                const title = shippingLine.method_title.toLowerCase();

                if (title.includes('speedy')) courierType = 'SPEEDY';
                else if (title.includes('econt')) courierType = 'ECONT';
                else if (title.includes('boxnow')) courierType = 'BOX_NOW';

                if (title.includes('aдрес')) {
                    shipmentType = 'ADDRESS';
                    targetId = shippingLine.id.toString();
                }
                else if (title.includes('офис')) shipmentType = 'OFFICE';
                else if (title.includes('автомат') || title.includes('locker')) shipmentType = 'LOCKER';
            }
        }

        // Финална корекция за Java (BOXNOW -> BOX_NOW)
        if (courierType === 'BOXNOW') courierType = 'BOX_NOW';


        return {targetId, shipmentType, courierType, saved, shipping, billing};
    }

    public async calculateShipping(order: IOrder): Promise<number> {
        // const saved = order.savedCourierBilling;
        // const billing = order.billing;
        // const shipping = order.shipping;
        // const shippingLine = order.shippingLines?.[0];

        // 1. Инициализираме като null (за да не гърми Java Enum-а с "")
        // let targetId: string | null = null;
        // let shipmentType: string | null = null;
        // let courierType: string | null = null;
        //
        // // --- СТЪПКА 1: Проверка на SAVED SETTINGS ---
        // if (saved) {
        //     shipmentType = saved.courierShipmentType;
        //     courierType = saved.courierType;
        //     const office = saved.office as any;
        //     if (office) targetId = office.code || office.id || '';
        //     // targetId = '47620';
        // }
        // // --- СТЪПКА 2: REGEX ВЪРХУ АДРЕСА (Използваме твоите Regex-и) ---
        // else {
        //     const addr = (shipping?.address_1 || billing?.address_1 || '').trim();
        //
        //     // Твоите дефиниции
        //     const regex1 = /^\[(OFFICE|LOCKER|ADDRESS)\]\s*(.*)\s*\[(.*?)\]\s*\[(SPEEDY|ECONT|BOXNOW)\]$/i;
        //     const regex2 = /До\s+(офис|aдрес|автомат)\s+(speedy|econt|boxnow)(?:-[a-z]+)?\s*\[(.*?)\]:\s*(.*)/i;
        //
        //     let match = addr.match(regex1) || addr.match(regex2);
        //
        //     if (match) {
        //         if (match[0].startsWith('[')) { // Regex 1
        //             shipmentType = match[1].toUpperCase();
        //             targetId = match[3];
        //             courierType = match[4].toUpperCase();
        //         } else { // Regex 2
        //             const typeMap: any = { 'офис': 'OFFICE', 'aдрес': 'ADDRESS', 'автомат': 'LOCKER' };
        //             shipmentType = typeMap[match[1].toLowerCase()] || 'OFFICE';
        //             courierType = match[2].toUpperCase();
        //             targetId = match[3];
        //         }
        //     }
        //
        //     // --- СТЪПКА 3: FALLBACK КЪМ SHIPPING LINES (Ако Regex-ът не хване нищо) ---
        //     if (!courierType && shippingLine) {
        //         const title = shippingLine.method_title.toLowerCase();
        //
        //         if (title.includes('speedy')) courierType = 'SPEEDY';
        //         else if (title.includes('econt')) courierType = 'ECONT';
        //         else if (title.includes('boxnow')) courierType = 'BOX_NOW';
        //
        //         if (title.includes('aдрес')) {
        //             shipmentType = 'ADDRESS';
        //             targetId = shippingLine.id.toString();
        //         }
        //         else if (title.includes('офис')) shipmentType = 'OFFICE';
        //         else if (title.includes('автомат') || title.includes('locker')) shipmentType = 'LOCKER';
        //     }
        // }
        //
        // // Финална корекция за Java (BOXNOW -> BOX_NOW)
        // if (courierType === 'BOXNOW') courierType = 'BOX_NOW';

        let {targetId, shipmentType, courierType, saved, shipping, billing} = this.regexCheck(order);

        const payload = {
            site: order.site?.url,
            currency: order.currency,
            cart_total: order.totalPriceFCoutier?.toString(),

            // Калкулираме теглото (Тегло * Бройка)
            cart_weight: order.orderLine.reduce((total, line) => {
                return total + (parseFloat(line.weight || '0.5') * (line.quantity || 1));
            }, 0),

            courierType: courierType,           // null или Enum String
            courierShipmentType: shipmentType, // null или Enum String
            targetId: targetId,

            cityName: (saved?.city as any)?.name || shipping?.city || billing?.city || '',
            postcode: (saved?.city as any)?.postCode || shipping?.postcode || billing?.postcode || '',

            items: order.orderLine.map(line => ({
                productId: line.productId,
                productName: line.productName,
                sku: line.sku,
                quantity: line.quantity,
                price: line.price,
                weight: line.weight
            }))
        };

        return lastValueFrom(this.http.post<number>(`${ROUTES.checkout.recalculate_price}`, payload));
    }
}
