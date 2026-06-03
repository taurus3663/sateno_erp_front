import { Component, inject } from '@angular/core';
import { GoogleAdsListService } from './list.service';
import { GoogleAdsDetailService } from './detail.service';
import { TranslateService } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IGoogleAds } from './interface';


@Component({
    selector: 'google_ads-list',
    standalone: true,
    imports: [],
    template: `

    `
})
export class GoogleAdsListComponent {
    public listService = inject(GoogleAdsListService);
    public detailService = inject(GoogleAdsDetailService);
    private tr = inject(TranslateService);
    protected config = inject(DynamicDialogConfig, { optional: true });
    private ref = inject(DynamicDialogRef, { optional: true });

    selectedItem!: IGoogleAds[] | null;

    onLazyLoad(event: any) {
        this.listService.loadList(event.first, event.rows, event.filters);
    }

    onRowClick(item: any) {
        if (this.config?.data?.mode === 'lookup') {
            if (this.ref) {
                this.ref.close(item);
            }
        }
    }

    onDelete(id: any) {
        if (confirm(this.tr.instant('Are_you_sure?'))) {
            this.listService.deleteItem(id);
        }
    }

}
