import { Component, inject } from '@angular/core';
import { WpProductHistoryListService } from './list.service';
import { TranslateService } from '@ngx-translate/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';


@Component({
    selector: 'wp_product_history_list',
    standalone: true,
    imports: [],
    template: `

    `
})
export class WpProductHistoryListComponent {
    protected listService = inject(WpProductHistoryListService);
    protected tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });


    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters, event.sortField, event.sortOrder);
    }
}
