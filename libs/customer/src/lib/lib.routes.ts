    import { registerMenu, registerRoute, registerTopbarAction } from 'xl-util';
import { PrimeIcons } from 'primeng/api';
import {CustomerListComponent} from './customer/list';
import { WpCategoryListComponent } from './wp_category/list';
export const moduleActivator = true;
registerRoute([
    {
        path: 'customer/list',
        loadComponent: () => import('./customer/list').then(c => c.CustomerListComponent)
    },
    {
        path: 'currency/list',
        loadComponent: () => import('./currency/list').then(c => c.CurrencyListComponent)
    },
    {
        path: 'site/list',
        loadComponent: () => import('./site/list').then(c => c.SiteListComponent)
    },
    {
        path: 'language/list',
        loadComponent: () => import('./language/list').then(c => c.LanguageListComponent)
    },
    {
        path: 'wp_category/list',
        loadComponent: () => import('./wp_category/list').then(c => c.WpCategoryListComponent)
    },
    {
        path: 'wp_addon/list',
        loadComponent: () => import('./wp_addon/list').then(c => c.WpAddonListComponent)
    },
    {
        path: 'wp_addon_value/list',
        loadComponent: () => import('./wp_addon_value/list').then(c => c.WpAddonValueListComponent)
    },
    {
        path: 'wp_product/list',
        loadComponent: () => import('./wp_product/list').then(c => c.WpProductListComponent)
    },
    {
        path: 'wp_brand/list',
        loadComponent: () => import("./wp_brand/list").then(c => c.WpBrandListComponent)
    },
    {
        path: 'wp_order/list',
        loadComponent: () => import("./wp_order/list").then(c => c.OrderListComponent)
    },
    {
        path: 'courier/list',
        loadComponent: () => import('./courier/list').then(c => c.CourierListComponent)
    },
    {
        path: 'email/list',
        loadComponent: () => import('./email/list').then(c => c.EmailListComponent)
    },
    {
        path: 'email/send/list',
        loadComponent: () => import('./email/send/list').then(c => c.EmailSendListComponent)
    },
    {
        path: 'email/receive/list',
        loadComponent: () => import('./email/receive/list').then(c => c.EmailReceiveListComponent)
    },
    {
        path: 'scheme_wp_product/list',
        loadComponent: () => import('./wp_product_scheme/list').then(c => c.WpProductSchemeListComponent)
    },
    {
        path: 'discount/list',
        loadComponent: () => import('./discount_phone/list').then(c => c.DiscountPhoneListComponent)
    }
]);
    registerMenu([
        // {
        //   label: 'ПОРЪЧКИ ОТ СИСТЕМИ ',
        //   items: [
        //       {
        //           label: 'Поръчки'
        //       }
        //   ]
        // },
        {
            label: '',
            items: [
                {
                    label: 'Поръчки',
                    icon: PrimeIcons.EURO,
                    routerLink: ['/wp_order/list']
                },
                {
                    label: 'Продукти',
                    icon: PrimeIcons.PALETTE,
                    routerLink: ['/wp_product/list']
                },
                {
                    label: "Шаблон за продукти",
                    icon: PrimeIcons.DISCORD,
                    routerLink: ['/scheme_wp_product/list']
                },
                {
                    label: "Промоционални номера",
                    icon: PrimeIcons.MEGAPHONE,
                    routerLink: ['/discount/list']
                }
            ]
        },
        {
            label: '',
            items: [
                {
                    label: 'Kонтрактор',
                    icon: PrimeIcons.RECEIPT,
                    items: [
                        {
                            label: 'Kлиенти',
                            icon: PrimeIcons.USERS,
                            routerLink: ['/customer/list']
                        }
                    ]
                }
            ]
        },
        {
            label: '',
            items: [
                {
                    label: 'Настройки',
                    icon: PrimeIcons.SLIDERS_H,
                    items: [
                        {
                            label: 'Валути',
                            icon: PrimeIcons.MONEY_BILL,
                            routerLink: ['/currency/list']
                        },
                        {
                            label: 'Сайтове',
                            icon: PrimeIcons.SITEMAP,
                            routerLink: ['/site/list']
                        },
                        {
                            label: "Език-Сайт",
                            icon: PrimeIcons.LANGUAGE,
                            routerLink: ['/language/list']
                        },
                        {
                            label: "КУРИЕР",
                            icon: PrimeIcons.PALETTE,
                            routerLink: ['/courier/list']
                        }
                    ]
                }
            ]
        },
        {
            label: '',
            items: [
                {
                    label: 'Склад',
                    icon: PrimeIcons.RECEIPT,
                    items: [
                        {
                            label: 'Категория',
                            icon: PrimeIcons.CHART_SCATTER,
                            routerLink: ['/wp_category/list']
                        },
                        {
                            label: 'Аддон',
                            icon: PrimeIcons.LIST,
                            routerLink: ['/wp_addon/list']
                        },
                        {
                            label: 'Аддон стойност',
                            icon: PrimeIcons.LIST_CHECK,
                            routerLink: ['/wp_addon_value/list']
                        },
                        {
                            label: 'Марки',
                            icon: PrimeIcons.BRIEFCASE,
                            routerLink: ['/wp_brand/list']
                        }
                    ]
                }
            ]
        },
        {
            label: '',
            items: [
                {
                    label: 'Имейл',
                    icon: PrimeIcons.STAR,
                    items: [
                        {
                            label: 'Профили',
                            icon: PrimeIcons.STOP,
                            routerLink: ['/email/list']
                        },
                        {
                            label: 'Изпратени',
                            icon: PrimeIcons.STOP,
                            routerLink: ['/email/send/list']
                        },
                        {
                            label: 'Получени',
                            icon: PrimeIcons.STOP,
                            routerLink: ['/email/receive/list']
                        }
                    ]
                }
            ]
        }
    ]);

// registerTopbarAction(CustomerListComponent);
