import type { DataDrivenElement } from "@/core/Element";

export interface TagType extends DataDrivenElement {
    replace?: boolean;
    values: (string | OptionalTag)[];
}

export type OptionalTag = {
    required: boolean;
    id: string;
};
