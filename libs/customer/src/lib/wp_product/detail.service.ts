import { effect, Injectable, signal } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { ICategoryNode, IWpProduct } from './interfaces';
import { ROUTES } from '../api.routes';


@Injectable({ providedIn: 'root' })
export class WpProductDetailService extends BaseDetailCrud<IWpProduct> {
    override saveRoute: string = ROUTES.wp_product.save;
    override getRoute: string = ROUTES.wp_product.get;
    override deleteRoute: string = ROUTES.wp_product.delete;

    constructor() {
        super();

        effect(() => {
            const data = this.selectionService.selectedItem();
            if (data && this.isVisible()) {
                this.selected(data);
            }
        });
    }

    private selected(data: any) {
        const current = this.selectedItem(); // Вземаме текущия сигнал
        if (current) {
            this.selectedItem.set({
                ...current
            });
        }
    }

    override openEditDialog(item: IWpProduct) {
        this.selectedItem.set({ ...item });
        this.isVisible.set(true);
        this.loading.set(true);

        this.http.get<IWpProduct>(`${ROUTES.wp_product.get}/${item.id}`).subscribe({
            next: (fullData) => {
                this.selectedItem.set(fullData);

                // Ако категориите вече са заредени, просто ги "светваме"
                if (this.categoryNodes().length > 0) {
                    this.syncSelectedCategories();
                } else {
                    this.loadAllCategories();
                }
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }


    // В WpProductDetailService
    selectedNodeMap = signal<any>({});
    categoryNodes = signal<any[]>([]); // Превръщаме и това в сигнал за по-добра реактивност

    loadAllCategories() {
        this.http.get<ICategoryNode[]>(`${ROUTES.wp_category.all}`).subscribe(flatData => {
            const tree = this.buildTree(flatData);
            this.categoryNodes.set(tree); // Сетваме сигнала
            this.syncSelectedCategories();
        });
    }

    buildTree(flatNodes: any[]): any[] {
        const map = new Map<number, any>();
        const roots: any[] = [];

        // 1. Първо създаваме всички възли в Map
        flatNodes.forEach(node => {
            const id = node.data.id;
            map.set(id, {
                key: id.toString(),
                label: node.data.name,
                data: node.data,
                children: [],
                expanded: true // Автоматично разпънати за лесна работа
            });
        });

        // 2. Свързваме децата към родителите им
        flatNodes.forEach(node => {
            const treeNode = map.get(node.data.id);
            const parentId = node.data.parentId;

            // Ако има родител и този родител съществува в нашия списък
            if (parentId !== null && map.has(parentId)) {
                map.get(parentId).children.push(treeNode);
            } else {
                // Ако няма родител (parentId е null), значи е корен (root)
                roots.push(treeNode);
            }
        });

        return roots;
    }

    // 1. Промени типа на сигнала на масив
    selectedNodesArray = signal<any[]>([]);

// 2. Обновеният метод за синхронизация (търсим реалните обекти в дървото)
    syncSelectedCategories() {
        const item = this.selectedItem();
        const allNodes = this.categoryNodes();

        if (item && item.categories && allNodes.length > 0) {
            const newArray: any[] = [];
            item.categories.forEach((cat: any) => {
                const foundNode = this.findNodeRecursive(allNodes, cat.id.toString());
                if (foundNode) {
                    newArray.push(foundNode);
                }
            });
            this.selectedNodesArray.set([...newArray]);
        } else {
            this.selectedNodesArray.set([]);
        }
    }

// 3. Метод за подготовка преди Save (вадим само ID-тата от избраните обекти)
    prepareCategoriesForSave() {
        const item = this.selectedItem();
        const selectedNodes = this.selectedNodesArray(); // Това вече е масив от обекти

        if (item && selectedNodes) {
            // map-ваме обектите към формат, който Java бекендът разбира
            item.categories = selectedNodes.map(node => ({
                id: parseInt(node.key)
            } as any));
        }
    }


// Помощна функция за намиране на възел в дървото:
    private findNodeRecursive(nodes: any[], key: string): any {
        for (const node of nodes) {
            if (node.key === key) return node;
            if (node.children) {
                const found = this.findNodeRecursive(node.children, key);
                if (found) return found;
            }
        }
        return null;
    }


}
