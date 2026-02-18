import { ISite } from '../site/interfaces';


export interface ICourier {
    id: number;
    name?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiSecret?: string;
    site?: ISite;
    active:boolean;
    courierType: CourierType;
    courierShipmentType: CourierShipmentType;
    sortOrder?: number;
    freeShippingPriceMax?: number;
    freeShippingPriceMaxBol?: boolean;
    autoShippingPrice?: boolean;
    fixedShippingPrice?: number;
}

export enum CourierType {
    SPEEDY = 'SPEEDY',
    ECONT = 'ECONT',
    BOX_NOW = 'BOX_NOW',
}

export enum CourierShipmentType {
    OFFICE = 'OFFICE',
    ADDRESS = 'ADDRESS',
    LOCKER = 'LOCKER',
}
