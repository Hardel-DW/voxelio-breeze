import type { MinecraftLootPool, MinecraftLootTable, LootTableProps } from "./types";
import { KNOWN_POOL_FIELDS } from "./types";

/**
 * Initializes pools map for compilation
 */
export function initializePoolsMap(props: LootTableProps, original?: MinecraftLootTable): Map<number, MinecraftLootPool> {
    const poolMap = new Map<number, MinecraftLootPool>();

    // Find the maximum pool index from all sources
    const itemPoolIndices = props.items.map((item) => item.poolIndex);
    const groupPoolIndices = props.groups.map((group) => group.poolIndex);
    const poolDataIndices = props.pools?.map((p) => p.poolIndex) || [];
    const originalPoolIndices = original?.pools?.map((_, index) => index) || [];
    const maxPoolIndex = Math.max(...itemPoolIndices, ...groupPoolIndices, ...poolDataIndices, ...originalPoolIndices, -1);

    // Initialize pools
    for (let i = 0; i <= maxPoolIndex; i++) {
        const poolData = props.pools?.find((p) => p.poolIndex === i);
        const originalPool = original?.pools?.[i];
        const rolls = poolData?.rolls !== undefined ? poolData.rolls : originalPool?.rolls !== undefined ? originalPool.rolls : 1;

        const pool: MinecraftLootPool = {
            rolls,
            bonus_rolls: poolData?.bonus_rolls || originalPool?.bonus_rolls,
            functions: poolData?.functions || originalPool?.functions || [],
            conditions: poolData?.conditions || originalPool?.conditions || [],
            entries: []
        };

        // Restore unknown fields from mods at pool level
        if (poolData?.unknownFields) {
            Object.assign(pool, poolData.unknownFields);
        } else if (originalPool) {
            for (const [key, value] of Object.entries(originalPool)) {
                if (!KNOWN_POOL_FIELDS.has(key)) {
                    (pool as any)[key] = value;
                }
            }
        }

        poolMap.set(i, pool);
    }

    return poolMap;
}
