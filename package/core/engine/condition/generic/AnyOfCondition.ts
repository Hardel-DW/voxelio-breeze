import type { ActionValue } from "../../actions/index.ts";
import { checkCondition, type Condition } from "../../condition/index.ts";

export type AnyOfCondition = {
	condition: "any_of";
	terms: Condition[];
};

export function checkAnyOfCondition(
	condition: AnyOfCondition,
	element: Record<string, unknown>,
	value?: ActionValue,
): boolean {
	return condition.terms.some((subCondition) =>
		checkCondition(subCondition, element, value),
	);
}
