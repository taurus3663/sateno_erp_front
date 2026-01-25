import { ILanguage } from '../language/interfaces';
import { IWpBrand } from '../wp_brand/interfaces';

export interface IWpProduct {
    id: number;
    names: string;
    stockQuantity: number;
    unit: ProductUnit;
    status: boolean;
    weight: string;
    buyPrice: number;
    translations: IWpProductTranslation[];
    addonValuePrices: IWpProductAddonValuePrice[];
    brand: IWpBrand
}

export interface IWpProductTranslation {
    id: number;
    name: string;
    wpProductId: number;
    description: string;
    shortDescription: string;
    sku: string;
    price: number;
    regularPrice: number;
    slug: string;
    language: ILanguage


}

export interface IWpProductAddonValuePrice {
    price: number;
}

export enum ProductUnit {
    PCS = 0, // quantity
    KG = 1,
    L = 2, // litre
    M = 3, // meters
}
