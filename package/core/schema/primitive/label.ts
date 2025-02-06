import type { DataDrivenElement } from "@/lib/minecraft/core/Element";
import type { DataDrivenRegistryElement } from "@/lib/minecraft/core/Element";
import type { IdentifierObject } from "@/lib/minecraft/core/Identifier";

export type LabeledElement = NewOrUpdated | Deleted;

interface NewOrUpdated {
    type: "new" | "updated";
    element: DataDrivenRegistryElement<DataDrivenElement>;
}

interface Deleted {
    type: "deleted";
    identifier: IdentifierObject;
}
