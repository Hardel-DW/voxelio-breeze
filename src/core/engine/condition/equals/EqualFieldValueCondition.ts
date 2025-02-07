import type { ConditionEqualsFieldValue } from "@/core/engine/condition/types";

export function CheckEqualFieldValueCondition(condition: ConditionEqualsFieldValue, element: Record<string, unknown>): boolean {
    const compared = element[condition.field];
    if (!compared) {
        return false;
    }

    return compared === condition.value;
}
