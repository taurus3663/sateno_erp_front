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

export const appConfig: ApplicationConfig = {
    providers: [
        DialogService,
        provideAuth({
            // apiUrl: 'http://192.168.31.232:9494'
            apiUrl: 'http://62.138.14.35:9494'
        }),
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
                logoStyle: { width: '100%', height: '110px' }
            }
        },
        provideTranslateService({
            loader: provideTranslateHttpLoader({
                prefix: 'assets/i18n/',
                suffix: '.json'
            }),
            fallbackLang: 'en',
            lang: 'bg'
        })
    ]
};
