import {
	type Action,
	type ActionValue,
	type BaseAction,
	getFieldValue,
} from "./index.ts";
import { updateData } from "./index.ts";

export interface AlternativeAction extends BaseAction {
	type: "alternative";
	cases: {
		when: ActionValue;
		do: Action;
	}[];
}

/**
 * This action allows to choose between multiple actions based on the value.
 * If the value is not found in the cases, the action is not performed and undefined is returned.
 * @param action - The action to perform
 * @param element - The element to modify
 * @param version - The version of the element
 * @param value
 */
export default function AlternativeModifier(
	action: AlternativeAction,
	element: Record<string, unknown>,
	version: number,
): Record<string, unknown> | undefined {
	let currentElement = element;
	const { field } = action;
	const value = element[field] as ActionValue | undefined;
	if (value === undefined) return undefined;
	const computedValue = getFieldValue(value);

	for (const subAction of action.cases) {
		if (subAction.when === computedValue) {
			const updatedElement = updateData(
				subAction.do,
				currentElement,
				version,
				value,
			);
			if (!updatedElement) return undefined;
			currentElement = updatedElement;
		}
	}

	return currentElement;
}
