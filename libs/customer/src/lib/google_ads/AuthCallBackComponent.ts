import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-auth-callback',
    template: `<div style="padding: 20px; text-align: center;">Обработка на достъпа...</div>`,
    standalone: true
})
export class AuthCallbackComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const code = params['code'];
            const id = params['state'];

            if (code && id) {
                // Викаме твоя ендпойнт за финализиране в Java
                this.http.get(`ads/google/callback?code=${code}&state=${id}`, { responseType: 'text' })
                    .subscribe({
                        next: () => {
                            // Затваряме прозореца, след като всичко е готово
                            window.close();
                        },
                        error: (err) => {
                            console.error('Грешка при запис на токена', err);
                        }
                    });
            }
        });
    }
}
