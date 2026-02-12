import { Injectable } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IOrder } from './interfaces';


@Injectable({providedIn: 'root'})
export class ShipmentService {

    constructor() {
        // super();
    }
    visible = false;
    selectedOrder?: IOrder;

    open(order: IOrder) {
        this.selectedOrder = order;
        this.visible = true;
    }



}
