import { type ActionValue, type BaseAction, getFieldValue } from "@/core/engine/actions/index";

export interface ComputedAction extends BaseAction {
    type: "set_value_from_computed_value" | "toggle_value_from_computed_value";
}

/**
 * Modifies the field of the element with a computed value passed as parameter.
 * For set_value_from_computed_value: Sets the field to the computed value
 * For toggle_value_from_computed_value: Toggles between the computed value and undefined
 * @param action - The action to perform
 * @param element - The element to modify
 * @param value - The computed value to use
 */
export function ComputedModifier(
    action: ComputedAction,
    element: Record<string, unknown>,
    value?: ActionValue
): Record<string, unknown> | undefined {
    if (value === undefined) return undefined;
    const { field } = action;
    const computedValue = getFieldValue(value);

    if (action.type === "toggle_value_from_computed_value" && element[field] === computedValue) {
        return { ...element, [field]: undefined };
    }

    return { ...element, [field]: computedValue };
}
