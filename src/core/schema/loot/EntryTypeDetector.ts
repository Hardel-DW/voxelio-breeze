import type { EntryType, GroupType } from "./types";

/**
 * Determines the entry type based on the Minecraft entry type string
 */
export function detectEntryType(type: string): EntryType {
    const normalizedType = type.startsWith("minecraft:") ? type : `minecraft:${type}`;

    switch (normalizedType) {
        case "minecraft:item":
        case "minecraft:tag":
        case "minecraft:loot_table":
        case "minecraft:dynamic":
        case "minecraft:empty":
        case "minecraft:alternatives":
        case "minecraft:group":
        case "minecraft:sequence":
            return normalizedType;
        default:
            // For mod entry types, return the original type as-is
            // This allows mods to define custom entry types
            return type;
    }
}

/**
 * Determines if an entry type is a group type
 */
export function isGroupType(type: string): boolean {
    const normalizedType = type.replace("minecraft:", "");
    return normalizedType === "alternatives" || normalizedType === "group" || normalizedType === "sequence";
}

/**
 * Converts entry type to group type
 */
export function entryTypeToGroupType(type: string): GroupType {
    const normalizedType = type.replace("minecraft:", "");

    switch (normalizedType) {
        case "alternatives":
        case "group":
        case "sequence":
            return normalizedType;
        default:
            throw new Error(`Unknown group type: ${type}`);
    }
}
