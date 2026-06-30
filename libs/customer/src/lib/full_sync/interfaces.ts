export type SyncStep = 'IDLE' | 'BRANDS' | 'CATEGORIES' | 'PRODUCTS' | 'ATTRIBUTES' | 'ORDERS' | 'DONE' | 'ERROR';

export interface ISyncStatus {
    step: SyncStep;
    siteId?: number;
    siteName?: string;
    logs: string[];
    errorMessage?: string;
    elapsedSeconds: number;
}
