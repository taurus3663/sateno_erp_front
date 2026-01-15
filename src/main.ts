import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
// import { AppComponent } from './app.component';
import {AppComponent} from 'xl-layout';
// Професионален "Loader"
const modules = [
    () => import('xl-auth')
];

// bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
Promise.all(modules)
    .then(() => {
        // Чак тук стартираме Angular, след като всички registerRoute са изпълнени
        return bootstrapApplication(AppComponent, appConfig);
    })
    .catch((err) => {
        console.error('Грешка при инициализация на модулите:', err);
    });

