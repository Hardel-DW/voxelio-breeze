import type { LootItem, LootGroup, MinecraftLootEntry, ProcessingContext } from "./types";
import { detectEntryType, entryTypeToGroupType } from "./EntryTypeDetector";

/**
 * Creates a LootItem from a Minecraft entry
 */
export function createLootItem(
    entry: MinecraftLootEntry,
    poolIndex: number,
    entryIndex: number,
    context: ProcessingContext,
    idPrefix = "item"
): LootItem {
    const itemId = `${idPrefix}_${context.itemCounter++}`;

    let name = entry.name || "";

    // Handle special cases for name formatting
    if (detectEntryType(entry.type) === "minecraft:tag" && name && !name.startsWith("#")) {
        name = `#${name}`;
    }

    if (detectEntryType(entry.type) === "minecraft:loot_table") {
        const tableName = entry.name || entry.value;
        name = typeof tableName === "string" ? tableName : "embedded_table";
    }

    return {
        id: itemId,
        name,
        weight: entry.weight,
        quality: entry.quality,
        conditions: entry.conditions || [],
        functions: entry.functions || [],
        poolIndex,
        entryIndex
    };
}

/**
 * Creates a LootGroup from a Minecraft entry
 */
export function createLootGroup(
    entry: MinecraftLootEntry,
    poolIndex: number,
    entryIndex: number,
    context: ProcessingContext,
    childItemIds: string[] = []
): LootGroup {
    const groupId = `group_${context.groupCounter++}`;
    const groupType = entryTypeToGroupType(entry.type);

    return {
        id: groupId,
        type: groupType,
        name: entry.name,
        items: childItemIds,
        conditions: entry.conditions || [],
        poolIndex,
        entryIndex
    };
}

/**
 * Creates a dynamic item (minecraft:contents, etc.)
 */
export function createDynamicItem(entry: MinecraftLootEntry, poolIndex: number, entryIndex: number, context: ProcessingContext): LootItem {
    return createLootItem(entry, poolIndex, entryIndex, context, "dynamic");
}
