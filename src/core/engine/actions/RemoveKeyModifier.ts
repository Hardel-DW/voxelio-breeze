import { type ActionValue, type BaseAction, getFieldValue } from "@/core/engine/actions/index";

export interface RemoveKeyAction extends BaseAction {
    type: "remove_key";
    value: ActionValue;
}

/**
 * This action removes a key from the field of the element.
 * @param action - The action to perform
 * @param element - The element to modify
 * @constructor
 */
export default function RemoveKeyModifier(action: RemoveKeyAction, element: Record<string, unknown>): Record<string, unknown> | undefined {
    const { value, field } = action;
    const computedValue = getFieldValue(value);

    if (typeof computedValue !== "string") {
        throw new Error("Remove Key action requires a string value");
    }

    const shadowCopy = structuredClone(element);
    const effects = shadowCopy[field] as Record<string, unknown> | undefined;
    if (effects) {
        delete effects[computedValue];
    }

    return { ...element, [field]: effects };
}
