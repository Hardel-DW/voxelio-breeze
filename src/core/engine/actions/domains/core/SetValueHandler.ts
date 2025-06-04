import type { ActionHandler } from "../../types";
import type { CoreAction } from "./types";
import { setValueAtPath, getValueAtPath } from "../../utils";

export class SetValueHandler implements ActionHandler<CoreAction> {
    execute(
        action: Extract<CoreAction, { type: "core.set_value" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        return setValueAtPath(element, action.path, action.value);
    }
}

export class ToggleValueHandler implements ActionHandler<CoreAction> {
    execute(
        action: Extract<CoreAction, { type: "core.toggle_value" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const currentValue = getValueAtPath(element, action.path);
        const newValue = currentValue === action.value ? undefined : action.value;
        return setValueAtPath(element, action.path, newValue);
    }
}

export class InvertBooleanHandler implements ActionHandler<CoreAction> {
    execute(
        action: Extract<CoreAction, { type: "core.invert_boolean" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const currentValue = getValueAtPath(element, action.path);
        if (typeof currentValue !== "boolean") {
            return element;
        }

        return setValueAtPath(element, action.path, !currentValue);
    }
}
