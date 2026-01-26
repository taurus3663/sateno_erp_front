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
    brand: IWpBrand,
    status_p: string
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
    status_p: ProductStatus
    m_image: string;

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
export enum ProductStatus {
    DRAFT = 'draft',
    PUBLISHED = 'publish',
    PRIVATE = 'private'
}
// Помощен обект за цветовете на PrimeNG Tag
export const ProductStatusConfig = {
    [ProductStatus.PUBLISHED]: { severity: 'success', label: 'Published' },
    [ProductStatus.DRAFT]: { severity: 'warn', label: 'Draft' },
    [ProductStatus.PRIVATE]: { severity: 'danger', label: 'Private' }
};
