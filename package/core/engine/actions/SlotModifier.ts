import { getManager } from "../Manager.ts";
import {
	type SlotRegistryType,
	isArraySlotRegistryType,
	isSlotRegistryType,
} from "../managers/SlotManager.ts";
import { isStringArray } from "../utils/property.ts";
import { type ActionValue, type BaseAction, getFieldValue } from "./index.ts";

export interface SlotAction extends BaseAction {
	type: "set_computed_slot";
	value: ActionValue;
}

/**
 * This action modifies the slot field of the element with the given value. It adds or removes the value from the slot. If the value is already in the slot, it will be removed, otherwise it will be added.
 * @param action - The action to perform.
 * @param element - The element to modify.
 * @param version - Extra data.
 * @constructor
 */
export function SlotModifier(
	action: SlotAction,
	element: Record<string, unknown>,
	version: number,
): Record<string, unknown> | undefined {
	if (!version) throw new Error("Version is not set in the context");

	const shadowCopy = structuredClone(element);
	const { field } = action;
	const computedValue = getFieldValue(action.value);
	const unformattedValue = shadowCopy[field];

	let value: SlotRegistryType;
	if (typeof computedValue === "string" && isSlotRegistryType(computedValue)) {
		value = computedValue;
	} else {
		throw new Error(`Invalid SlotRegistryType: ${computedValue}`);
	}

	let currentValue: SlotRegistryType[];
	if (
		isStringArray(unformattedValue) &&
		isArraySlotRegistryType(unformattedValue)
	) {
		currentValue = unformattedValue;
	} else {
		throw new Error(`Invalid SlotRegistryType array: ${unformattedValue}`);
	}

	// Utiliser le ManagerSelector pour obtenir le SlotManager approprié
	const slotManager = getManager("slot", version);
	if (!slotManager) {
		throw new Error(`SlotManager is not available for version ${version}`);
	}

	return { ...element, [field]: slotManager.apply(currentValue, value) };
}
