// Типове за финансовия дашборд — огледало на backend DTO-тата.

export interface IFinancialMetrics {
    orders: number;
    productsSold: number;
    revenue: number;
    avgOrderValue: number;
    avgProductValue: number;
    cogs: number;
    shippingCost: number;
    adSpend: number;
    cpa: number | null;
    cpis: number | null;
    grossProfit: number;
    netProfit: number;
    roas: number | null;
    margin: number;
}

export interface IFinancialCard {
    period: string;
    from: string;
    to: string;
    current: IFinancialMetrics;
    previous: IFinancialMetrics;
}

export interface IFinancialDashboard {
    today: IFinancialCard;
    yesterday: IFinancialCard;
    dayBeforeYesterday: IFinancialCard;
    last7Days: IFinancialCard;
    lastMonth: IFinancialCard;
    extraCards: IFinancialCard[];
    currency: string;
    generatedAt: string;
}

/** Тип на показателя — определя форматирането в UI. */
export type MetricType = 'int' | 'money' | 'ratio' | 'percent';

/** Описание на един показател за генеричното изобразяване (лесно разширяемо). */
export interface IMetricDef {
    key: keyof IFinancialMetrics;
    label: string;          // i18n ключ
    type: MetricType;
    higherBetter: boolean;  // дали по-висока стойност е подобрение
    k