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
        type: clone.data.type,
        items: context.items,
        groups: context.groups,
        randomSequence: clone.data.random_sequence,
        functions: clone.data.functions || [],
        pools: poolsData,
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
            bonus_rolls: pool.bonus_rolls,
            functions: pool.functions || [],
            conditions: pool.conditions || []
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
