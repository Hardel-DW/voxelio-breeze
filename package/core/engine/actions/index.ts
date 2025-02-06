import type { IdentifierObject } from "../../../core/Identifier.ts";
import AlternativeModifier, {
	type AlternativeAction,
} from "./AlternativeModifier.ts";
import AppendListModifier, { type ListAction } from "./AppendListModifier.ts";
import { type ComputedAction, ComputedModifier } from "./ComputedModifier.ts";
import MultipleModifier, { type MultipleAction } from "./MultipleModifier.ts";
import RemoveKeyModifier, {
	type RemoveKeyAction,
} from "./RemoveKeyModifier.ts";
import RemoveValueFromListModifier, {
	type RemoveValueFromListAction,
} from "./RemoveValueFromListModifier.ts";
import SequentialModifier, {
	type SequentialAction,
} from "./SequentialModifier.ts";
import { type SimpleAction, SimpleModifier } from "./SimpleModifier.ts";
import { type SlotAction, SlotModifier } from "./SlotModifier.ts";
import ToggleListValueModifier, {
	type ToggleListValueAction,
} from "./ToggleListValueModifier.ts";
import {
	type UndefinedAction,
	UndefinedModifier,
} from "./UndefinedModifier.ts";

export type ActionValue =
	| string
	| number
	| boolean
	| IdentifierObject
	| GetValueField;
type GetValueField = {
	type: "get_value_from_field";
	field: string;
};

export interface BaseAction {
	field: string;
}

// Type pour les actions résolues
export type Action =
	| RemoveKeyAction
	| UndefinedAction
	| SimpleAction
	| SlotAction
	| ToggleListValueAction
	| MultipleAction
	| SequentialAction
	| ListAction
	| ComputedAction
	| RemoveValueFromListAction
	| AlternativeAction;

export function updateData(
	action: Action,
	element: Record<string, unknown>,
	version: number,
	value?: ActionValue,
): Record<string, unknown> | undefined {
	return (() => {
		switch (action.type) {
			case "set_value_from_computed_value":
			case "toggle_value_from_computed_value":
				return ComputedModifier(action, element, value);
			case "set_value":
			case "toggle_value":
				return SimpleModifier(action, element);
			case "set_undefined":
				return UndefinedModifier(action, element);
			case "set_computed_slot":
				return SlotModifier(action, element, version);
			case "toggle_multiple_values":
				return MultipleModifier(action, element);
			case "toggle_value_in_list":
				return ToggleListValueModifier(action, element, value);
			case "remove_key":
				return RemoveKeyModifier(action, element);
			case "remove_value_from_list":
				return RemoveValueFromListModifier(action, element, value);
			case "sequential":
				return SequentialModifier(action, element, version, value);
			case "list_operation":
				return AppendListModifier(action, element);
			case "alternative":
				return AlternativeModifier(action, element, version);
		}
	})();
}

/**
 * Split a SequentialAction into multiple actions, handling nested sequential actions recursively
 * @param action - The action to split (can be any Action type)
 * @returns The flattened list of actions
 */
export function SplitSequentialAction(action: Action): Action[] {
	if (action.type === "sequential") {
		return action.actions.flatMap((subAction) =>
			SplitSequentialAction(subAction),
		);
	}
	return [action];
}

/**
 * Get the field value from the action value
 * @param value - The action value
 * @returns The field value
 */
export function getFieldValue(value: ActionValue): ActionValue {
	if (
		typeof value === "object" &&
		"type" in value &&
		value.type === "get_value_from_field"
	) {
		return value.field;
	}

	return value;
}
