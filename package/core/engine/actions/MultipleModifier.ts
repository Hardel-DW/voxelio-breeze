import {
	Identifier,
	type IdentifierObject,
	isIdentifier,
} from "../../Identifier.ts";
import { getPropertySafely } from "../utils/property.ts";
import type { BaseAction } from "./index.ts";

export type ValidType = string | number | IdentifierObject;

export interface MultipleAction extends BaseAction {
	type: "toggle_multiple_values";
	value: ValidType[];
}

/**
 * Check if the types of the two lists are consistent
 * @param list1 - The first list
 * @param list2 - The second list
 */
const checkTypesConsistency = (list1: unknown[], list2: unknown[]): boolean => {
	const getType = (item: unknown): string =>
		typeof item === "string" || typeof item === "number"
			? typeof item
			: isIdentifier(item)
				? "Identifier"
				: "Invalid";

	if (list1.length === 0 || list2.length === 0) return true;

	const type = getType(list1[0]);
	return (
		type !== "Invalid" &&
		list1.every((item) => getType(item) === type) &&
		list2.every((item) => getType(item) === type)
	);
};

/**
 * Check if the value is a valid type
 * @param value - The value to check
 */
const isValidType = (value: unknown): value is ValidType =>
	typeof value === "string" || typeof value === "number" || isIdentifier(value);

/**
 * Check if the two values are equal
 * @param a - The first value
 * @param b - The second value
 */
const isValueEqual = (a: ValidType, b: ValidType): boolean => {
	// Handle simple types (string, number) directly
	if (typeof a === "string" && typeof b === "string") return a === b;
	if (typeof a === "number" && typeof b === "number") return a === b;

	// Handle Identifier objects
	if (isIdentifier(a) && isIdentifier(b))
		return new Identifier(a).equalsObject(b);

	return false;
};

/**
 * Modify the field of the element, check if the value is in the list, if it is, he tries to remove all the values from the list, if it is not, he adds them.
 * @param action - The action to perform
 * @param element - The element to modify
 */
export default function MultipleModifier(
	action: MultipleAction,
	element: Record<string, unknown>,
): Record<string, unknown> | undefined {
	const { field } = action;

	const currentList = getPropertySafely<
		Record<string, unknown>,
		Array<ValidType>
	>(element, field, []);
	if (!checkTypesConsistency(action.value, currentList)) {
		throw new Error("The types of the values are not consistent");
	}

	const validValues = action.value.filter(isValidType);
	const isValueInList = validValues.some((value) =>
		currentList.some((item) => isValueEqual(item, value)),
	);

	const newList = isValueInList
		? currentList.filter(
				(item) => !validValues.some((value) => isValueEqual(item, value)),
			)
		: [...currentList, ...validValues];

	return { ...element, [field]: newList };
}
