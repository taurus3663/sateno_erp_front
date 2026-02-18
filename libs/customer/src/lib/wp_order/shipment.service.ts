import { inject, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IOrder } from './interfaces';
import { HttpClient } from '@angular/common/http';
import { CourierListService } from '../courier/list.service';


@Injectable({providedIn: 'root'})
export class ShipmentService{
    private http = inject(HttpClient);

    visible = false;
    selectedOrder?: IOrder;
    selectedCourier: any = null;

    // Липсващите променливи
    selectedCity: any = null;
    selectedOffice: any = null;
    cities: any[] = [];
    offices: any[] = [];
    deliveryType: string = 'OFFICE';
    private cdr?: any; // Тук ще пазим референцията към детектора

// Методът, който ще извикаме от компонента
    setDetector(cdr: any) {
        this.cdr = cdr;
    }

    // open(order: IOrder) {
    //     this.selectedOrder = order;
    //     this.visible = true;
    //     this.reset();
    //
    //     if (order.billing.city) {
    //         this.loadCities(order.billing.city);
    //     }
    // }
    private courierListService = inject(CourierListService);
    open(order: IOrder) {
        this.selectedOrder = order;
        this.reset();
        this.visible = true;


        // 1. ПАРСВАНЕ НА АДРЕСА: [TYPE] Текст [ID] [COURIER]
        const addr = order.billing.address_1 || '';
        const regex = /^\[(OFFICE|LOCKER|ADDRESS)\]\s*(.*)\s*\[(.*?)\]\s*\[(SPEEDY|ECONT|BOXNOW)\]$/i;
        const match = addr.match(regex);

        if (match) {
            const mode = match[1].toUpperCase();     // OFFICE, LOCKER или ADDRESS
            const officeId = match[3];              // ID-то в средните скоби
            const courierName = match[4].toUpperCase(); // SPEEDY, ECONT или BOXNOW

            // 2. Определяме типа доставка
            this.deliveryType = (mode === 'ADDRESS') ? 'ADDRESS' : 'OFFICE';

            // 3. Намираме и селектираме Куриера
            const couriers = this.courierListService.items();
            this.selectedCourier = couriers.find(c =>
                c.courierType.toUpperCase() === courierName ||
                c.name?.toUpperCase().includes(courierName)
            );


            if (this.selectedCourier) {
                // 4. Зареждаме Градовете и се опитваме да мапнем Офиса
                this.autoSelectFlow(order.billing.city, officeId);
            }
        }
    }

    private autoSelectFlow(cityName: string, officeId: string) {
        this.http.get<any[]>(`shipment/cities/${this.selectedCourier.id}?query=${cityName}`)
            .subscribe(res => {
                this.cities = [...res];
                this.selectedCity = this.cities.find(c => c.name.toUpperCase() === cityName.toUpperCase());

                // 1. Първо опресняваме за града
                this.cdr?.detectChanges();

                if (this.selectedCity && this.deliveryType === 'OFFICE') {
                    this.http.get<any[]>(`shipment/offices/${this.selectedCourier.id}/${this.selectedCity.id}`)
                        .subscribe(offices => {
                            // ТУК Е ПРОБЛЕМЪТ: Пълним масива и Angular веднага "гърми"
                            this.offices = [...offices];

                            // 2. ВЕДНАГА КАЗВАМЕ НА ANGULAR, ЧЕ МАСИВЪТ ВЕЧЕ НЕ Е ПРАЗЕН
                            this.cdr?.detectChanges();

                            setTimeout(() => {
                                this.selectedOffice = this.offices.find(o =>
                                    String(o.code) === String(officeId) || String(o.id) === String(officeId)
                                );

                                // 3. Опресняваме последно, за да се види селектираното име
                                this.cdr?.detectChanges();
                            }, 100);
                        });
                }
            });
    }

    private reset() {
        this.selectedCourier = null;
        this.selectedCity = null;
        this.selectedOffice = null;
        this.cities = [];
        this.offices = [];
        this.deliveryType = 'OFFICE';
    }

    onCourierChange() {
        this.selectedCity = null;
        this.selectedOffice = null;
        this.offices = [];
        this.cities = [];

        if (this.selectedCourier) {
            // Пътят трябва да е същият като в Java: /api/shipment/cities/
            this.loadCities('');
        }
    }

    loadCities(query: string = '') {
        if (this.selectedCourier) {
            this.http.get<any[]>(`shipment/cities/${this.selectedCourier.id}?query=${query}`)
                .subscribe(res => this.cities = res);
        }
    }

    loadOffices(query: string = '') {
        if (this.selectedCity && this.selectedCourier) {
            // Добавяме ?query към пътя, за да може Java да филтрира
            this.http.get<any[]>(`shipment/offices/${this.selectedCourier.id}/${this.selectedCity.id}?query=${query}`)
                .subscribe(res => this.offices = res);
        }
    }

    onCityChange() {
        this.selectedOffice = null;
        this.offices = [];

        if (this.selectedCity && this.selectedCourier) {
            // Пътят от Java: /api/shipment/offices/{courierId}/{cityId}
            this.http.get<any[]>(`shipment/offices/${this.selectedCourier.id}/${this.selectedCity.id}`)
                .subscribe(res => this.offices = res);
        }
    }

}
