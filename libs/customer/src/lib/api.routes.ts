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

    private static readonly wpCategoryBase = 'wp_category';
    public readonly wp_category = {
        list: `${apiRoutes.wpCategoryBase}/list`,
        get: `${apiRoutes.wpCategoryBase}/detail`,
        save: `${apiRoutes.wpCategoryBase}/save`,
        delete: `${apiRoutes.wpCategoryBase}/delete`,
        find: `${apiRoutes.wpCategoryBase}/find`,
        getTranslation: `${apiRoutes.wpCategoryBase}/get/translation`,
        updateTranslation: `${apiRoutes.wpCategoryBase}/update/translation`,
        updateParentNode: `${apiRoutes.wpCategoryBase}/update/parentnode`,
    }

    private static readonly wpAddonBase = 'wp_addon';
    public readonly wp_addon = {
        list: `${apiRoutes.wpAddonBase}/list`,
        get: `${apiRoutes.wpAddonBase}/detail`,
        save: `${apiRoutes.wpAddonBase}/save`,
        delete: `${apiRoutes.wpAddonBase}/delete`,
        get_translation: `${apiRoutes.wpAddonBase}/get/translation`,
        save_translation: `${apiRoutes.wpAddonBase}/save/translation`,
        save_value: `${apiRoutes.wpAddonBase}/save/value`,
        values_all: `${apiRoutes.wpAddonBase}/list/values`,
        get_selected_values: `${apiRoutes.wpAddonBase}`,
    }

    private static readonly wpAddonValueBase = 'wp_addon_value';
    public readonly wp_addon_value = {
        list: `${apiRoutes.wpAddonValueBase}/list`,
        get: `${apiRoutes.wpAddonValueBase}/detail`,
        save: `${apiRoutes.wpAddonValueBase}/save`,
        delete: `${apiRoutes.wpAddonValueBase}/delete`,
        get_translation: `${apiRoutes.wpAddonValueBase}/get/translation`,
        save_translation: `${apiRoutes.wpAddonValueBase}/save/translation`,
        save_value: `${apiRoutes.wpAddonValueBase}/save/value`,
        values_all: `${apiRoutes.wpAddonValueBase}/list/values`,
        get_selected_values: `${apiRoutes.wpAddonValueBase}`,
    }

    private static readonly wpProductBase = 'wp_product';
    public readonly wp_product = {
        list: `${apiRoutes.wpProductBase}/list`,
        get: `${apiRoutes.wpProductBase}/detail`,
        save: `${apiRoutes.wpProductBase}/save`,
        delete: `${apiRoutes.wpProductBase}/delete`,
    }
}

export const ROUTES = new apiRoutes();
