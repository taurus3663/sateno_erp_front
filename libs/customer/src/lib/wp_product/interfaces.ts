import { ILanguage } from '../language/interfaces';
import { IWpBrand } from '../wp_brand/interfaces';
import { IWpCategory } from '../wp_category/interfaces';
import { ISite } from '../site/interfaces';
import { IWpAddonValue } from '../wp_addon_value/interfaces';
import { IWpProductHistory } from '../product_history/interface';

export interface IWpProduct {
    id: number;
    names: string;
    stockQuantity: number;
    // unit: ProductUnit;
    weight: string;
    buyPrice: number;
    transportPrice: number;
    translations: IWpProductTranslation[];
    // addonValuePrices: IWpProductAddonValuePrice[];
    brand: IWpBrand;
    categories: IWpCategory[];
    images: IWpImage[];
    m_image: string;
    status: ProductStatus;
    addonConfig: any[];
    addonConfigs: IWpProductAddonConfig[];
    siteConfig: IWpProductSiteConfig[];
    saleType: ProductSaleType;
    sku: string;
    lastEditedSiteId?: number;
    history: IWpProductHistory[];
}
export enum ProductSaleType {
    LIMITED = 0,
    UNLIMITED = 1
}

export enum ProductStatus {
    DRAFT = 0,
    PUBLISHED = 1,
    PENDING = 2,
}

export interface IWpProductAddonConfig {
    id?: number;
    // site: ISite;
    priceModifier: number;
    addonValue: IWpAddonValue;
}

export interface IWpProductTranslation {
    id: number;
    name: string;
    wpProductId: number;
    description: string;
    shortDescription: string;
    price: number;
    regularPrice: number;
    slug: string;
    language: ILanguage
}

export interface IWpProductAddonValuePrice {
    price: number;
}

export interface ICategoryNode {
    data: ICategoryNodeData;
    leaf: boolean;
    expanded?: boolean; // опционално за PrimeNG
}

export interface ICategoryNodeData {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    parentName: string | null;
}

export enum ProductUnit {
    PCS = 0, // quantity
    KG = 1,
    L = 2, // litre
    M = 3, // meters
}

// Помощен обект за цветовете на PrimeNG Tag
export const ProductStatusConfig = {
    [ProductStatus.PUBLISHED]: { severity: 'success', label: 'Published' },
    [ProductStatus.DRAFT]: { severity: 'warn', label: 'Draft' },
    [ProductStatus.PENDING]: { severity: 'danger', label: 'Pending' }
};

export interface IWpImage {
    id: number;
    localSrc: string;
    siteMappings: IWpImageSiteMapping[];
    tempName: string;
    isTemp: boolean;
    isPrimary: boolean;
    parent?: IWpImage;
    isVideo?: boolean;
}
export interface IWpImageSiteMapping {
    id: number;
    siteId: number;
    wpMediaId: number;
    wpUrl: string;
    orderIndex: number;
}

export interface IWpProductSiteConfig {
    id?: number;
    price: number;
    regularPrice: number;
    sku?: string;
    slug?: string;
    site: ISite;
}

export interface CurrencyCalc {
    fromAmount: number;
    fromCode: string;
    toCode: string;
    rsAmount?: number;
}


