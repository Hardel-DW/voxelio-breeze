export type ConditionEqualsString = {
    condition: "compare_to_value";
    compare: string;
    value: string;
};

export function CheckEqualConditionString(condition: ConditionEqualsString): boolean {
    return condition.compare === condition.value;
}
