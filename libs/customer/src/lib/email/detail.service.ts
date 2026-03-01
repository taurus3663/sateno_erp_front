import { Injectable, signal } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { IEmail } from './interfaces';
import { ROUTES } from '../api.routes';

@Injectable({providedIn: 'root'})
export class EmailDetailService extends BaseDetailCrud<IEmail> {
    override saveRoute: string = ROUTES.email.save;
    override getRoute: string = ROUTES.email.get;
    override deleteRoute: string = ROUTES.email.delete;

    constructor() {
        super();
    }

    // private messageService = inject(MessageService);
    public isTestingConnection = signal(false);
    public isTestingIncomingConnection = signal(false);

    testConnection(id: number) {
        if (!id) return;

        this.isTestingConnection.set(true);

        this.http.post<any>(`${ROUTES.email.test}/${id}`, {}).subscribe({
            next: (res) => {
                if (res.success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'SMTP Connection established successfully!'
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Connection Failed',
                        detail: res.message || 'Could not connect to SMTP server'
                    });
                }
                this.isTestingConnection.set(false);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Server error during testing'
                });
                this.isTestingConnection.set(false);
            }
        });
    }

    testIncomingConnection(id: number) {
        if (!id) return;
        this.isTestingIncomingConnection.set(true);

        this.http.post<any>(`${ROUTES.email.testIncome}/${id}`, {}).subscribe({
            next: (res) => {
                if (res.success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'IMAT/POP3 Connection established successfully!'
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Connection Failed',
                        detail: res.message || 'Could not connect to IMAT/POP3 server'
                    });
                }
                this.isTestingConnection.set(false);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Server error during testing'
                });
                this.isTestingConnection.set(false);
            }
        })

    }


}
