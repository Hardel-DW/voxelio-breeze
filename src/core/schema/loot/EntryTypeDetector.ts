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
            throw new Error(`Unknown entry type: ${type}`);
    }
}

/**
 * Determines if an entry type is a group type
 */
export function isGroupType(type: string): boolean {
    const entryType = detectEntryType(type);
    return entryType === "minecraft:alternatives" || entryType === "minecraft:group" || entryType === "minecraft:sequence";
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
