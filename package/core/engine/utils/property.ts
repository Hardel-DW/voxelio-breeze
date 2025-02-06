/**
 * Get the property of an object safely with a default value. If the property is an array, return the array.
 * @param obj
 * @param key
 * @param defaultValue
 */
export function getPropertySafely<T extends object, K>(
	obj: T,
	key: keyof T,
	defaultValue: K,
): K {
	if (key in obj && Array.isArray(obj[key])) {
		return obj[key] as K;
	}
	return defaultValue;
}

export function isStringArray(value: unknown): value is string[] {
	return (
		Array.isArray(value) && value.every((item) => typeof item === "string")
	);
}
