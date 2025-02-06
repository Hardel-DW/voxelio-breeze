import type { BaseCondition } from "@/core/engine/condition/index";

export interface ConditionEqualsFieldValue extends BaseCondition {
    condition: "compare_value_to_field_value";
    value: string;
}

export function CheckEqualFieldValueCondition(condition: ConditionEqualsFieldValue, element: Record<string, unknown>): boolean {
    const compared = element[condition.field];
    if (!compared) {
        return false;
    }

    return compared === condition.value;
}
