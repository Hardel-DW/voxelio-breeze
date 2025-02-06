import type { Action, ActionValue } from "../actions/index.ts";
import type { FileLog, Log, LogDifference, LogValue } from "./types.ts";

/**
 * Converts a LogValue to an ActionValue
 * ActionValue is more restrictive than LogValue, so we need to validate/convert
 */
function convertToActionValue(value: LogValue): ActionValue | undefined {
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	) {
		return value;
	}
	// Arrays and objects are not valid ActionValues
	return undefined;
}

/**
 * Converts a log difference to an action
 */
function differenceToAction(
	difference: LogDifference,
	field: string,
): Action | undefined {
	switch (difference.type) {
		case "set": {
			const setValue = convertToActionValue(difference.value);
			return setValue
				? {
						type: "set_value",
						field,
						value: setValue,
					}
				: undefined;
		}
		case "add": {
			const addValue = convertToActionValue(difference.value);
			if (!addValue) return undefined;

			if (Array.isArray(difference.value)) {
				return {
					type: "list_operation",
					mode: "append",
					field,
					value: addValue,
				};
			}
			return {
				type: "set_value",
				field,
				value: addValue,
			};
		}
		case "remove":
			return {
				type: "set_undefined",
				field,
			};
	}
}

/**
 * Converts a file log to a list of actions
 */
function fileLogToActions(fileLog: FileLog): Action[] {
	switch (fileLog.type) {
		case "updated":
			return fileLog.differences
				.map((diff) => differenceToAction(diff, diff.path))
				.filter((action): action is Action => action !== undefined);
		case "deleted":
			return [];
		case "added":
			if (typeof fileLog.value === "object" && fileLog.value !== null) {
				const actions = Object.entries(fileLog.value).map(
					([field, value]): Action | undefined => {
						const convertedValue = convertToActionValue(value as LogValue);
						if (convertedValue === undefined) return undefined;

						return {
							type: "set_value",
							field,
							value: convertedValue,
						};
					},
				);
				return actions.filter(
					(action): action is Action => action !== undefined,
				);
			}
			return [];
	}
}

/**
 * Converts migration logs to a list of actions that can be applied to the target datapack
 */
export function logToActions(log: Log): Map<string, Action[]> {
	const actionMap = new Map<string, Action[]>();

	for (const fileLog of log.logs) {
		const actions = fileLogToActions(fileLog);
		if (actions.length > 0) {
			actionMap.set(fileLog.identifier, actions);
		}
	}

	return actionMap;
}
