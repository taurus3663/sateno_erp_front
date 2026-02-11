import { ISite } from '../site/interfaces';


export interface ICourier {
    id: number;
    name?: string;
    username?: string;
    password?: string;
    apikey?: string;
    apiSecret?: string;
    site?: ISite;
    active:boolean;
    courierType: CourierType;
}

export enum CourierType {
    SPEEDY = 'SPEEDY',
    ECONT = 'ECONT',
    BOX_NOW = 'BOX_NOW',
}
