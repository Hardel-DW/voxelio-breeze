import type { Condition } from "@/core/engine/condition/types";
import type { ValueRenderer } from "@/core/engine/renderer/value";

export function getConditionFields(condition: Condition | undefined): string[] {
    if (!condition) return [];

    switch (condition.condition) {
        case "all_of":
            return condition.terms.flatMap(getConditionFields);
        case "any_of":
            return condition.terms.flatMap(getConditionFields);
        case "object":
            return [condition.field];
        case "inverted":
            return getConditionFields(condition.terms);
        case "compare_to_value":
            return [];
        default:
            return [condition.field];
    }
}

export function getRendererFields(renderer: ValueRenderer): string[] {
    switch (renderer.type) {
        case "from_field":
            return [renderer.field];
        case "conditionnal": {
            const fields = getConditionFields(renderer.term);
            if ("return_condition" in renderer && renderer.return_condition) {
                return fields;
            }
            return [
                ...fields,
                ...(renderer.on_true ? getRendererFields(renderer.on_true) : []),
                ...(renderer.on_false ? getRendererFields(renderer.on_false) : [])
            ];
        }
        case "hardcoded":
            return [];
    }
}
