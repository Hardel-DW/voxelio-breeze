import type { ConditionEqualsString } from "@/core/engine/condition/types";

export function CheckEqualConditionString(condition: ConditionEqualsString, element: Record<string, unknown>): boolean {
    const fieldValue = element[condition.compare];
    return fieldValue === condition.value;
}
