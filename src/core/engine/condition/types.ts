import type { ActionValue } from "@/core/engine/actions/types";

export type BaseCondition = {
    field: string;
};

export type ConditionEqualsString = {
    condition: "compare_to_value";
    compare: string;
    value: string | number | boolean;
};

export interface ConditionEqualsUndefined extends BaseCondition {
    condition: "if_field_is_undefined";
}

export interface ConditionEqualsFieldValue extends BaseCondition {
    condition: "compare_value_to_field_value";
    value: string | number | boolean;
}

export interface ConditionContain extends BaseCondition {
    condition: "contains";
    values?: string[];
}

export type AllOfCondition = {
    condition: "all_of";
    terms: Condition[];
};

export type AnyOfCondition = {
    condition: "any_of";
    terms: Condition[];
};

export type InvertedCondition = {
    condition: "inverted";
    terms: Condition;
};

export type ObjectCondition = {
    condition: "object";
    field: string;
    terms: Condition;
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

export type CheckConditionFunction = (condition: Condition | undefined, element: Record<string, unknown>, value?: ActionValue) => boolean;
