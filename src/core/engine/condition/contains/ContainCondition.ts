import type { ActionValue } from "@/core/engine/actions/index";
import type { BaseCondition } from "@/core/engine/condition/index";

export interface ConditionContain extends BaseCondition {
    condition: "contains";
    values?: string[];
}

export function CheckContainCondition(condition: ConditionContain, element: Record<string, unknown>, value?: ActionValue): boolean {
    const fieldValue = element[condition.field];
    if (!Array.isArray(fieldValue)) {
        return false;
    }

    // If condition.values is provided, check if any of those values exist in fieldValue
    if (condition.values) {
        return condition.values.some((value) => fieldValue.includes(value));
    }

    // If value is provided (from action), check if it exists in fieldValue
    if (value && typeof value === "string") {
        return fieldValue.includes(value);
    }

    return false;
}
