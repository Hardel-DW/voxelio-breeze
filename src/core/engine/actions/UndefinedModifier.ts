import type { UndefinedAction } from "@/core/engine/actions/types";

/**
 * Modifies the field of the element with the hardcoded value given.
 * For set_value: Sets the field to the given value
 * For toggle_value: Toggles between the value and undefined
 * For set_undefined: Sets the field to undefined
 * @param action - The action to perform.
 * @param element - The element to modify.
 * @constructor
 */
export function UndefinedModifier(action: UndefinedAction, element: Record<string, unknown>): Record<string, unknown> | undefined {
    return { ...element, [action.field]: undefined };
}
