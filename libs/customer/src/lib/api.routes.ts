export class apiRoutes {

    private crud(base: string) {
        return {
            list: `${base}/list`,
            getd: `${base}/detail`,
            save: `${base}/save`,
            delete: `${base}/delete`,
            get: `${base}`,
        };
    }



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
        sync: `${apiRoutes.wpCategoryBase}/sync`,
        all: `${apiRoutes.wpCategoryBase}/all`,
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
        sync: `${apiRoutes.wpProductBase}/sync`,
        upload_template: `${apiRoutes.wpProductBase}/upload_temp`,
        get_selected_addon_values: `${apiRoutes.wpProductBase}/get_addon_values`,
        patch: `${apiRoutes.wpProductBase}/patch`,
        translateProductContent: `${apiRoutes.wpProductBase}/translate/content`,
    }

    private static readonly wpBrandBase = 'wp_brand';
    public readonly wp_brand = {
        list: `${apiRoutes.wpBrandBase}/list`,
        get: `${apiRoutes.wpBrandBase}/detail`,
        save: `${apiRoutes.wpBrandBase}/save`,
        delete: `${apiRoutes.wpBrandBase}/delete`,
        sync: `${apiRoutes.wpBrandBase}/sync`,
    }

    private static readonly wpOrderBase = 'wp_order';
    public readonly wp_order = {
        list: `${apiRoutes.wpOrderBase}/list`,
        get: `${apiRoutes.wpOrderBase}/detail`,
        save: `${apiRoutes.wpOrderBase}/save`,
        delete: `${apiRoutes.wpOrderBase}/delete`,
        patch: `${apiRoutes.wpOrderBase}/patch`,
        sync: `${apiRoutes.wpOrderBase}/sync`,
        createWayBill: `${apiRoutes.wpOrderBase}/create/waybill`,
        deleteWayBill: `${apiRoutes.wpOrderBase}/delete/waybill`,
        generateWayBillPrint: (orderId: number, waybillId: string | string[], paperSize: string) =>
            `${apiRoutes.wpOrderBase}/generate/waybill/${orderId}/${waybillId}/${paperSize}`,
        cancelShipment: (orderId: number) => `${apiRoutes.wpOrderBase}/cancel-shipment/${orderId}`,
        getStatusStats: `${apiRoutes.wpOrderBase}/status/stats`,
    }

    private static readonly courierBase = 'courier';
    public readonly courier = {
        list: `${apiRoutes.courierBase}/list`,
        get: `${apiRoutes.courierBase}/detail`,
        save: `${apiRoutes.courierBase}/save`,
        delete: `${apiRoutes.courierBase}/delete`,
        test_connection: `${apiRoutes.courierBase}/test-connection`,
    }

    private static readonly emailBase = 'email';
    // public readonly email = this.crud(apiRoutes.emailBase);
    public readonly email = {
        ...this.crud(apiRoutes.emailBase),
        test: `${apiRoutes.emailBase}/test-connection`,
        testIncome: `${apiRoutes.emailBase}/test-income-connection`,
        sent_list: `${apiRoutes.emailBase}/sent/list`,
        sent_list_save: `${apiRoutes.emailBase}/sent/save`,
        sent_list_delete: `${apiRoutes.emailBase}/sent/delete`,

        receive_list: `${apiRoutes.emailBase}/receive/list`,
        receive_list_save: `${apiRoutes.emailBase}/receive/save`,
        receive_list_delete: `${apiRoutes.emailBase}/receive/delete`,
    }

    // private static readonly emailSendBase = 'email_send';
    // public readonly emailSend = {
    //     ...this.crud(apiRoutes.emailSendBase),
    // }

    private static readonly checkout = 'checkout';
    public readonly checkout = {
        recalculate_price: `${apiRoutes.checkout}/recalculate-price`,
        recalculate_price_custom_field: `${apiRoutes.checkout}/recalculate-price-custom-field-shipping-price`,
    }

    private static readonly schemeWpproduct = 'scheme_wp_product';
    public readonly schemeWpproduct = {
        ...this.crud(apiRoutes.schemeWpproduct),
    }

    private static readonly aiProductInfoGen = 'ai_product_info_gen';
    public readonly aiProductInfoGen = {
        ...this.crud(apiRoutes.aiProductInfoGen),
    }

}

export const ROUTES = new apiRoutes();
