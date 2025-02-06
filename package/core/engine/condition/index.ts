import type { ActionValue } from "../actions/index.ts";
import {
	CheckContainCondition,
	type ConditionContain,
} from "./contains/ContainCondition.ts";
import {
	CheckEqualConditionString,
	type ConditionEqualsString,
} from "./equals/EqualConditionString.ts";
import {
	CheckEqualConditionUndefined,
	type ConditionEqualsUndefined,
} from "./equals/EqualConditionUndefined.ts";
import {
	CheckEqualFieldValueCondition,
	type ConditionEqualsFieldValue,
} from "./equals/EqualFieldValueCondition.ts";
import {
	type AllOfCondition,
	checkAllOfCondition,
} from "./generic/AllOfCondition.ts";
import {
	type AnyOfCondition,
	checkAnyOfCondition,
} from "./generic/AnyOfCondition.ts";
import {
	type InvertedCondition,
	checkInvertedCondition,
} from "./generic/InvertedCondition.ts";
import {
	type ObjectCondition,
	checkObjectCondition,
} from "./generic/ObjectCondition.ts";

export type BaseCondition = {
	field: string;
};

export type Condition =
	| ConditionEqualsString
	| ConditionEqualsUndefined
	| ConditionEqualsFieldValue
	| ConditionContain
	| AllOfCondition
	| AnyOfCondition
	| InvertedCondition
	| ObjectCondition;

export function checkCondition(
	condition: Condition | undefined,
	element: Record<string, unknown>,
	value?: ActionValue,
): boolean {
	if (!condition) return true;

	switch (condition.condition) {
		case "compare_to_value":
			return CheckEqualConditionString(condition);
		case "compare_value_to_field_value":
			return CheckEqualFieldValueCondition(condition, element);
		case "if_field_is_undefined":
			return CheckEqualConditionUndefined(condition, element);
		case "contains":
			return CheckContainCondition(condition, element, value);
		case "all_of":
			return checkAllOfCondition(condition, element, value);
		case "any_of":
			return checkAnyOfCondition(condition, element, value);
		case "inverted":
			return checkInvertedCondition(condition, element, value);
		case "object":
			return checkObjectCondition(condition, element, value);
		default:
			return false;
	}
}
