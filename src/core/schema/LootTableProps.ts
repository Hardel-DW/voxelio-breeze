import type { DataDrivenElement, VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { IdentifierObject } from "@/core/Identifier";
import type { Analysers } from "@/core/engine/Analyser";
import type { Compiler } from "@/core/engine/Compiler";
import type { Parser, ParserParams } from "@/core/engine/Parser";

// Simplified loot table structure for UI
export interface LootTableProps extends VoxelElement {
    type?: string; // LootContextType
    items: LootItem[];
    groups: LootGroup[];
    randomSequence?: string;
    functions?: any[]; // Store complete function objects at table level
    pools?: PoolData[]; // Store pool-level data
}

/**
 * LootItem is a simplified loot table item.
 * id. Represents the item id.
 */
export interface LootItem {
    id: string;
    name: string;
    weight?: number;
    quality?: number;
    count?: {
        min: number;
        max: number;
    };
    conditions?: any[]; // Store complete condition objects
    functions?: any[]; // Store complete function objects
    poolIndex: number;
    entryIndex: number;
}

/**
 * LootGroup is a simplified loot table group.
 * id. Represents the group id.
 */
export interface LootGroup {
    id: string;
    type: "alternatives" | "group" | "sequence";
    name?: string;
    items: string[];
    conditions?: any[]; // Store complete condition objects
    poolIndex: number;
    entryIndex: number;
}

// Pool-level data that needs to be preserved
export interface PoolData {
    poolIndex: number;
    rolls: any;
    bonus_rolls?: any;
    functions?: any[];
    conditions?: any[];
}

// Original Minecraft LootTable format (simplified)
export interface MinecraftLootTable extends DataDrivenElement {
    type?: string;
    pools?: MinecraftLootPool[];
    functions?: any[];
    random_sequence?: string;
}

export interface MinecraftLootPool {
    rolls: any;
    bonus_rolls?: any;
    entries: MinecraftLootEntry[];
    functions?: any[];
    conditions?: any[];
}

export interface MinecraftLootEntry {
    type: string;
    name?: string;
    value?: any;
    weight?: number;
    quality?: number;
    functions?: any[];
    conditions?: any[];
    children?: MinecraftLootEntry[];
    expand?: boolean;
}

/**
 * Parse Minecraft LootTable to simplified Voxel format
 */
export const LootDataDrivenToVoxelFormat: Parser<LootTableProps, MinecraftLootTable> = ({
    element,
    configurator
}: ParserParams<MinecraftLootTable>): LootTableProps => {
    const clone = structuredClone(element);
    const items: LootItem[] = [];
    const groups: LootGroup[] = [];
    const poolsData: PoolData[] = [];

    let itemCounter = 0;
    let groupCounter = 0;

    const processEntry = (entry: MinecraftLootEntry, poolIndex: number, entryIndex: number): void => {
        switch (entry.type) {
            case "minecraft:item":
            case "item": {
                const itemId = `item_${itemCounter++}`;
                items.push({
                    id: itemId,
                    name: entry.name || "",
                    weight: entry.weight,
                    quality: entry.quality,
                    conditions: entry.conditions || [],
                    functions: entry.functions || [],
                    poolIndex,
                    entryIndex
                });
                break;
            }
            case "minecraft:tag":
            case "tag": {
                const itemId = `tag_${itemCounter++}`;
                items.push({
                    id: itemId,
                    name: `#${entry.name}`,
                    weight: entry.weight,
                    quality: entry.quality,
                    conditions: entry.conditions || [],
                    functions: entry.functions || [],
                    poolIndex,
                    entryIndex
                });
                break;
            }
            case "minecraft:loot_table":
            case "loot_table": {
                const itemId = `loot_table_${itemCounter++}`;
                const tableName = entry.name || entry.value;
                items.push({
                    id: itemId,
                    name: typeof tableName === "string" ? tableName : "embedded_table",
                    weight: entry.weight,
                    quality: entry.quality,
                    conditions: entry.conditions || [],
                    functions: entry.functions || [],
                    poolIndex,
                    entryIndex
                });
                break;
            }
            case "minecraft:alternatives":
            case "alternatives":
            case "minecraft:group":
            case "group":
            case "minecraft:sequence":
            case "sequence": {
                const groupId = `group_${groupCounter++}`;
                const childItemIds: string[] = [];

                // Process children first and collect their IDs
                for (const child of entry.children || []) {
                    if (child.type === "minecraft:item" || child.type === "item") {
                        const itemId = `item_${itemCounter++}`;
                        items.push({
                            id: itemId,
                            name: child.name || "",
                            weight: child.weight,
                            quality: child.quality,
                            conditions: child.conditions || [],
                            functions: child.functions || [],
                            poolIndex,
                            entryIndex
                        });
                        childItemIds.push(itemId);
                    } else if (child.type === "minecraft:dynamic" || child.type === "dynamic") {
                        const itemId = `dynamic_${itemCounter++}`;
                        items.push({
                            id: itemId,
                            name: child.name || "",
                            weight: child.weight,
                            quality: child.quality,
                            conditions: child.conditions || [],
                            functions: child.functions || [],
                            poolIndex,
                            entryIndex
                        });
                        childItemIds.push(itemId);
                    } else if (child.type?.includes("group") || child.type?.includes("alternatives") || child.type?.includes("sequence")) {
                        // Recursively process any child entry
                        const processChildEntry = (childEntry: MinecraftLootEntry): string => {
                            if (childEntry.type === "minecraft:item" || childEntry.type === "item") {
                                const itemId = `item_${itemCounter++}`;
                                items.push({
                                    id: itemId,
                                    name: childEntry.name || "",
                                    weight: childEntry.weight,
                                    quality: childEntry.quality,
                                    conditions: childEntry.conditions || [],
                                    functions: childEntry.functions || [],
                                    poolIndex,
                                    entryIndex
                                });
                                return itemId;
                            }

                            if (childEntry.type === "minecraft:dynamic" || childEntry.type === "dynamic") {
                                const itemId = `dynamic_${itemCounter++}`;
                                items.push({
                                    id: itemId,
                                    name: childEntry.name || "",
                                    weight: childEntry.weight,
                                    quality: childEntry.quality,
                                    conditions: childEntry.conditions || [],
                                    functions: childEntry.functions || [],
                                    poolIndex,
                                    entryIndex
                                });
                                return itemId;
                            }

                            if (
                                childEntry.type?.includes("group") ||
                                childEntry.type?.includes("alternatives") ||
                                childEntry.type?.includes("sequence")
                            ) {
                                const nestedGroupId = `group_${groupCounter++}`;
                                const nestedChildIds: string[] = [];

                                for (const grandChild of childEntry.children || []) {
                                    const grandChildId = processChildEntry(grandChild);
                                    nestedChildIds.push(grandChildId);
                                }

                                const nestedGroupType = childEntry.type.replace("minecraft:", "") as "alternatives" | "group" | "sequence";
                                groups.push({
                                    id: nestedGroupId,
                                    type: nestedGroupType,
                                    items: nestedChildIds,
                                    conditions: childEntry.conditions || [],
                                    poolIndex,
                                    entryIndex
                                });

                                return nestedGroupId;
                            }
                            return "";
                        };

                        const nestedGroupId = processChildEntry(child);
                        if (nestedGroupId) {
                            childItemIds.push(nestedGroupId);
                        }
                    }
                }

                const groupType = entry.type.replace("minecraft:", "") as "alternatives" | "group" | "sequence";
                groups.push({
                    id: groupId,
                    type: groupType,
                    items: childItemIds,
                    conditions: entry.conditions || [],
                    poolIndex,
                    entryIndex
                });
                break;
            }
        }
    };

    clone.data.pools?.forEach((pool, poolIndex) => {
        // Store pool-level data
        poolsData.push({
            poolIndex,
            rolls: pool.rolls,
            bonus_rolls: pool.bonus_rolls,
            functions: pool.functions || [],
            conditions: pool.conditions || []
        });

        pool.entries?.forEach((entry, entryIndex) => {
            processEntry(entry, poolIndex, entryIndex);
        });
    });

    return {
        identifier: element.identifier,
        type: clone.data.type,
        items,
        groups,
        randomSequence: clone.data.random_sequence,
        functions: clone.data.functions || [],
        pools: poolsData,
        override: configurator
    };
};

/**
 * Compile Voxel format back to Minecraft LootTable
 */
export const VoxelToLootDataDriven: Compiler<LootTableProps, MinecraftLootTable> = (
    element: LootTableProps,
    _: keyof Analysers,
    original?: MinecraftLootTable
): {
    element: DataDrivenRegistryElement<MinecraftLootTable>;
    tags: IdentifierObject[];
} => {
    const lootTable = structuredClone(original ?? {}) as MinecraftLootTable;
    const props = structuredClone(element);

    // Rebuild pools structure
    const poolMap = new Map<number, MinecraftLootPool>();

    // Initialize pools
    const maxPoolIndex = Math.max(...props.items.map((i) => i.poolIndex), ...props.groups.map((g) => g.poolIndex), -1);

    for (let i = 0; i <= maxPoolIndex; i++) {
        const poolData = props.pools?.find((p) => p.poolIndex === i);
        poolMap.set(i, {
            rolls: poolData?.rolls || original?.pools?.[i]?.rolls || { min: 1, max: 1 },
            bonus_rolls: poolData?.bonus_rolls || original?.pools?.[i]?.bonus_rolls,
            functions: poolData?.functions || original?.pools?.[i]?.functions || [],
            conditions: poolData?.conditions || original?.pools?.[i]?.conditions || [],
            entries: []
        });
    }

    // Track which items are used in groups to avoid duplication
    const itemsInGroups = new Set<string>();

    // Process groups first to collect items used in groups
    for (const group of props.groups) {
        for (const itemId of group.items) {
            itemsInGroups.add(itemId);
        }
    }

    // Add standalone items (not in groups) to pools
    for (const item of props.items) {
        if (itemsInGroups.has(item.id)) continue; // Skip items that are part of groups

        const pool = poolMap.get(item.poolIndex);
        if (!pool) continue;

        let entryType = "minecraft:item";
        let entryName = item.name;

        if (item.name.startsWith("#")) {
            entryType = "minecraft:tag";
            entryName = item.name.substring(1);
        } else if (item.name.includes("/") && !item.name.startsWith("minecraft:")) {
            entryType = "minecraft:loot_table";
        } else if (item.name.includes("minecraft:") && item.name.includes("/")) {
            entryType = "minecraft:loot_table";
        }

        const entry: MinecraftLootEntry = {
            type: entryType,
            ...(entryName && { name: entryName }),
            ...(item.weight && { weight: item.weight }),
            ...(item.quality !== undefined && { quality: item.quality }),
            ...(item.conditions && item.conditions.length > 0 && { conditions: item.conditions }),
            ...(item.functions && item.functions.length > 0 && { functions: item.functions })
        };

        pool.entries.push(entry);
    }

    // Recursive function to build group entries
    const buildGroupEntry = (group: LootGroup): MinecraftLootEntry => {
        const children: MinecraftLootEntry[] = [];

        for (const itemId of group.items) {
            // Check if this is a nested group
            const nestedGroup = props.groups.find((g) => g.id === itemId);
            if (nestedGroup) {
                children.push(buildGroupEntry(nestedGroup));
                continue;
            }

            // It's a regular item
            const item = props.items.find((i) => i.id === itemId);
            if (!item) continue;

            let entryType = "minecraft:item";
            let entryName = item.name;

            if (item.name.startsWith("#")) {
                entryType = "minecraft:tag";
                entryName = item.name.substring(1);
            } else if (item.name === "minecraft:contents") {
                entryType = "minecraft:dynamic";
                entryName = "contents";
            } else if (item.name.includes("/") && !item.name.startsWith("minecraft:")) {
                entryType = "minecraft:loot_table";
            } else if (item.name.includes("minecraft:") && item.name.includes("/")) {
                entryType = "minecraft:loot_table";
            }

            children.push({
                type: entryType,
                ...(entryName && { name: entryName }),
                ...(item.weight && { weight: item.weight }),
                ...(item.quality !== undefined && { quality: item.quality }),
                ...(item.conditions && item.conditions.length > 0 && { conditions: item.conditions }),
                ...(item.functions && item.functions.length > 0 && { functions: item.functions })
            });
        }

        return {
            type: `minecraft:${group.type}`,
            children,
            ...(group.conditions && group.conditions.length > 0 && { conditions: group.conditions })
        };
    };

    // Add top-level groups to pools
    const processedGroups = new Set<string>();
    for (const group of props.groups) {
        // Only process groups that aren't children of other groups
        const isChildGroup = props.groups.some((otherGroup) => otherGroup.id !== group.id && otherGroup.items.includes(group.id));

        if (isChildGroup || processedGroups.has(group.id)) continue;

        const pool = poolMap.get(group.poolIndex);
        if (!pool) continue;

        const groupEntry = buildGroupEntry(group);
        pool.entries.push(groupEntry);
        processedGroups.add(group.id);
    }

    lootTable.type = props.type;
    lootTable.pools = Array.from(poolMap.values());
    lootTable.random_sequence = props.randomSequence;
    if (props.functions && props.functions.length > 0) {
        lootTable.functions = props.functions;
    }

    return {
        element: {
            data: lootTable,
            identifier: element.identifier
        },
        tags: [] // LootTables don't typically use tags like enchantments
    };
};
