import { inject, Injectable } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { ILanguage } from './interfaces';
import {ROUTES} from '../api.routes';
import {LanguageDetailService} from './detail.service';


@Injectable({
    providedIn: 'root'
})
export class LanguageListService extends BaseListCrud<ILanguage> {
    listRoute = ROUTES.language.list;

    constructor() {
        super(inject(LanguageDetailService));
    }
}
