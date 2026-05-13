import { IWpProduct } from '../wp_product/interfaces';

export interface IProductMenuOrder {
    categoryName: string;
    products: any;
}

export interface RProductMenuOrder {
    id: number;
    productIds: number[];
    category: number;

}
