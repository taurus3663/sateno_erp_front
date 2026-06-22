import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ROUTES } from '../api.routes';

@Injectable({ providedIn: 'root' })
export class ChatGptSettingsService {
    private http = inject(HttpClient);
    private messageService = inject(MessageService);

    public isLoading = signal(false);
    public isSaving = signal(false);
    public config = signal<Record<string, string>>({
        apiKey: '',
        model: 'gpt-4o',
        temperature: '1.0'
    });

    load() {
        this.isLoading.set(true);
        this.http.get<Record<string, string>>(ROUTES.chatgpt.get).subscribe({
            next: (data) => {
                this.config.set({
                    apiKey: data['apiKey'] ?? '',
                    model: data['model'] ?? 'gpt-4o',
                    temperature: data['temperature'] ?? '1.0'
                });
                this.isLoading.set(false);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Грешка', detail: 'Неуспешно зареждане на настройките' });
                this.isLoading.set(false);
            }
        });
    }

    save() {
        this.isSaving.set(true);
        this.http.post<void>(ROUTES.chatgpt.save, this.config()).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Настройките са записани' });
                this.isSaving.set(false);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Грешка', detail: 'Неуспешен запис' });
                this.isSaving.set(false);
            }
        });
    }
}
