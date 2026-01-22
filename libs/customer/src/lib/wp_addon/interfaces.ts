// 1. Интерфейс за превод на групата
import { IWpAddonValue } from '../wp_addon_value/interfaces';

export interface IWpAddonTranslation {
    id?: number;
    languageCode: string; // 'bg', 'en'
    name: string;        // "Цвят", "Color"
}

// // 4. Главната Група (Addon Group)
export interface IWpAddon {
    id: number | null;
    slug: string;        // "color"
    translations: { [key: string]: IWpAddonTranslation };
    values: IWpAddonValue[]; // Тези ще се показват в PickList-а
}

export interface IWpAddonDetailDto {
    id?: number;
    slug: string;
    availableValues?: IWpAddonValue[];
    selectedValues?: IWpAddonValue[];
}


