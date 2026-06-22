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



    defaultCourier: boolean;
    config: ICourierConfig;

    office: boolean;
    officeFreeShippingPriceMax?: number;
    officeFreeShippingPriceMaxBol?: boolean;
    officeAutoShippingPrice?: boolean;
    officeFixedShippingPrice?: number;

    address: boolean;
    addressFreeShippingPriceMax?: number;
    addressFreeShippingPriceMaxBol?: boolean;
    addressAutoShippingPrice?: boolean;
    addressFixedShippingPrice?: number;

    locker: boolean;
    lockerFreeShippingPriceMax?: number;
    lockerFreeShippingPriceMaxBol?: boolean;
    lockerAutoShippingPrice?: boolean;
    lockerFixedShippingPrice?: number;
}

 export interface ICourierConfig {
    companyName: string;
    agentName: string;
    phoneNumber: string;
    city: string;
    postalCode: string;
    address: string;
    mail: string;
    cdPayOptionsTemplate?: string;
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
