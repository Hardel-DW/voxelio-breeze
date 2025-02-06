import type { DataDrivenElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { IdentifierObject } from "@/core/Identifier";

export type LabeledElement = NewOrUpdated | Deleted;

interface NewOrUpdated {
    type: "new" | "updated";
    element: DataDrivenRegistryElement<DataDrivenElement>;
}

interface Deleted {
    type: "deleted";
    identifier: IdentifierObject;
}
