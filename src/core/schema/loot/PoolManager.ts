import type { MinecraftLootPool, MinecraftLootTable, LootTableProps } from "./types";
import { KNOWN_POOL_FIELDS } from "./types";

/**
 * Initializes pools map for compilation
 */
export function initializePoolsMap(props: LootTableProps, original?: MinecraftLootTable): Map<number, MinecraftLootPool> {
    const poolMap = new Map<number, MinecraftLootPool>();

    // Optimisation: calculer le max pool index une seule fois
    const maxPoolIndex = calculateMaxPoolIndex(props, original);

    // Optimisation: créer des Maps pour les lookups rapides
    const poolDataMap = new Map<number, any>();
    if (props.pools) {
        for (const poolData of props.pools) {
            poolDataMap.set(poolData.poolIndex, poolData);
        }
    }

    // Initialize pools
    for (let i = 0; i <= maxPoolIndex; i++) {
        const poolData = poolDataMap.get(i);
        const originalPool = original?.pools?.[i];

        // Optimisation: éviter les undefined checks répétés
        const rolls = poolData?.rolls !== undefined ? poolData.rolls : originalPool?.rolls !== undefined ? originalPool.rolls : 1;

        const pool: MinecraftLootPool = {
            rolls,
            bonus_rolls: poolData?.bonus_rolls || originalPool?.bonus_rolls,
            functions: poolData?.functions || originalPool?.functions || [],
            conditions: poolData?.conditions || originalPool?.conditions || [],
            entries: []
        };

        // Optimisation: traitement conditionnel des unknown fields
        if (poolData?.unknownFields) {
            Object.assign(pool, poolData.unknownFields);
        } else if (originalPool) {
            // Optimisation: éviter Object.entries si pas nécessaire
            for (const key in originalPool) {
                if (!KNOWN_POOL_FIELDS.has(key)) {
                    (pool as any)[key] = (originalPool as any)[key];
                }
            }
        }

        poolMap.set(i, pool);
    }

    return poolMap;
}

/**
 * Calcule l'index maximum des pools de manière optimisée
 */
function calculateMaxPoolIndex(props: LootTableProps, original?: MinecraftLootTable): number {
    let maxIndex = -1;

    // Optimisation: éviter les créations d'arrays inutiles
    for (const item of props.items) {
        if (item.poolIndex > maxIndex) maxIndex = item.poolIndex;
    }

    for (const group of props.groups) {
        if (group.poolIndex > maxIndex) maxIndex = group.poolIndex;
    }

    if (props.pools) {
        for (const pool of props.pools) {
            if (pool.poolIndex > maxIndex) maxIndex = pool.poolIndex;
        }
    }

    if (original?.pools) {
        const originalMaxIndex = original.pools.length - 1;
        if (originalMaxIndex > maxIndex) maxIndex = originalMaxIndex;
    }

    return maxIndex;
}
