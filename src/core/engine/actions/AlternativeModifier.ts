import type { ActionValue, AlternativeAction, UpdateDataFunction } from "@/core/engine/actions/types";
import { getFieldValue } from "@/core/engine/actions/utils";

/**
 * This action allows to choose between multiple actions based on the value.
 * If the value is not found in the cases, the action is not performed and undefined is returned.
 * @param action - The action to perform
 * @param element - The element to modify
 * @param version - The version of the element
 * @param updateDataFn - The function to update the data
 */
export default function AlternativeModifier(
    action: AlternativeAction,
    element: Record<string, unknown>,
    version: number,
    updateDataFn: UpdateDataFunction
): Record<string, unknown> | undefined {
    let currentElement = element;
    const { field } = action;
    const value = element[field] as ActionValue | undefined;
    if (value === undefined) return undefined;
    const computedValue = getFieldValue(value);

    for (const subAction of action.cases) {
        if (subAction.when === computedValue) {
            const updatedElement = updateDataFn(subAction.do, currentElement, version, value);
            if (!updatedElement) return undefined;
            currentElement = updatedElement;
        }
    }

    return currentElement;
}
