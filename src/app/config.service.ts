import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {
    get apiUrl(): string {
        return (window as any).__APP_CONFIG__?.apiUrl ?? environment.apiUrl;
    }
}
