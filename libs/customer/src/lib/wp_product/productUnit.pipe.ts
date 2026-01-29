import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProductStatus, ProductUnit } from './interfaces';

@Pipe({ name: 'unitLabel', pure: true, standalone: true })
export class UnitLabelPipe implements PipeTransform {
    constructor(private tr: TranslateService) {}

    transform(value: any): string {
        if (!value) return '';
        const unitKey = ProductUnit[value];
        // Връщаме превода чрез TranslateService
        return unitKey ? this.tr.instant('UNIT.' + unitKey) : value;
    }
}
