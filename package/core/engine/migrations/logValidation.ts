import { Identifier } from "../../Identifier.ts";
import type { Analysers, GetAnalyserVoxel } from "../Analyser.ts";
import type { Action, ActionValue } from "../actions/index.ts";
import { updateData } from "../actions/index.ts";
import type { Logger } from "./logger.ts";
import type { LogDifference, LogValue } from "./types.ts";

/**
 * Checks if a value matches the LogValue type
 * A LogValue can be:
 * - A primitive (string, number, boolean)
 * - An array of primitives
 * - An object where all values are LogValues
 *
 * @param value - The value to check
 * @returns true if the value is a valid LogValue, false otherwise
 */
export function isLogValue(value: unknown): value is LogValue {
	if (value === null || value === undefined) return false;
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	)
		return true;
	if (Array.isArray(value)) {
		return value.every(
			(item) =>
				typeof item === "string" ||
				typeof item === "number" ||
				typeof item === "boolean",
		);
	}
	if (typeof value === "object") {
		return Object.values(value as Record<string, unknown>).every(isLogValue);
	}
	return false;
}

/**
 * Creates a log difference from an action
 * This function analyzes changes made by an action and generates
 * an appropriate LogDifference structure for logging
 *
 * @param action - The action that generated the change
 * @param element - The registry element that was modified
 * @param version
 * @param tool
 * @param logger
 * @returns A LogDifference describing the change, or undefined if the change cannot be logged
 *
 * @example
 * // For a "set" type action:
 * {
 *   type: "set",
 *   path: "fieldName",
 *   value: newValue,
 *   origin_value: originalValue
 * }
 *
 * // For an "add" type action:
 * {
 *   type: "add",
 *   path: "fieldName",
 *   value: newValue
 * }
 *
 * // For a "remove" type action:
 * {
 *   type: "remove",
 *   path: "fieldName.subField"
 * }
 */
export function createDifferenceFromAction<T extends keyof Analysers>(
	action: Action,
	element: GetAnalyserVoxel<T>,
	version: number,
	tool: T,
	logger: Logger,
	value?: ActionValue,
): LogDifference[] | LogDifference | undefined {
	if (action.type === "sequential") {
		const differences: LogDifference[] = [];

		for (const subAction of action.actions) {
			const difference = createDifferenceFromAction(
				subAction,
				element,
				version,
				tool,
				logger,
				value,
			);
			if (difference) {
				if (Array.isArray(difference)) {
					differences.push(...difference);
				} else {
					differences.push(difference);
				}
			}
		}

		return differences.length > 0 ? differences : undefined;
	}

	const field = action.field;
	const fieldExists = field in element;
	const loggedOriginalValue = logger.getOriginalValue(
		new Identifier(element.identifier).toString(),
		String(field),
	);

	const originalValue =
		loggedOriginalValue !== undefined
			? loggedOriginalValue
			: fieldExists
				? element[field as keyof typeof element.data]
				: undefined;

	const updatedElement = updateData(action, element, version, value);
	if (!updatedElement) return undefined;
	const currentValue =
		updatedElement[field as keyof typeof updatedElement.data];

	if (!isLogValue(currentValue)) return undefined;

	if (JSON.stringify(originalValue) === JSON.stringify(currentValue)) {
		return undefined;
	}

	// Si le champ n'existait pas avant mais existe maintenant
	if (!fieldExists && field in updatedElement) {
		return {
			type: "add",
			path: String(field),
			value: currentValue,
		};
	}

	// Si le champ existait avant mais n'existe plus dans updatedElement
	if (fieldExists && !(field in updatedElement)) {
		return {
			type: "remove",
			path: String(field),
		};
	}

	// Si le champ existe dans les deux mais a été modifié
	if (fieldExists && isLogValue(originalValue)) {
		// Cas spécial pour remove_key qui nécessite un chemin plus spécifique
		if (action.type === "remove_key") {
			return {
				type: "remove",
				path: `${String(field)}.${String(action.value)}`,
			};
		}

		// Pour tous les autres cas où la valeur a changé
		return {
			type: "set",
			path: String(field),
			value: currentValue,
			origin_value: originalValue,
		};
	}
}
