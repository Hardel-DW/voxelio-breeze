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
        ...(item.expand !== undefined && { expand: item.expand }),
        ...(item.unknownFields && item.unknownFields)
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
    // Optimisation: créer des caches locaux pour cette compilation
    const itemLookupCache = new Map<string, LootItem>();
    const groupLookupCache = new Map<string, LootGroup>();

    for (const item of props.items) {
        itemLookupCache.set(item.id, item);
    }

    for (const g of props.groups) {
        groupLookupCache.set(g.id, g);
    }

    const children: MinecraftLootEntry[] = [];

    for (const itemId of group.items) {
        const childEntry = buildChildEntry(itemId, itemLookupCache, groupLookupCache, props);
        if (childEntry) {
            children.push(childEntry);
        }
    }

    return {
        type: `minecraft:${group.type}`,
        children,
        ...(group.conditions && group.conditions.length > 0 && { conditions: group.conditions }),
        functions: group.functions || [],
        ...(group.unknownFields && group.unknownFields)
    };
}

/**
 * Builds a child entry (either item or nested group) using cache
 */
function buildChildEntry(
    itemId: string,
    itemCache: Map<string, LootItem>,
    groupCache: Map<string, LootGroup>,
    props: LootTableProps
): MinecraftLootEntry | null {
    // Optimisation: utiliser le cache au lieu de find()
    const nestedGroup = groupCache.get(itemId);
    if (nestedGroup) {
        return buildGroupEntry(nestedGroup, props);
    }

    const item = itemCache.get(itemId);
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
    const allChildIds = new Set<string>();

    // Première passe: collecter tous les IDs d'enfants
    for (const group of groups) {
        for (const itemId of group.items) {
            allChildIds.add(itemId);
        }
    }

    // Deuxième passe: filtrer les groupes qui ne sont pas des enfants
    return groups.filter((group) => !allChildIds.has(group.id));
}
