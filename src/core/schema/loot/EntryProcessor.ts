import type { MinecraftLootEntry, ProcessingContext } from "./types";
import { detectEntryType } from "./EntryTypeDetector";
import { createLootItem, createLootGroup } from "./EntryFactory";

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
            const item = createLootItem(entry, poolIndex, entryIndex, context, "dynamic");
            context.items.push(item);
            break;
        }
        case "minecraft:empty": {
            const item = createLootItem(entry, poolIndex, entryIndex, context, "empty");
            context.items.push(item);
            break;
        }
        case "minecraft:alternatives":
        case "minecraft:group":
        case "minecraft:sequence": {
            processGroupEntry(entry, poolIndex, entryIndex, context);
            break;
        }
        default: {
            const item = createLootItem(entry, poolIndex, entryIndex, context, "mod");
            context.items.push(item);
            break;
        }
    }
}

/**
 * Processes a group entry and its children
 */
function processGroupEntry(entry: MinecraftLootEntry, poolIndex: number, entryIndex: number, context: ProcessingContext): void {
    const group = createLootGroup(entry, poolIndex, entryIndex, context, []);
    context.groups.push(group);

    const childItemIds: string[] = [];

    // Process children and collect their IDs
    for (const child of entry.children || []) {
        const childId = processChildEntry(child, poolIndex, entryIndex, context);
        if (childId) {
            childItemIds.push(childId);
        }
    }

    // Update the group with the collected child IDs
    group.items = childItemIds;
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
        case "minecraft:tag": {
            const item = createLootItem(entry, poolIndex, entryIndex, context, "tag");
            context.items.push(item);
            return item.id;
        }
        case "minecraft:loot_table": {
            const item = createLootItem(entry, poolIndex, entryIndex, context, "loot_table");
            context.items.push(item);
            return item.id;
        }
        case "minecraft:dynamic": {
            const item = createLootItem(entry, poolIndex, entryIndex, context, "dynamic");
            context.items.push(item);
            return item.id;
        }
        case "minecraft:empty": {
            const item = createLootItem(entry, poolIndex, entryIndex, context, "empty");
            context.items.push(item);
            return item.id;
        }
        case "minecraft:alternatives":
        case "minecraft:group":
        case "minecraft:sequence": {
            return processNestedGroup(entry, poolIndex, entryIndex, context);
        }
        default: {
            const item = createLootItem(entry, poolIndex, entryIndex, context, "mod");
            context.items.push(item);
            return item.id;
        }
    }
}

/**
 * Processes a nested group entry
 */
function processNestedGroup(entry: MinecraftLootEntry, poolIndex: number, entryIndex: number, context: ProcessingContext): string {
    const group = createLootGroup(entry, poolIndex, entryIndex, context, []);
    context.groups.push(group);

    const nestedChildIds: string[] = [];

    for (const grandChild of entry.children || []) {
        const grandChildId = processChildEntry(grandChild, poolIndex, entryIndex, context);
        if (grandChildId) {
            nestedChildIds.push(grandChildId);
        }
    }

    // Update the group with the collected child IDs
    group.items = nestedChildIds;

    return group.id;
}
