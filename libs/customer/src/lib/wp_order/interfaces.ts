import { ICustomer } from '../customer/interfaces';
import { ISite } from '../site/interfaces';

export interface IOrder {
    id: number;
    wpOrderId: number;
    currency: string;
    currencySymbol: string;
    customer: ICustomer;
    customerAgent: string;
    customerIp: string;
    orderLine: IOrderLineItem[];
    paymentMethod: string;
    shipping: IShippingAndBilling;
    billing: IShippingAndBilling;
    site: ISite;
    status: string;
    totalPrice: number;
    transactionId: string;
    createTime: string;
    updateTime: string;
}

export interface IOrderLineItem {
    price: number;
    productId: number;
    productName: string;
    quantity: number;
    sku: string;
    totalPrice: number;
    paoIdValue: IPaoIdValue[];
}
export interface IPaoIdValue {
    id: number;
    key: string;
    value: IPaoIdValueValue[];
}
export interface IPaoIdValueValue {
    id: number;
    key: string;
    priceType: string;
    rawPrice: string;
    rawValue: string;
    value: string;
}
export interface IShippingAndBilling {
    address_1: string;
    address_2: string;
    city: string;
    company: string;
    country: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    postcode: string;
    state: string;
}
