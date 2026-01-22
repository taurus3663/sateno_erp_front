// 1. Интерфейс за превод на групата
// export interface WpAddonTranslation {
//     id?: number;
//     languageCode: string; // 'bg', 'en'
//     name: string;        // "Цвят", "Color"
// }

// 2. Интерфейс за превод на конкретната стойност (Термин)
export interface IWpAddonValueTranslation {
    id?: number;
    languageCode: string;
    label: string;       // "Зелен", "Green"
}

// 3. Главната Стойност (Option за PickList)
export interface IWpAddonValue {
    id: number | null;
    slug: string;        // "green"
    translations: { [key: string]: IWpAddonValueTranslation }; // Map за лесен достъп по език
}

// // 4. Главната Група (Addon Group)
// export interface WpAddon {
//     id: number | null;
//     slug: string;        // "color"
//     translations: { [key: string]: WpAddonTranslation };
//     values: WpAddonValue[]; // Тези ще се показват в PickList-а
// }
