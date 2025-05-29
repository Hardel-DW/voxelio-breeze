import type { MinecraftLootEntry, ProcessingContext } from "./types";
import { detectEntryType, isGroupType } from "./EntryTypeDetector";
import { createLootItem, createLootGroup, createDynamicItem } from "./EntryFactory";

/**
 * Processes a single Minecraft entry and adds it to the context
 */
export function processEntry(entry: MinecraftLootEntry, poolIndex: number, entryIndex: number, context: ProcessingContext): void {
    const entryType = detectEntryType(entry.type);

    switch (entryType) {
        case "minecraft:item": {
            const item = createLootItem(entry, poolIndex, entryIndex, context);
            context.items.push(item);
            break;
        }
        case "minecraft:tag": {
            const item = createLootItem(entry, poolIndex, entryIndex, context, "tag");
            context.items.push(item);
            break;
        }
        case "minecraft:loot_table": {
            const item = createLootItem(entry, poolIndex, entryIndex, context, "loot_table");
            context.items.push(item);
            break;
        }
        case "minecraft:dynamic": {
            const item = createDynamicItem(entry, poolIndex, entryIndex, context);
            context.items.push(item);
            break;
        }
        case "minecraft:alternatives":
        case "minecraft:group":
        case "minecraft:sequence": {
            processGroupEntry(entry, poolIndex, entryIndex, context);
            break;
        }
    }
}

/**
 * Processes a group entry and its children
 */
function processGroupEntry(entry: MinecraftLootEntry, poolIndex: number, entryIndex: number, context: ProcessingContext): void {
    const childItemIds: string[] = [];

    // Process children and collect their IDs
    for (const child of entry.children || []) {
        const childId = processChildEntry(child, poolIndex, entryIndex, context);
        if (childId) {
            childItemIds.push(childId);
        }
    }

    const group = createLootGroup(entry, poolIndex, entryIndex, context, childItemIds);
    context.groups.push(group);
}

/**
 * Processes a child entry recursively and returns its ID
 */
function processChildEntry(entry: MinecraftLootEntry, poolIndex: number, entryIndex: number, context: ProcessingContext): string {
    const entryType = detectEntryType(entry.type);

    switch (entryType) {
        case "minecraft:item": {
            const item = createLootItem(entry, poolIndex, entryIndex, context);
            context.items.push(item);
            return item.id;
        }
        case "minecraft:dynamic": {
            const item = createDynamicItem(entry, poolIndex, entryIndex, context);
            context.items.push(item);
            return item.id;
        }
        case "minecraft:alternatives":
        case "minecraft:group":
        case "minecraft:sequence": {
            return processNestedGroup(entry, poolIndex, entryIndex, context);
        }
        default:
            return "";
    }
}

/**
 * Processes a nested group entry
 */
function processNestedGroup(entry: MinecraftLootEntry, poolIndex: number, entryIndex: number, context: ProcessingContext): string {
    const nestedChildIds: string[] = [];

    for (const grandChild of entry.children || []) {
        const grandChildId = processChildEntry(grandChild, poolIndex, entryIndex, context);
        if (grandChildId) {
            nestedChildIds.push(grandChildId);
        }
    }

    const group = createLootGroup(entry, poolIndex, entryIndex, context, nestedChildIds);
    context.groups.push(group);

    return group.id;
}
