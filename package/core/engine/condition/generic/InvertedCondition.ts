import type { ActionValue } from "../../actions/index.ts";
import { checkCondition, type Condition } from "../../condition/index.ts";

export type InvertedCondition = {
	condition: "inverted";
	terms: Condition;
};

export function checkInvertedCondition(
	condition: InvertedCondition,
	element: Record<string, unknown>,
	value?: ActionValue,
): boolean {
	return !checkCondition(condition.terms, element, value);
}
