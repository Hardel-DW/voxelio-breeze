import type { ActionValue } from "@/core/engine/actions/types";
import type { CheckConditionFunction, ObjectCondition } from "@/core/engine/condition/types";

export function checkObjectCondition(
    condition: ObjectCondition,
    element: Record<string, unknown>,
    checkConditionFn: CheckConditionFunction,
    value?: ActionValue
): boolean {
    const subObject = element[condition.field];
    if (!subObject || typeof subObject !== "object") {
        return false;
    }

    return checkConditionFn(condition.terms, subObject as Record<string, unknown>, value);
}
