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
        path: '',
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
    },
    {
        path: 'product_history/list',
        loadComponent: () => import('./product_history/list').then(c => c.WpProductHistoryListComponent)
    },
    {
        path: 'product_order/list',
        loadComponent: () => import('./product_menu_order/list').then(c => c.ProductMenuOrderListComponent)
    },
    {
        path: 'meta_ads/list',
        loadComponent: () => import('./meta_ads/list').then(c => c.MetaAdsListComponent)
    },
    {
        path: 'advertisements/statistic',
        loadComponent: () => import('./advertisements/detail').then(c => c.AdvertisementDetailComponent)
    },
    {
        path: 'google_ads/list',
        loadComponent: () => import('./google_ads/list').then(c => c.GoogleAdsListComponent)
    },
    // В app-routing.module.ts
    {
        path: 'api/ads/google/callback',
        loadComponent: () => import('./google_ads/AuthCallBackComponent').then(c => c.AuthCallbackComponent) // Създай празен компонент, който не прави нищо
    },
    {
        path: 'wp_attribute/list',
        loadComponent: () => import('./wp_attribute/list').then(c => c.WpAttributeListComponent)
    },
    {
        path: 'ai_settings/chatgpt',
        loadComponent: () => import('./ai_settings/chatgpt').then(c => c.ChatGptSettingsComponent)
    }
]);
    registerMenu([
        {
            label: '',
            items: [
                {
                    label: 'menu.Orders',
                    icon: PrimeIcons.EURO,
                    routerLink: ['/wp_order/list']
                },
                {
                    label: 'menu.Products',
                    icon: PrimeIcons.PALETTE,
                    routerLink: ['/wp_product/list']
                },
                {
                    label: 'menu.Product_Scheme',
                    icon: PrimeIcons.DISCORD,
                    routerLink: ['/scheme_wp_product/list']
                },
                {
                    label: 'menu.Promotional_Numbers',
                    icon: PrimeIcons.MEGAPHONE,
                    routerLink: ['/discount/list']
                },
                { label: 'menu.Product_History', icon: PrimeIcons.HISTORY, routerLink: ['product_history/list'] },
                {
                    label: 'menu.Product_Ordering',
                    icon: PrimeIcons.SORT,
                    routerLink: ['product_order/list']
                }
            ]
        },
        {
            label: '',
            items: [
                {
                    label: 'menu.Contractor',
                    icon: PrimeIcons.RECEIPT,
                    items: [
                        {
                            label: 'menu.Customers',
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
                    label: 'menu.Settings',
                    icon: PrimeIcons.SLIDERS_H,
                    items: [
                        {
                            label: 'menu.Currencies',
                            icon: PrimeIcons.MONEY_BILL,
                            routerLink: ['/currency/list']
                        },
                        {
                            label: 'menu.Sites',
                            icon: PrimeIcons.SITEMAP,
                            routerLink: ['/site/list']
                        },
                        {
                            label: 'menu.Language_Site',
                            icon: PrimeIcons.LANGUAGE,
                            routerLink: ['/language/list']
                        },
                        {
                            label: 'menu.Courier',
                            icon: PrimeIcons.PALETTE,
                            routerLink: ['/courier/list']
                        },
                        {
                            label: 'menu.Meta',
                            icon: PrimeIcons.FACEBOOK,
                            routerLink: ['/meta_ads/list']
                        },
                        {
                            label: 'menu.Google',
                            icon: PrimeIcons.GOOGLE,
                            routerLink: ['google_ads/list']
                        },
                        {
                            label: 'menu.ChatGPT',
                            icon: PrimeIcons.SPARKLES,
                            routerLink: ['/ai_settings/chatgpt']
                        }
                    ]
                }
            ]
        },
        {
            label: '',
            items: [
                {
                    label: 'menu.Warehouse',
                    icon: PrimeIcons.RECEIPT,
                    items: [
                        {
                            label: 'menu.Category',
                            icon: PrimeIcons.CHART_SCATTER,
                            routerLink: ['/wp_category/list']
                        },
                        {
                            label: 'menu.Addon',
                            icon: PrimeIcons.LIST,
                            routerLink: ['/wp_addon/list']
                        },
                        {
                            label: 'menu.Addon_Value',
                            icon: PrimeIcons.LIST_CHECK,
                            routerLink: ['/wp_addon_value/list']
                        },
                        {
                            label: 'menu.Brands',
                            icon: PrimeIcons.BRIEFCASE,
                            routerLink: ['/wp_brand/list']
                        },
                        {
                            label: 'menu.Attributes',
                            icon: PrimeIcons.TAG,
                            routerLink: ['/wp_attribute/list']
                        }
                    ]
                }
            ]
        },
        {
            label: '',
            items: [
                {
                    label: 'menu.Email',
                    icon: PrimeIcons.STAR,
                    items: [
                        {
                            label: 'menu.Profiles',
                            icon: PrimeIcons.STOP,
                            routerLink: ['/email/list']
                        },
                        {
                            label: 'menu.Sent',
                            icon: PrimeIcons.STOP,
                            routerLink: ['/email/send/list']
                        },
                        {
                            label: 'menu.Received',
                            icon: PrimeIcons.STOP,
                            routerLink: ['/email/receive/list']
                        }
                    ]
                }
            ]
        },
        {
            label: '',
            items: [
                {
                    label: 'menu.Ad_Statistics',
                    icon: PrimeIcons.CHART_SCATTER,
                    routerLink: ['/advertisements/statistic']
                },
            ]
        }
    ]);

// registerTopbarAction(CustomerListComponent);
