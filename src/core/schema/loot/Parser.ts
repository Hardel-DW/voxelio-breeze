import type { LootTableProps, MinecraftLootTable, ProcessingContext, LootTableParser, PoolData } from "./types";
import type { ParserParams } from "@/core/engine/Parser";
import type { DataDrivenRegistryElement } from "@/core/Element";
import { processEntry } from "./EntryProcessor";

/**
 * Parse Minecraft LootTable to simplified Voxel format
 */
export const LootDataDrivenToVoxelFormat: LootTableParser = ({
    element,
    configurator
}: ParserParams<MinecraftLootTable>): LootTableProps => {
    const clone = structuredClone(element);

    const context: ProcessingContext = {
        items: [],
        groups: [],
        itemCounter: 0,
        groupCounter: 0
    };

    const poolsData = extractPoolsData(clone);
    processAllPools(clone, context);

    return {
        identifier: element.identifier,
        ...(clone.data.type && { type: clone.data.type }),
        items: context.items,
        groups: context.groups,
        ...(clone.data.random_sequence && { randomSequence: clone.data.random_sequence }),
        ...(clone.data.functions && clone.data.functions.length > 0 && { functions: clone.data.functions }),
        ...(poolsData.length > 0 && { pools: poolsData }),
        override: configurator
    };
};

/**
 * Extracts pool data from the cloned element
 */
function extractPoolsData(clone: DataDrivenRegistryElement<MinecraftLootTable>): PoolData[] {
    const poolsData: PoolData[] = [];

    clone.data.pools?.forEach((pool, poolIndex) => {
        poolsData.push({
            poolIndex,
            rolls: pool.rolls,
            ...(pool.bonus_rolls !== undefined && { bonus_rolls: pool.bonus_rolls }),
            ...(pool.functions && pool.functions.length > 0 && { functions: pool.functions }),
            ...(pool.conditions && pool.conditions.length > 0 && { conditions: pool.conditions })
        });
    });

    return poolsData;
}

/**
 * Processes all pools and their entries
 */
function processAllPools(clone: DataDrivenRegistryElement<MinecraftLootTable>, context: ProcessingContext): void {
    clone.data.pools?.forEach((pool, poolIndex) => {
        pool.entries?.forEach((entry, entryIndex) => {
            processEntry(entry, poolIndex, entryIndex, context);
        });
    });
}
