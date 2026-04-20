import { IWpImage, IWpProduct } from '../../../wp_product/interfaces';

export interface IAIProductInfoGen {
    schemeId: number;
    step: number;
    refinement: string;
    tempImages?: IWpImage[];
    productInfo?: IWpProduct;
    responseAI?: string;
}
