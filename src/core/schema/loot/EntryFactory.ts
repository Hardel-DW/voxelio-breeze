import type { LootItem, LootGroup, MinecraftLootEntry, ProcessingContext } from "./types";
import { detectEntryType, entryTypeToGroupType } from "./EntryTypeDetector";
import { extractUnknownFields, KNOWN_ENTRY_FIELDS } from "./types";

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
    const entryType = detectEntryType(entry.type);

    let name = "";
    let value = undefined;
    if (entryType === "minecraft:loot_table") {
        const tableName = entry.value ?? entry.name;
        if (typeof tableName === "string") {
            name = tableName;
        } else {
            name = "embedded_table";
            value = tableName;
        }
    } else if (entryType === "minecraft:empty") {
        name = "minecraft:empty";
    } else {
        name = entry.name ?? "";
        if (entryType === "minecraft:tag" && name && !name.startsWith("#")) {
            name = `#${name}`;
        }
    }

    const unknownFields = extractUnknownFields(entry, KNOWN_ENTRY_FIELDS);

    return {
        id: itemId,
        name,
        entryType,
        ...(value !== undefined && { value }),
        ...(entry.weight !== undefined && { weight: entry.weight }),
        ...(entry.quality !== undefined && { quality: entry.quality }),
        ...(entry.conditions && entry.conditions.length > 0 && { conditions: entry.conditions }),
        ...(entry.functions && entry.functions.length > 0 && { functions: entry.functions }),
        ...(entry.expand !== undefined && { expand: entry.expand }),
        poolIndex,
        entryIndex,
        ...(unknownFields && { unknownFields })
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
    const unknownFields = extractUnknownFields(entry, KNOWN_ENTRY_FIELDS);

    return {
        id: groupId,
        type: groupType,
        ...(entry.name && { name: entry.name }),
        items: childItemIds,
        ...(entry.conditions && entry.conditions.length > 0 && { conditions: entry.conditions }),
        ...(entry.functions && entry.functions.length > 0 && { functions: entry.functions }),
        poolIndex,
        entryIndex,
        ...(unknownFields && { unknownFields })
    };
}
