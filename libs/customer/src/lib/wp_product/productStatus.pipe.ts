import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProductStatus } from './interfaces';
import { isNumber } from 'chart.js/helpers';

@Pipe({ name: 'statusLabel', pure: true, standalone: true })
export class StatusLabelPipe implements PipeTransform {
    constructor(private tr: TranslateService) {}

    transform(value: any): string {

        if(!isNumber(value)) return '';
        const statusKey = ProductStatus[value];
        return statusKey ? this.tr.instant('PRODUCT_STATUS.' + statusKey) : '';
    }
}
