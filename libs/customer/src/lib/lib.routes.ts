import { registerMenu, registerRoute, registerTopbarAction } from 'xl-util';
import { PrimeIcons } from 'primeng/api';
import {CustomerListComponent} from './customer/list';
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
    }
]);
    registerMenu([
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
                        }
                    ]
                }
            ]
        }
    ]);

// registerTopbarAction(CustomerListComponent);
