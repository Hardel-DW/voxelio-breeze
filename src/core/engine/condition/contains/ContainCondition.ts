import type { ActionValue } from "@/core/engine/actions/types";
import type { ConditionContain } from "@/core/engine/condition/types";

export function CheckContainCondition(condition: ConditionContain, element: Record<string, unknown>, value?: ActionValue): boolean {
    const fieldValue = element[condition.field];
    if (!Array.isArray(fieldValue)) {
        return false;
    }

    if (condition.values) {
        return condition.values.some((value) => fieldValue.includes(value));
    }

    if (value && typeof value === "string") {
        return fieldValue.includes(value);
    }

    return false;
}
