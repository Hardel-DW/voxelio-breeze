import type { ActionValue } from "../../actions/index.ts";
import { checkCondition, type Condition } from "../../condition/index.ts";

export type AllOfCondition = {
	condition: "all_of";
	terms: Condition[];
};

export function checkAllOfCondition(
	condition: AllOfCondition,
	element: Record<string, unknown>,
	value?: ActionValue,
): boolean {
	return condition.terms.every((subCondition) =>
		checkCondition(subCondition, element, value),
	);
}
