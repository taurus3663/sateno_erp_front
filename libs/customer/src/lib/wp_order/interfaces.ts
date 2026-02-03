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
    paymentMethod: PaymentMethod;
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
export enum PaymentMethod {
    BACS = 'bacs',
    CHEQUE = 'cheque',
    PAYPAL = 'paypal',
    STRIPE = 'stripe',
    CARD = 'card',
    COD = 'cod',
    UNKNOWN = 'unknown'
}
export const PaymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.BACS]: 'PAYMENT.BACS',
    [PaymentMethod.CHEQUE]: 'PAYMENT.CHEQUE',
    [PaymentMethod.PAYPAL]: 'PAYMENT.PAYPAL',
    [PaymentMethod.STRIPE]: 'PAYMENT.STRIPE',
    [PaymentMethod.CARD]: 'PAYMENT.CARD',
    [PaymentMethod.COD]: 'PAYMENT.COD',
    [PaymentMethod.UNKNOWN]: 'PAYMENT.UNKNOWN'
};
export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    ON_HOLD = 'on-hold',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
    FAILED = 'failed',
    TRASH = 'trash',
    UNKNOWN = 'unknown'
}
export const OrderStatusLabels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'STATUS.PENDING',
    [OrderStatus.PROCESSING]: 'STATUS.PROCESSING',
    [OrderStatus.ON_HOLD]: 'STATUS.ON_HOLD',
    [OrderStatus.COMPLETED]: 'STATUS.COMPLETED',
    [OrderStatus.CANCELLED]: 'STATUS.CANCELLED',
    [OrderStatus.REFUNDED]: 'STATUS.REFUNDED',
    [OrderStatus.FAILED]: 'STATUS.FAILED',
    [OrderStatus.TRASH]: 'STATUS.TRASH',
    [OrderStatus.UNKNOWN]: 'STATUS.UNKNOWN'
};
