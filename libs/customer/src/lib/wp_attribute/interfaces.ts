export interface IWpAttributeType {
    id?: number;
    slug: string;
    multipleValues: boolean;
    translations: Record<string, any>;
    label?: string;
    values?: IWpAttributeValue[];
}

export interface IWpAttributeValue {
    id?: number;
    typeId: number;
    slug: string;
    translations: Record<string, any>;
    label?: string;
}
