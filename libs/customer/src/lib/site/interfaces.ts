import { ICourier } from '../courier/interfaces';
import { IEmail } from '../email/interfaces';

export interface ISite {
    id: number;
    name: string;
    url: string;
    consumerKey: string;
    consumerSecret: string;
    currency: string;
    language: string;
    active: boolean;
    orderCreateApiKey: string;
    couriers: ICourier[];
    email: IEmail;
    newOrderMessage: string;
    changeStatusTimer: number;

    secondOrderMessageTimer: number;
    secondOrderMessage: string;
    thirdOrderMessageTimer: number;
    thirdOrderMessage: string;
    isDefault: boolean;
}
