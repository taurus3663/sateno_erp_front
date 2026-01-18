export class apiRoutes {

    private static readonly customerBase = 'customer';
    public readonly customer = {
        list: `${apiRoutes.customerBase}/list`,
        get: `${apiRoutes.customerBase}/detail`,
        save: `${apiRoutes.customerBase}/save`,
        delete: `${apiRoutes.customerBase}/delete`,
    };

    private static readonly currencyBase = 'currency';
    public readonly currency = {
        list: `${apiRoutes.currencyBase}/list`,
        get: `${apiRoutes.currencyBase}/detail`,
        save: `${apiRoutes.currencyBase}/save`,
        delete: `${apiRoutes.currencyBase}/delete`,
    }

    private static readonly siteBase = 'site';
    public readonly site = {
        list: `${apiRoutes.siteBase}/list`,
        get: `${apiRoutes.siteBase}/detail`,
        save: `${apiRoutes.siteBase}/save`,
        delete: `${apiRoutes.siteBase}/delete`,
    }

    private static readonly languageBase = 'language';
    public readonly language = {
        list: `${apiRoutes.languageBase}/list`,
        get: `${apiRoutes.languageBase}/detail`,
        save: `${apiRoutes.languageBase}/save`,
        delete: `${apiRoutes.languageBase}/delete`,
    }

}

export const ROUTES = new apiRoutes();
