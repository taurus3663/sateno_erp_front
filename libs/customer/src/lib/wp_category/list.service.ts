import { inject, Injectable } from '@angular/core';
import { BaseListCrud} from 'xl-util';
import { IWpCategory } from './interfaces';
import {ROUTES} from '../api.routes';
import { WpCategoryDetailService } from './detail.service';
import { TreeNode } from 'primeng/api';


@Injectable({
    providedIn: 'root'
})
export class WpCategoryListService extends BaseListCrud<TreeNode<IWpCategory>> {
    listRoute = ROUTES.wp_category.list;
    protected getChildren = ROUTES.wp_category.find;

    constructor() {
        super(inject(WpCategoryDetailService) as any);
    }

//     /**
//      * Презаписваме зареждането на децата (специфично за дървото)
//      */
    loadChildren(node: TreeNode<IWpCategory>) {
        this.loading.set(true);
        // Използваме wpId от данните на възела
        const parentId = node.data?.id;

        return this.http.get<TreeNode<IWpCategory>[]>(`${this.getChildren}/${parentId}`).subscribe(children => {
            node.children = children;
            // Обновяваме сигнала, за да се рендерира промяната
            this.items.set([...this.items()]);
            this.loading.set(false);
        });
    }
//
//     // Трябва да презапишем и изтриването, защото id-то е вътре в data
//     override removeLocalItem(id: any) {
//         this.items.update((arr) => arr.filter(i => i.data?.id !== id));
//         this.totalRecords.update((n) => n - 1);
//     }
}
