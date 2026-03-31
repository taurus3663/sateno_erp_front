import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Routes, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { provideAuth, AuthInterceptor, AuthGuard } from 'xl-auth';
import { XL_AUTH_GUARD_TOKEN, XL_TOPBAR_CONFIG } from 'xl-util';
import {appRoutes} from 'xl-layout';

import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { XL_API_URL } from '../libs/xl-util/src/lib/ws/WsToken';

const finalRoutes: Routes = [
    ...appRoutes,
    {
        path: '',
        loadChildren: () => import('./app/pages/auth/auth.routes')
    },
    {
        path: 'notfound',
        loadComponent: () => import('./app/pages/notfound/notfound').then(value => value.Notfound)
    }
];
const API_URL = 'http://192.168.31.232:9494';
// const API_URL = 'https://erp.sateno.bg';
export const appConfig: ApplicationConfig = {
    providers: [
        DialogService,
        provideAuth({
            // apiUrl: 'http://192.168.31.232:9494'
            // apiUrl: 'https://erp.sateno.bg'
            apiUrl: API_URL,
        }),
        { provide: XL_API_URL, useValue: API_URL },
        provideHttpClient(withFetch(), withInterceptors([AuthInterceptor])),
        provideRouter(finalRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        // provideHttpClient(withFetch()),
        // provideHttpClient(
        //     withInterceptors(a]),
        //     withFetch()),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        {
            provide: XL_AUTH_GUARD_TOKEN,
            useClass: AuthGuard
        },
        {
            provide: XL_TOPBAR_CONFIG,
            useValue: {
                name: '',
                logoUrl: 'assets/img/sateno.png',
                logoStyle: { width: '100%', height: '110px' },
                clickUrl: 'wp_order/list'
            }
        },
        provideTranslateService({
            loader: provideTranslateHttpLoader({
                prefix: 'assets/i18n/',
                suffix: '.json'
            }),
            fallbackLang: 'en',
            lang: 'bg'
        }),
        MessageService,
        ConfirmationService
    ]
};
