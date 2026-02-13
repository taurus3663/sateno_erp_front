import { inject, Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IOrder } from './interfaces';
import { HttpClient } from '@angular/common/http';


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

    open(order: IOrder) {
        this.selectedOrder = order;
        this.visible = true;
        this.reset();

        if (order.billing.city) {
            this.loadCities(order.billing.city);
        }
    }

    private reset() {
        this.selectedCourier = null;
        this.selectedCity = null;
        this.selectedOffice = null;
        this.cities = [];
        this.offices = [];
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
