import type { LogDifference, DiffOptions } from "./types";

/**
 * Normalizes a value to be safely serializable and comparable
 */
function normalizeValue(value: unknown): unknown {
    if (value === null || value === undefined) {
        return value;
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(normalizeValue);
    }

    if (typeof value === "object") {
        const normalized: { [key: string]: unknown } = {};
        for (const [key, val] of Object.entries(value)) {
            normalized[key] = normalizeValue(val);
        }
        return normalized;
    }

    return String(value);
}

/**
 * Captures the current state of an element in a normalized form
 */
export function captureState(element: Record<string, unknown>): Record<string, unknown> {
    return normalizeValue(element) as Record<string, unknown>;
}

/**
 * Checks if two normalized values are equal
 */
function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null || a === undefined || b === undefined) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((item, index) => isEqual(item, b[index]));
    }

    if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        return keysA.every((key) => keysB.includes(key) && isEqual(a[key], b[key]));
    }

    return false;
}

/**
 * Builds a path string from an array of path segments
 */
function buildPath(segments: (string | number)[]): string {
    return segments.join(".");
}

/**
 * Recursively compares two objects and generates LogDifference entries
 */
function compareObjects(
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    pathSegments: (string | number)[] = [],
    options: DiffOptions = {}
): LogDifference[] {
    const differences: LogDifference[] = [];
    const currentPath = buildPath(pathSegments);

    // Check max depth
    if (options.maxDepth !== undefined && pathSegments.length >= options.maxDepth) {
        return differences;
    }

    // Check if path should be ignored
    if (options.ignorePaths?.includes(currentPath)) {
        return differences;
    }

    // Get all unique keys from both objects
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of allKeys) {
        const newPathSegments = [...pathSegments, key];
        const path = buildPath(newPathSegments);

        // Skip ignored paths
        if (options.ignorePaths?.includes(path)) {
            continue;
        }

        const beforeValue = before[key];
        const afterValue = after[key];

        // Key was removed
        if (beforeValue !== undefined && afterValue === undefined) {
            differences.push({ type: "remove", path, origin_value: beforeValue });
        }
        // Key was added
        else if (beforeValue === undefined && afterValue !== undefined) {
            differences.push({ type: "add", path, value: afterValue });
        }
        // Key exists in both - check for changes
        else if (beforeValue !== undefined && afterValue !== undefined) {
            if (!isEqual(beforeValue, afterValue)) {
                // If both are objects, recurse
                if (
                    typeof beforeValue === "object" &&
                    typeof afterValue === "object" &&
                    beforeValue !== null &&
                    afterValue !== null &&
                    !Array.isArray(beforeValue) &&
                    !Array.isArray(afterValue)
                ) {
                    differences.push(
                        ...compareObjects(
                            beforeValue as Record<string, unknown>,
                            afterValue as Record<string, unknown>,
                            newPathSegments,
                            options
                        )
                    );
                } else {
                    // If both are arrays, compare them as arrays
                    if (Array.isArray(beforeValue) && Array.isArray(afterValue)) {
                        differences.push(...compareArrays(beforeValue, afterValue, newPathSegments, options));
                    } else {
                        differences.push({ type: "set", path, value: afterValue, origin_value: beforeValue });
                    }
                }
            }
        }
    }

    return differences;
}

/**
 * Compares two arrays and generates LogDifference entries
 */
function compareArrays(
    before: unknown[],
    after: unknown[],
    pathSegments: (string | number)[] = [],
    options: DiffOptions = {}
): LogDifference[] {
    const differences: LogDifference[] = [];

    // Compare arrays by index
    const maxLength = Math.max(before.length, after.length);

    for (let i = 0; i < maxLength; i++) {
        const newPathSegments = [...pathSegments, i];
        const path = buildPath(newPathSegments);

        if (options.ignorePaths?.includes(path)) {
            continue;
        }

        const beforeValue = before[i];
        const afterValue = after[i];

        if (beforeValue !== undefined && afterValue === undefined) {
            differences.push({ type: "remove", path, origin_value: beforeValue });
        } else if (beforeValue === undefined && afterValue !== undefined) {
            differences.push({ type: "add", path, value: afterValue });
        } else if (beforeValue !== undefined && afterValue !== undefined) {
            if (!isEqual(beforeValue, afterValue)) {
                if (typeof beforeValue === "object" && typeof afterValue === "object" && beforeValue !== null && afterValue !== null) {
                    if (Array.isArray(beforeValue) && Array.isArray(afterValue)) {
                        differences.push(...compareArrays(beforeValue, afterValue, newPathSegments, options));
                    } else if (!Array.isArray(beforeValue) && !Array.isArray(afterValue)) {
                        differences.push(
                            ...compareObjects(
                                beforeValue as Record<string, unknown>,
                                afterValue as Record<string, unknown>,
                                newPathSegments,
                                options
                            )
                        );
                    } else {
                        differences.push({ type: "set", path, value: afterValue, origin_value: beforeValue });
                    }
                } else {
                    differences.push({ type: "set", path, value: afterValue, origin_value: beforeValue });
                }
            }
        }
    }

    return differences;
}

/**
 * Main diff function that compares two states and returns differences
 */
export function deepDiff(before: unknown, after: unknown, options: DiffOptions = {}): LogDifference[] {
    const normalizedBefore = normalizeValue(before);
    const normalizedAfter = normalizeValue(after);

    // If values are primitives or null/undefined, compare directly
    if (
        typeof normalizedBefore !== "object" ||
        typeof normalizedAfter !== "object" ||
        normalizedBefore === null ||
        normalizedAfter === null
    ) {
        if (!isEqual(normalizedBefore, normalizedAfter)) {
            return [{ type: "set", path: "", value: normalizedAfter, origin_value: normalizedBefore }];
        }
        return [];
    }

    // Handle arrays
    if (Array.isArray(normalizedBefore) && Array.isArray(normalizedAfter)) {
        return compareArrays(normalizedBefore, normalizedAfter, [], options);
    }

    // Handle objects
    if (!Array.isArray(normalizedBefore) && !Array.isArray(normalizedAfter)) {
        return compareObjects(normalizedBefore as Record<string, unknown>, normalizedAfter as Record<string, unknown>, [], options);
    }

    return [{ type: "set", path: "", value: normalizedAfter, origin_value: normalizedBefore }];
}
