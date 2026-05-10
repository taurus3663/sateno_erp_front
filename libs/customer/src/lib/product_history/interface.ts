
export interface IWpProductHistory {
    id: number;
    createTime: string;
    quantity: number;
    reason: string;
    orderId: number;
    productId: number;
    wpOrderId: number;
    productSku: string;
    oldQuantity: number;
    newQuantity: number;
    changerName: string;
}
