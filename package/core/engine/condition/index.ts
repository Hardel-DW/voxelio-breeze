import type { ActionValue } from "@/core/engine/actions/index";
import { CheckContainCondition, type ConditionContain } from "@/core/engine/condition/contains/ContainCondition";
import { CheckEqualConditionString, type ConditionEqualsString } from "@/core/engine/condition/equals/EqualConditionString";
import { CheckEqualConditionUndefined, type ConditionEqualsUndefined } from "@/core/engine/condition/equals/EqualConditionUndefined";
import { CheckEqualFieldValueCondition, type ConditionEqualsFieldValue } from "@/core/engine/condition/equals/EqualFieldValueCondition";
import { type AllOfCondition, checkAllOfCondition } from "@/core/engine/condition/generic/AllOfCondition";
import { type AnyOfCondition, checkAnyOfCondition } from "@/core/engine/condition/generic/AnyOfCondition";
import { type InvertedCondition, checkInvertedCondition } from "@/core/engine/condition/generic/InvertedCondition";
import { type ObjectCondition, checkObjectCondition } from "@/core/engine/condition/generic/ObjectCondition";

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

export function checkCondition(condition: Condition | undefined, element: Record<string, unknown>, value?: ActionValue): boolean {
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
