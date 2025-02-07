import type { ActionValue } from "@/core/engine/actions/types";
import type { AllOfCondition, CheckConditionFunction } from "@/core/engine/condition/types";

export function checkAllOfCondition(
    condition: AllOfCondition,
    element: Record<string, unknown>,
    checkConditionFn: CheckConditionFunction,
    value?: ActionValue
): boolean {
    return condition.terms.every((subCondition) => checkConditionFn(subCondition, element, value));
}
