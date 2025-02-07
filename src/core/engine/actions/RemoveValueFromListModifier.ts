import type { ActionValue, RemoveValueFromListAction } from "@/core/engine/actions/types";
import { getFieldValue } from "@/core/engine/actions/utils";

/**
 * Removes a specific value from a list field if it exists
 * - With remove_if_empty mode, removes the field if the list becomes empty
 * Returns undefined if the field is not an array or if the types don't match
 */
export default function RemoveValueFromListModifier(
    action: RemoveValueFromListAction,
    element: Record<string, unknown>,
    props?: ActionValue
): Record<string, unknown> | undefined {
    const { field } = action;
    const value = action.value ?? props;
    const modes = action.mode || [];

    if (value === undefined) {
        throw new Error("Both props and action.value cannot be undefined");
    }

    if (modes.includes("if_type_string") && typeof value !== "string") {
        return element;
    }

    const list = element[field];
    const computedValue = getFieldValue(value);
    // Verify that list is an array of strings
    if (!Array.isArray(list) || !list.every((item): item is string => typeof item === "string") || typeof computedValue !== "string") {
        return element;
    }

    const newList = list.filter((item) => item !== computedValue);

    // Return modified element
    return {
        ...element,
        [field]: modes.includes("remove_if_empty") && newList.length === 0 ? undefined : newList
    };
}
