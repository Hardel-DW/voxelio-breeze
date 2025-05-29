import type { LootGroup, LootItem, MinecraftLootEntry, LootTableProps } from "./types";

/**
 * Builds a Minecraft entry from a LootItem
 */
export function buildItemEntry(item: LootItem): MinecraftLootEntry {
    const type = item.entryType;
    if (!type) {
        throw new Error(`No entryType found for item ${item.name}`);
    }

    const entry: MinecraftLootEntry = {
        type,
        ...(item.weight && { weight: item.weight }),
        ...(item.quality !== undefined && { quality: item.quality }),
        ...(item.conditions && item.conditions.length > 0 && { conditions: item.conditions }),
        ...(item.functions && item.functions.length > 0 && { functions: item.functions }),
        ...(item.expand !== undefined && { expand: item.expand })
    };

    switch (type) {
        case "minecraft:loot_table":
            entry.value = item.value ?? item.name;
            break;
        case "minecraft:tag":
            entry.name = item.name.startsWith("#") ? item.name.substring(1) : item.name;
            break;
        case "minecraft:empty":
            break;
        default:
            entry.name = item.name;
            break;
    }

    return entry;
}

/**
 * Builds a Minecraft group entry recursively
 */
export function buildGroupEntry(group: LootGroup, props: LootTableProps): MinecraftLootEntry {
    const children: MinecraftLootEntry[] = [];

    for (const itemId of group.items) {
        const childEntry = buildChildEntry(itemId, props);
        if (childEntry) {
            children.push(childEntry);
        }
    }

    return {
        type: `minecraft:${group.type}`,
        children,
        ...(group.conditions && group.conditions.length > 0 && { conditions: group.conditions }),
        functions: group.functions || []
    };
}

/**
 * Builds a child entry (either item or nested group)
 */
function buildChildEntry(itemId: string, props: LootTableProps): MinecraftLootEntry | null {
    // Check if this is a nested group
    const nestedGroup = props.groups.find((g) => g.id === itemId);
    if (nestedGroup) {
        return buildGroupEntry(nestedGroup, props);
    }

    // It's a regular item
    const item = props.items.find((i) => i.id === itemId);
    if (!item) return null;

    return buildItemEntry(item);
}

/**
 * Collects all items that are used in groups to avoid duplication
 */
export function collectItemsInGroups(groups: LootGroup[]): Set<string> {
    const itemsInGroups = new Set<string>();

    for (const group of groups) {
        for (const itemId of group.items) {
            itemsInGroups.add(itemId);
        }
    }

    return itemsInGroups;
}

/**
 * Finds top-level groups (groups that aren't children of other groups)
 */
export function findTopLevelGroups(groups: LootGroup[]): LootGroup[] {
    return groups.filter((group) => {
        const isChildGroup = groups.some((otherGroup) => otherGroup.id !== group.id && otherGroup.items.includes(group.id));
        return !isChildGroup;
    });
}
