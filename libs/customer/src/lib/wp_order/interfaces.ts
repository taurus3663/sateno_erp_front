import { ICustomer } from '../customer/interfaces';
import { ISite } from '../site/interfaces';
import { CourierShipmentType, CourierType } from '../courier/interfaces';

export interface ICreateLabel {
    id?: number;
    wpOrderId?: number;
    packCount: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    courierType: CourierType;
    courierShipmentType: CourierShipmentType;
    courierId: number;
    office: Object;
    city: Object;
    street: string;
    boxNowPacketSize: BoxnowPacketSize;
    fiscalReceipt?: boolean;
}
export enum BoxnowPacketSize {
    SMALL,
    MEDIUM,
    LARGE
}

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
    wpOrderTime: string;
    wayBillUrl: string;
    wayBillShipmentNumber: number;
    parcelIds: string[];

    showDuplicateWarning: boolean;
    orderLineOtherOrders: IOrderLineItem[];
    ordersToMerge?: number[];
    customerOrderCount: number;
    shippingLines: IShippingLines[];
    courierType: CourierType;
    courierId: number;
    signals: ISignalUser[];
    comment: string;
    savedCourierBilling: OrderSavedCourierSettings;
    customShippingTotal: number;
}
export interface OrderSavedCourierSettings {
    courierId: number;
    courierType: CourierType;
    courierShipmentType: CourierShipmentType;
    city: Object;
    office: Object;
    street: string;
    weight: number;
    packCount: number;
    fiscalReceipt: boolean;
    boxNowSize: BoxnowPacketSize;
}

export interface ISignalUser {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    text: string;
    createDate: string;
}
export interface IShippingLines {
    id: number;
    instance_id: string;
    method_id: string;
    method_title: string;
    tax_status: string;
    total: string;
    total_tax: string;
}
export interface IOrderLineItem {
    price: number;
    productId: number;
    productName: string;
    quantity: number;
    sku: string;
    totalPrice: number;
    paoIdValue: IPaoIdValue[];
    image: IOrderLineItemImage;
    orderId: number;
    wpOrderId: number;
    weight: string
    dimensions: IDimensions;
}
export interface IDimensions {
    length: string;
    width: string;
    height: string;
}
export interface IOrderLineItemImage {
    id: number;
    src: string;
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
    STRIPE_CC= 'stripe_cc',
    STRIPE_APPLEPAY= 'stripe_applepay',
    UNKNOWN = 'unknown'
}
export const PaymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.BACS]: 'PAYMENT.BACS',
    [PaymentMethod.CHEQUE]: 'PAYMENT.CHEQUE',
    [PaymentMethod.PAYPAL]: 'PAYMENT.PAYPAL',
    [PaymentMethod.STRIPE]: 'PAYMENT.STRIPE',
    [PaymentMethod.CARD]: 'PAYMENT.CARD',
    [PaymentMethod.COD]: 'PAYMENT.COD',
    [PaymentMethod.UNKNOWN]: 'PAYMENT.UNKNOWN',
    [PaymentMethod.STRIPE_CC]: 'PAYMENT.STRIPE_CC',
    [PaymentMethod.STRIPE_APPLEPAY]: 'PAYMENT.STRIPE_APPLEPAY'
};
export enum OrderStatus {
    PROCESSING = 'processing',
    SENT = 'sent',
    CANCELLED = 'cancelled',
    ABANDONED = 'abandoned',
    COMPLETED = 'completed',
    APPROVED = 'approved',
    JOINT = 'joint',
    WAITING = 'waiting',
    FAILED = 'failed',
}
export const OrderStatusLabels: Record<OrderStatus, string> = {
    [OrderStatus.PROCESSING]: 'STATUS.PROCESSING',
    [OrderStatus.SENT]: 'STATUS.SENT',
    [OrderStatus.CANCELLED]: 'STATUS.CANCELLED',
    [OrderStatus.ABANDONED]: 'STATUS.ABANDONED',
    [OrderStatus.COMPLETED]: 'STATUS.COMPLETED',
    [OrderStatus.APPROVED]: 'STATUS.APPROVED',
    [OrderStatus.JOINT]: 'STATUS.JOINT',
    [OrderStatus.WAITING]: 'STATUS.WAITING',
    [OrderStatus.FAILED]: 'STATUS.FAILED',
};

