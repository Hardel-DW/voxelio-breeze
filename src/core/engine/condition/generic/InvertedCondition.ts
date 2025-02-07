import type { ActionValue } from "@/core/engine/actions/types";
import type { CheckConditionFunction, InvertedCondition } from "@/core/engine/condition/types";

export function checkInvertedCondition(
    condition: InvertedCondition,
    element: Record<string, unknown>,
    checkConditionFn: CheckConditionFunction,
    value?: ActionValue
): boolean {
    return !checkConditionFn(condition.terms, element, value);
}
