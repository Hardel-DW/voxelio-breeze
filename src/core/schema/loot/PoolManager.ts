import type { MinecraftLootPool, MinecraftLootTable, LootTableProps } from "./types";

/**
 * Initializes pools map for compilation
 */
export function initializePoolsMap(props: LootTableProps, original?: MinecraftLootTable): Map<number, MinecraftLootPool> {
    const poolMap = new Map<number, MinecraftLootPool>();

    // Find the maximum pool index
    const itemPoolIndices = props.items.map((item) => item.poolIndex);
    const groupPoolIndices = props.groups.map((group) => group.poolIndex);
    const maxPoolIndex = Math.max(...itemPoolIndices, ...groupPoolIndices, -1);

    // Initialize pools
    for (let i = 0; i <= maxPoolIndex; i++) {
        const poolData = props.pools?.find((p) => p.poolIndex === i);
        const originalPool = original?.pools?.[i];

        poolMap.set(i, {
            rolls: poolData?.rolls || originalPool?.rolls || { min: 1, max: 1 },
            bonus_rolls: poolData?.bonus_rolls || originalPool?.bonus_rolls,
            functions: poolData?.functions || originalPool?.functions || [],
            conditions: poolData?.conditions || originalPool?.conditions || [],
            entries: []
        });
    }

    return poolMap;
}
