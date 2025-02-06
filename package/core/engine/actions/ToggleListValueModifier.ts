import { type ActionValue, type BaseAction, getFieldValue } from "@/core/engine/actions/index";

export interface ToggleListValueAction extends BaseAction {
    type: "toggle_value_in_list";
    mode?: ("remove_if_empty" | "override")[];
    value?: ActionValue;
}

/**
 * Toggle the value in the list field of the element.
 * - Adds them if not present, removes them if present
 * - With override mode, converts primitive values to arrays
 * - With remove_if_empty mode, removes the field if the list becomes empty
 */
export default function ToggleListValueModifier(
    action: ToggleListValueAction,
    element: Record<string, unknown>,
    props?: ActionValue
): Record<string, unknown> | undefined {
    const { field } = action;
    const value = action.value ?? props;
    const modes = action.mode || [];

    if (value === undefined) {
        throw new Error("Both props and action.value cannot be undefined");
    }

    const computedValue = getFieldValue(value);
    const shadowCopy = structuredClone(element);
    let list: unknown = shadowCopy[field];

    // Handle override mode for primitive values
    if (modes.includes("override") && list !== undefined && !Array.isArray(list)) {
        list = [computedValue];
        return {
            ...element,
            [field]: list
        };
    }

    // Ensure list is an array
    if (!Array.isArray(list)) {
        list = [];
    }

    // Type guard to ensure list is string[]
    if (
        !Array.isArray(list) ||
        !list.every((item: unknown): item is string => typeof item === "string") ||
        typeof computedValue !== "string"
    ) {
        return;
    }

    const isPresent = list.includes(computedValue);
    const newList = isPresent ? list.filter((item: string) => item !== computedValue) : [...list, computedValue];

    return {
        ...element,
        [field]: modes.includes("remove_if_empty") && newList.length === 0 ? undefined : newList
    };
}
