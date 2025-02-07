import type { ActionValue, UpdateDataFunction } from "@/core/engine/actions/types";
import type { SequentialAction } from "@/core/engine/actions/types";

/**
 * Execute a sequence of actions in order. Each action is executed with its corresponding value if provided.
 * If any action in the sequence fails, the entire sequence is aborted and undefined is returned.
 * @param action - The sequential action containing the list of actions to perform
 * @param element - The element to modify
 * @param version - The version of the element
 * @param updateDataFn - The function to update the data
 * @param value - Optional value to pass to each action
 */
export default function SequentialModifier(
    action: SequentialAction,
    element: Record<string, unknown>,
    version: number,
    updateDataFn: UpdateDataFunction,
    value?: ActionValue
): Record<string, unknown> | undefined {
    let currentElement = element;

    for (const subAction of action.actions) {
        const updatedElement = updateDataFn(subAction, currentElement, version, value);
        if (!updatedElement) return undefined;
        currentElement = updatedElement;
    }

    return currentElement;
}
