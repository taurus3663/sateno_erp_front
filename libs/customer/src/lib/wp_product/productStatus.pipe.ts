import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProductStatus } from './interfaces';

@Pipe({ name: 'statusLabel', pure: true, standalone: true })
export class StatusLabelPipe implements PipeTransform {
    constructor(private tr: TranslateService) {}

    transform(value: any): string {
        if (!value) return '';
        const statusKey = ProductStatus[value];
        return statusKey ? this.tr.instant('PRODUCT_STATUS.' + statusKey) : value;
    }
}
