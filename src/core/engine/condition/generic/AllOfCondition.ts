import type { ActionValue } from "@/core/engine/actions/index";
import { type Condition, checkCondition } from "@/core/engine/condition/index";

export type AllOfCondition = {
    condition: "all_of";
    terms: Condition[];
};

export function checkAllOfCondition(condition: AllOfCondition, element: Record<string, unknown>, value?: ActionValue): boolean {
    return condition.terms.every((subCondition) => checkCondition(subCondition, element, value));
}
