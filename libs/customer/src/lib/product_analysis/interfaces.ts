export interface IProductAnalysisItem {
    sku: string;
    productName: string;
    orderCount: number;
    rating: 'A' | 'B' | 'C' | 'D';
}

export interface IProductAnalysisThresholds {
    dMax: number;
    cMax: number;
    bMax: number;
}
