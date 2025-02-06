import type { ActionValue } from "../../actions/index.ts";
import { checkCondition, type Condition } from "../../condition/index.ts";

export type ObjectCondition = {
	condition: "object";
	field: string;
	terms: Condition;
};

export function checkObjectCondition(
	condition: ObjectCondition,
	element: Record<string, unknown>,
	value?: ActionValue,
): boolean {
	const subObject = element[condition.field];
	if (!subObject || typeof subObject !== "object") {
		return false;
	}

	return checkCondition(
		condition.terms,
		subObject as Record<string, unknown>,
		value,
	);
}
