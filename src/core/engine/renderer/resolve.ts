import type { ToggleSectionMap } from "@/core/schema/primitive/toggle";

export function resolve<T>(value: T, toggleSection: ToggleSectionMap): T {
    return resolveField(value, toggleSection);
}

export function resolveField<T>(value: T, toggleSection: ToggleSectionMap): T {
    if (value == null) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => resolveField(item, toggleSection)) as T;
    }

    if (typeof value === "string") {
        if (value.startsWith("$resolver.name$:")) {
            const group = value.substring("$resolver.name$:".length);
            return resolveToggleValue(group, "name", toggleSection) as T;
        }
        if (value.startsWith("$resolver.field$:")) {
            const group = value.substring("$resolver.field$:".length);
            return resolveToggleValue(group, "field", toggleSection) as T;
        }
        return value as T;
    }

    if (typeof value === "object") {
        return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, val]) => {
            acc[key] = resolveField(val, toggleSection);
            return acc;
        }, {}) as T;
    }

    return value;
}

function resolveToggleValue(group: string, type: "field" | "name", toggleSection?: ToggleSectionMap): string {
    if (!toggleSection || Object.keys(toggleSection).length === 0) {
        throw new Error(`Cannot resolve toggle ${type} ${group}: no toggle section provided`);
    }

    const result = toggleSection[group]?.[type];

    if (!result) {
        throw new Error(`Toggle ${type} not found for group: ${group}`);
    }

    return result;
}
