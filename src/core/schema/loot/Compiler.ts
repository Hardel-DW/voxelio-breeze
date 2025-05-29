import type { LootTableProps, MinecraftLootTable, LootTableCompiler, CompilerResult } from "./types";
import type { Analysers } from "@/core/engine/Analyser";
import { initializePoolsMap } from "./PoolManager";
import { buildItemEntry, buildGroupEntry, collectItemsInGroups, findTopLevelGroups } from "./GroupBuilder";

/**
 * Compile Voxel format back to Minecraft LootTable
 */
export const VoxelToLootDataDriven: LootTableCompiler = (
    element: LootTableProps,
    _: keyof Analysers,
    original?: MinecraftLootTable
): CompilerResult => {
    const lootTable = original ? structuredClone(original) : {};

    const poolMap = initializePoolsMap(element, original);

    addStandaloneItemsToPools(element, poolMap);
    addTopLevelGroupsToPools(element, poolMap);

    return buildFinalLootTable(lootTable, element, poolMap);
};

/**
 * Adds standalone items (not in groups) to their respective pools
 */
function addStandaloneItemsToPools(props: LootTableProps, poolMap: Map<number, any>): void {
    const itemsInGroups = collectItemsInGroups(props.groups);

    for (const item of props.items) {
        if (itemsInGroups.has(item.id)) continue;

        const pool = poolMap.get(item.poolIndex);
        if (!pool) continue;

        const entry = buildItemEntry(item);
        pool.entries.push(entry);
    }
}

/**
 * Adds top-level groups to their respective pools
 */
function addTopLevelGroupsToPools(props: LootTableProps, poolMap: Map<number, any>): void {
    const topLevelGroups = findTopLevelGroups(props.groups);
    const processedGroups = new Set<string>();

    for (const group of topLevelGroups) {
        if (processedGroups.has(group.id)) continue;

        const pool = poolMap.get(group.poolIndex);
        if (!pool) continue;

        const groupEntry = buildGroupEntry(group, props);
        pool.entries.push(groupEntry);
        processedGroups.add(group.id);
    }
}

/**
 * Builds the final loot table structure
 */
function buildFinalLootTable(lootTable: any, props: LootTableProps, poolMap: Map<number, any>): CompilerResult {
    lootTable.type = props.type;
    lootTable.pools = Array.from(poolMap.values());
    lootTable.random_sequence = props.randomSequence;

    if (props.functions && props.functions.length > 0) {
        lootTable.functions = props.functions;
    }

    if (props.unknownFields) {
        Object.assign(lootTable, props.unknownFields);
    }

    return {
        element: {
            data: lootTable,
            identifier: props.identifier
        },
        tags: []
    };
}
