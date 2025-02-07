import type { ActionValue } from "@/core/engine/actions/index";
import { type Condition, checkCondition } from "@/core/engine/condition/index";

export type InvertedCondition = {
    condition: "inverted";
    terms: Condition;
};

export function checkInvertedCondition(condition: InvertedCondition, element: Record<string, unknown>, value?: ActionValue): boolean {
    return !checkCondition(condition.terms, element, value);
}
