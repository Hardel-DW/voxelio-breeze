import type { ActionValue } from "@/core/engine/actions/types";
import type { AnyOfCondition, CheckConditionFunction } from "@/core/engine/condition/types";

export function checkAnyOfCondition(
    condition: AnyOfCondition,
    element: Record<string, unknown>,
    checkConditionFn: CheckConditionFunction,
    value?: ActionValue
): boolean {
    return condition.terms.some((subCondition) => checkConditionFn(subCondition, element, value));
}
