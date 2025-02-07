import type { ActionValue } from "./types";

/**
 * Get the field value from the action value
 */
export function getFieldValue(value: ActionValue): ActionValue {
    if (typeof value === "object" && "type" in value && value.type === "get_value_from_field") {
        return value.field;
    }
    return value;
}
