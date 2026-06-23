import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from 'xl-layout';

const modules = [
    import('customer'),
    import('xl-auth')
];

fetch('/assets/config.json')
    .then(r => r.json())
    .then(config => {
        (window as any).__APP_CONFIG__ = config;
    })
    .catch(() => {
        // При грешка (напр. локална разработка без config.json) — продължаваме с defaults
    })
    .finally(() => {
        Promise.all(modules)
            .then(() => bootstrapApplication(AppComponent, appConfig))
            .catch(err => console.error('Грешка при инициализация на модулите:', err));
    });

