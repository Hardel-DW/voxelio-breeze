import type { ActionValue } from "@/core/engine/actions/index";
import { type Condition, checkCondition } from "@/core/engine/condition/index";

export type AnyOfCondition = {
    condition: "any_of";
    terms: Condition[];
};

export function checkAnyOfCondition(condition: AnyOfCondition, element: Record<string, unknown>, value?: ActionValue): boolean {
    return condition.terms.some((subCondition) => checkCondition(subCondition, element, value));
}
