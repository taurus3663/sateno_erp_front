import { effect, Injectable, signal } from '@angular/core';
import { BaseDetailCrud } from 'xl-util';
import { ICategoryNode, IWpProduct } from './interfaces';
import { ROUTES } from '../api.routes';
import { IWpCategory } from '../wp_category/interfaces';
import { IWpAddon, IWpAddonDetailDto } from '../wp_addon/interfaces';
import { IWpAddonValue } from '../wp_addon_value/interfaces';


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

    override openCreateDialog() {
        // 1. Изчистваме обекта (базова логика)
        this.selectedItem.set({
            unit: 0,
            translations: [],
            categories: [],
            images: [],
            stockQuantity: 0
        } as any);

        // 2. КЛЮЧОВАТА ЧАСТ: Нулираме масива с избрани категории в дървото
        this.selectedNodesArray.set([]);

        // 3. Показваме диалога
        this.isVisible.set(true);
    }

    // В WpProductDetailService
    selectedNodeMap = signal<any>({});
    categoryNodes = signal<any[]>([]); // Превръщаме и това в сигнал за по-добра реактивност

    loadAllCategories() {
        this.http.get<ICategoryNode[]>(`${ROUTES.wp_category.all}`).subscribe((flatData) => {
            const tree = this.buildTree(flatData);
            this.categoryNodes.set(tree); // Сетваме сигнала
            this.syncSelectedCategories();
        });
    }

    buildTree(flatNodes: any[]): any[] {
        const map = new Map<number, any>();
        const roots: any[] = [];

        // 1. Първо създаваме всички възли в Map
        flatNodes.forEach((node) => {
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
        flatNodes.forEach((node) => {
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
            item.categories = selectedNodes.map((node) => {
                // Тъй като това е TreeNode, данните са в property-то 'data'
                const categoryData = node.data;

                console.log('Found ID:', categoryData?.id); // Вече не трябва да е undefined

                return categoryData;
            }) as IWpCategory[];
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

    override saveItem(item: IWpProduct) {
        if (!item) return;

        // 1. Подготовка на категориите (вече имаш метода)
        this.prepareCategoriesForSave();

        // 2. Филтриране на преводите (пращаме само попълнените)
        if (item.translations) {
            item.translations = item.translations.filter((t) => t.name && t.name.trim() !== '');
        }

        // 3. ПРЕЧИСТВАНЕ НА АДОНИТЕ (Премахваме translations, за да не гърми Java-та)
        if (item.addonConfigs) {
            item.addonConfigs.forEach(config => {
                if (config.addonValue) {
                    // Изтриваме преводите - пращаме само ID-то, което е важно за връзката
                    delete (config.addonValue as any).translations;
                    delete (config.addonValue as any).names;
                }
            });
        }

        // 3. Извикваме оригиналния запис на BaseDetailCrud с вече "чистия" обект
        super.saveItem(item);
    }

    // В detail.service.ts

    clearSelection() {
        this.selectedItem.set({
            id: 0,
            unit: 0,
            translations: [],
            categories: [],
            images: [],
            stockQuantity: 0
        } as any);

        // ТОВА Е КЛЮЧЪТ: Нулираме избраните категории в дървото
        this.selectedNodesArray.set([]);
    }

    selectedAddonGroup: any;
    selectedAddonValues: IWpAddonValue[] = [];
    isLoadingAddonValues = signal<boolean>(false);
    // В WpCategoryDetailComponent
    onAddonGroupChange(event: any) {
        const groupId = event.value?.id;
        if (!groupId) {
            this.selectedAddonValues = [];
            return;
        }

        this.isLoadingAddonValues.set(true);
        this.selectedAddonValues = []; // Чистим веднага, за да няма визуален "глич"

        this.http.get<any>(`${ROUTES.wp_product.get_selected_addon_values}/${groupId}`).subscribe({
            next: (res) => {
                this.selectedAddonValues = (res as IWpAddonDetailDto).selectedValues ?? [];
                this.isLoadingAddonValues.set(false);
            },
            error: (err) => {
                console.error('Error loading addon values:', err);
                this.isLoadingAddonValues.set(false); // Важно!
                // Тук можеш да добавиш Toast съобщение за грешка
            }
        });
    }
}
