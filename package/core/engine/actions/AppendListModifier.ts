import { type ActionValue, type BaseAction, getFieldValue } from "./index.ts";

export interface ListAction extends BaseAction {
	type: "list_operation";
	mode: "prepend" | "append";
	flag?: "not_duplicate"[];
	value: ActionValue;
}

/**
 * This action adds a value to a list field, either at the beginning (prepend) or at the end (append)
 * If the not_duplicate flag is set, the value will only be added if it doesn't already exist in the list
 * @param action - The action to perform
 * @param element - The element to modify
 */
export default function AppendListModifier(
	action: ListAction,
	element: Record<string, unknown>,
): Record<string, unknown> | undefined {
	const { value, field, mode, flag } = action;
	const computedValue = getFieldValue(value);
	const shadowCopy = structuredClone(element);

	const list = (shadowCopy[field] as unknown[]) || [];
	if (!Array.isArray(list)) {
		return;
	}

	// Check if we should prevent duplicates
	if (flag?.includes("not_duplicate") && list.includes(computedValue)) {
		return element;
	}

	const newList =
		mode === "prepend" ? [computedValue, ...list] : [...list, computedValue];

	return { ...element, [field]: newList };
}
