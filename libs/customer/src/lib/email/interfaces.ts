export interface IEmail {
    id: number;
    name: string;

    host: string;
    port: number;
    username: string;
    password: string;
    EmailType: EmailType;
    ssl: boolean;

    hostSmtp: string;
    portSmtp: number;
    usernameSmtp: string;
    passwordSmtp: string;
    sslSmtp: boolean;

    signature: string;
}

export enum EmailType {
    IMAP,
    POP3
}
