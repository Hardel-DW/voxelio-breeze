import type { InternalIterationResult } from "./type.ts";

export function resolveIterationValue(
	value: any,
	context: InternalIterationResult | undefined,
): any {
	if (typeof value === "object" && value?.type === "get_value_from_context") {
		if (!context) return value;

		if ("current_iteration" in context) {
			return context.current_iteration;
		}

		if ("filename" in context) {
			switch (value.key) {
				case "filename":
					return context.filename;
				case "resource":
					return context.resource;
				case "namespace":
					return context.namespace;
				case "identifier":
					return context.identifier;
				default:
					return context[value.key as keyof typeof context] ?? value;
			}
		}

		if ("object_data" in context) {
			return context.object_data[value.key] ?? value;
		}
	}
	return value;
}
