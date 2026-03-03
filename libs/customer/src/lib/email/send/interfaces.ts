import { IEmail } from '../interfaces';

export interface IEmailSend {
    id: number;
    sender: string;
    subject: string;
    body: string;
    success: boolean;
    errorMessage: string;
    config: IEmail;
    direction: EmailDirection;
    seen: boolean;
    confirmed: boolean;
    recipient: string;
    createTime: string
}
export enum EmailDirection {
    SENT,
    RECEIVED,
}
