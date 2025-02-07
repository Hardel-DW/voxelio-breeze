import type { ConditionEqualsUndefined } from "@/core/engine/condition/types";

export function CheckEqualConditionUndefined(condition: ConditionEqualsUndefined, element: Record<string, unknown>): boolean {
    return element[condition.field] === undefined;
}
