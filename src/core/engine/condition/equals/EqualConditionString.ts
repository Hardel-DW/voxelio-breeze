import type { ConditionEqualsString } from "@/core/engine/condition/types";

export function CheckEqualConditionString(condition: ConditionEqualsString): boolean {
    return condition.compare === condition.value;
}
