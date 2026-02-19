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

    loadingCities = false;
    loadingOffices = false;

    addressStreet: string = '';
    addressNumber: string = '';
    addressOther: string = '';

    weight: number = 1;
    length: number = 30;
    width: number = 5;
    height: number = 20;
    packCount: number = 1;


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
    // open(order: IOrder) {
    //     this.selectedOrder = order;
    //     this.reset();
    //     this.visible = true;
    //
    //
    //     // 1. ПАРСВАНЕ НА АДРЕСА: [TYPE] Текст [ID] [COURIER]
    //     const addr = order.billing.address_1 || '';
    //     const regex = /^\[(OFFICE|LOCKER|ADDRESS)\]\s*(.*)\s*\[(.*?)\]\s*\[(SPEEDY|ECONT|BOXNOW)\]$/i;
    //     const match = addr.match(regex);
    //
    //     if (match) {
    //         const mode = match[1].toUpperCase();     // OFFICE, LOCKER или ADDRESS
    //         const rawText = match[2].trim();
    //         const officeId = match[3];              // ID-то в средните скоби
    //         const courierName = match[4].toUpperCase(); // SPEEDY, ECONT или BOXNOW
    //
    //         // 2. Определяме типа доставка
    //         this.deliveryType = (mode === 'ADDRESS') ? 'ADDRESS' : (mode === 'LOCKER') ? 'LOCKER' : 'OFFICE';
    //
    //         // 3. Намираме и селектираме Куриера
    //         const couriers = this.courierListService.items();
    //         this.selectedCourier = couriers.find(c =>
    //             c.courierType.toUpperCase() === courierName ||
    //             c.name?.toUpperCase().includes(courierName)
    //         );
    //
    //         if (this.selectedCourier) {
    //
    //             // 4. Ако е ADDRESS, попълваме полетата за улица и номер
    //             if (this.deliveryType === 'ADDRESS') {
    //                 this.parseAddressDetails(rawText);
    //             }
    //
    //             // 4. Зареждаме Градовете и се опитваме да мапнем Офиса
    //             this.autoSelectFlow(order.billing.city, officeId);
    //         }
    //     }
    // }
    open(order: IOrder) {
        this.selectedOrder = order;
        this.reset();
        this.visible = true;

        const addr = order.billing.address_1 || '';

        // Първи формат: [TYPE] Текст [ID] [COURIER]
        const regex1 = /^\[(OFFICE|LOCKER|ADDRESS)\]\s*(.*)\s*\[(.*?)\]\s*\[(SPEEDY|ECONT|BOXNOW)\]$/i;

        // Втори формат: До офис courier[ID]: Текст
        const regex2 = /До\s+(офис|адрес|автомат)\s+(speedy|econt|boxnow)\[(.*?)\]:\s*(.*)/i;

        let match = addr.match(regex1);
        let mode, rawText, officeId, courierName: string;

        if (match) {
            mode = match[1].toUpperCase();
            rawText = match[2].trim();
            officeId = match[3];
            courierName = match[4].toUpperCase();
        } else {
            match = addr.match(regex2);
            if (match) {
                const typeMap: any = { 'офис': 'OFFICE', 'адрес': 'ADDRESS', 'автомат': 'LOCKER' };
                mode = typeMap[match[1].toLowerCase()] || 'OFFICE';
                courierName = match[2].toUpperCase();
                officeId = match[3];
                rawText = match[4].trim();
            }
        }

        if (match) {
            // 2. Определяме типа доставка (BoxNow винаги е LOCKER)
            if (courierName! === 'BOXNOW' || courierName! === 'BOX_NOW') {
                this.deliveryType = 'LOCKER';
            } else {
                this.deliveryType = (mode === 'ADDRESS') ? 'ADDRESS' : (mode === 'LOCKER') ? 'LOCKER' : 'OFFICE';
            }

            // 3. Намираме Куриера
            const couriers = this.courierListService.items();
            this.selectedCourier = couriers.find(c =>
                c.courierType.toUpperCase() === courierName ||
                c.courierType.toUpperCase() === courierName.replace('_', '') ||
                c.name?.toUpperCase().includes(courierName)
            );

            if (this.selectedCourier) {
                if (this.deliveryType === 'ADDRESS') {
                    this.parseAddressDetails(rawText!);
                }
                // 4. Зареждаме Градовете и мапваме офиса
                this.autoSelectFlow(order.billing.city, officeId!);
            }
        }
    }
    /**
     * Помощен метод за разделяне на текст като "седемнадесет номер 9"
     * на Улица: "седемнадесет" и Номер: "9"
     */
    private parseAddressDetails(rawText: string) {
        const lowerText = rawText.toLowerCase();

        // Търсим ключови думи за разделяне
        if (lowerText.includes('номер')) {
            const parts = rawText.split(/номер/i);
            this.addressStreet = parts[0].trim();
            this.addressNumber = parts[1].trim();
        } else if (lowerText.includes('№')) {
            const parts = rawText.split(/№/);
            this.addressStreet = parts[0].trim();
            this.addressNumber = parts[1].trim();
        } else {
            // Ако няма ключова дума, слагаме всичко в Street
            this.addressStreet = rawText;
            this.addressNumber = '';
        }

        // Ако има адрес 2 (бл, вх, ап), го вземаме от поръчката
        this.addressOther = this.selectedOrder?.billing.address_2 || '';
    }

    private autoSelectFlow(cityName: string, officeId: string) {
        this.http.get<any[]>(`shipment/cities/${this.selectedCourier.id}?query=${cityName}`)
            .subscribe(res => {
                this.cities = [...res];
                this.selectedCity = this.cities.find(c => c.name.toUpperCase() === cityName.toUpperCase());

                // 1. Първо опресняваме за града
                this.cdr?.detectChanges();

                if (this.selectedCity && (this.deliveryType === 'OFFICE' || this.deliveryType === 'LOCKER')) {
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

                                // console.log('officeId:', officeId);
                                // this.offices.forEach(o => console.log('o.code', o.code, 'o.id', o.id));
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
            setTimeout(() => {
                this.loadingCities = true;
                this.cdr?.detectChanges();
            });
            this.http.get<any[]>(`shipment/cities/${this.selectedCourier.id}?query=${query}`)
                .subscribe({
                    next: res => {
                        this.cities = res;
                        this.cdr?.detectChanges();
                    },
                    error: () => {
                        this.cities = [];
                        this.cdr?.detectChanges();
                    },
                    complete: () => {
                      setTimeout(() => {
                          this.loadingCities = false; // скриваме spinner
                          this.cdr?.detectChanges();
                      })
                    }
                });
        }
    }

    loadOffices(query: string = '') {
        if (this.selectedCity && this.selectedCourier) {
            setTimeout(() => {
                this.loadingOffices = true;
                this.cdr?.detectChanges();
            });
            // Добавяме ?query към пътя, за да може Java да филтрира
            this.http.get<any[]>(`shipment/offices/${this.selectedCourier.id}/${this.selectedCity.id}?query=${query}`)
                .subscribe({
                    next: res => {
                        this.offices = res;
                        this.cdr?.detectChanges();
                    },
                    error: () => {
                        this.offices = [];
                    },
                    complete: () => {
                        setTimeout(() => {
                            this.loadingOffices = false;
                            this.cdr?.detectChanges();
                        })
                    }
                });
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

    // В ShipmentService
    boxNowSizes = [
        { label: 'Автоматично', value: '' },
        { label: 'Малка (В: 8см, Ш: 45см, Д: 60см) до 5кг', value: '1' },
        { label: 'Средна (В: 17см, Ш: 45см, Д: 60см) до 8кг', value: '2' },
        { label: 'Голяма (В: 36см, Ш: 45см, Д: 60см) до 20кг', value: '3' }
    ];
    selectedBoxNowSize: string = '';

}
