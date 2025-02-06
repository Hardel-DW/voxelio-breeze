import { type ActionValue, type BaseAction, getFieldValue } from "@/core/engine/actions/index";

export interface SimpleAction extends BaseAction {
    type: "set_value" | "toggle_value";
    value: ActionValue;
}

/**
 * Modifies the field of the element with the hardcoded value given.
 * For set_value: Sets the field to the given value
 * For toggle_value: Toggles between the value and undefined
 * @param action - The action to perform.
 * @param element - The element to modify.
 * @constructor
 */
export function SimpleModifier(action: SimpleAction, element: Record<string, unknown>): Record<string, unknown> | undefined {
    const { field } = action;
    const value = getFieldValue(action.value);

    if (action.type === "toggle_value" && element[field] === value) {
        return { ...element, [field]: undefined };
    }

    return { ...element, [field]: value };
}
