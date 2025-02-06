import type { DataDrivenElement } from "../../index.ts";

export interface TagType extends DataDrivenElement {
    replace?: boolean;
    values: (string | OptionalTag)[];
}

export type OptionalTag = {
    required: boolean;
    id: string;
};
