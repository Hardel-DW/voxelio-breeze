import type { Action, ActionValue } from "./index.ts";
import { updateData } from "./index.ts";

export interface SequentialAction {
	type: "sequential";
	actions: Action[];
}

/**
 * Execute a sequence of actions in order. Each action is executed with its corresponding value if provided.
 * If any action in the sequence fails, the entire sequence is aborted and undefined is returned.
 * @param action - The sequential action containing the list of actions to perform
 * @param element - The element to modify
 * @param version - The version of the element
 * @param value
 */
export default function SequentialModifier(
	action: SequentialAction,
	element: Record<string, unknown>,
	version: number,
	value?: ActionValue,
): Record<string, unknown> | undefined {
	let currentElement = element;

	for (const subAction of action.actions) {
		const updatedElement = updateData(
			subAction,
			currentElement,
			version,
			value,
		);
		if (!updatedElement) return undefined;
		currentElement = updatedElement;
	}

	return currentElement;
}
