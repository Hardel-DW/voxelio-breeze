import type { ActionValue } from "@/core/engine/actions/types";
import { CheckContainCondition } from "@/core/engine/condition/contains/ContainCondition";
import { CheckEqualConditionString } from "@/core/engine/condition/equals/EqualConditionString";
import { CheckEqualConditionUndefined } from "@/core/engine/condition/equals/EqualConditionUndefined";
import { CheckEqualFieldValueCondition } from "@/core/engine/condition/equals/EqualFieldValueCondition";
import { checkAllOfCondition } from "@/core/engine/condition/generic/AllOfCondition";
import { checkAnyOfCondition } from "@/core/engine/condition/generic/AnyOfCondition";
import { checkInvertedCondition } from "@/core/engine/condition/generic/InvertedCondition";
import { checkObjectCondition } from "@/core/engine/condition/generic/ObjectCondition";
import type { Condition } from "@/core/engine/condition/types";

export function checkCondition(condition: Condition | undefined, element: Record<string, unknown>, value?: ActionValue): boolean {
    if (!condition) return true;

    switch (condition.condition) {
        case "compare_to_value":
            return CheckEqualConditionString(condition, element);
        case "compare_value_to_field_value":
            return CheckEqualFieldValueCondition(condition, element);
        case "if_field_is_undefined":
            return CheckEqualConditionUndefined(condition, element);
        case "contains":
            return CheckContainCondition(condition, element, value);
        case "all_of":
            return checkAllOfCondition(condition, element, checkCondition, value);
        case "any_of":
            return checkAnyOfCondition(condition, element, checkCondition, value);
        case "inverted":
            return checkInvertedCondition(condition, element, checkCondition, value);
        case "object":
            return checkObjectCondition(condition, element, checkCondition, value);
        default:
            return false;
    }
}
