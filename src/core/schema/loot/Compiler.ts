import type { Analysers } from "@/core/engine/Analyser";
import type {
    CompilerResult,
    LootGroup,
    LootItem,
    LootTableCompiler,
    LootTableProps,
    MinecraftLootEntry,
    MinecraftLootTable
} from "./types";
import { KNOWN_POOL_FIELDS } from "./types";

/**
 * Compile Voxel format back to Minecraft LootTable - Ultra-simplified version
 */
export const VoxelToLootDataDriven: LootTableCompiler = (
    element: LootTableProps,
    _: keyof Analysers,
    original?: MinecraftLootTable
): CompilerResult => {
    const lootTable = original ? structuredClone(original) : {};

    // Build lookup maps once
    const itemMap = new Map(element.items.map((item) => [item.id, item]));
    const groupMap = new Map(element.groups.map((group) => [group.id, group]));
    const poolDataMap = new Map(element.pools?.map((p) => [p.poolIndex, p]) || []);

    // Find max pool index
    const maxPool = Math.max(
        ...element.items.map((i) => i.poolIndex),
        ...element.groups.map((g) => g.poolIndex),
        ...(element.pools?.map((p) => p.poolIndex) || []),
        (original?.pools?.length || 1) - 1,
        0
    );

    // Initialize pools
    const pools = Array.from({ length: maxPool + 1 }, (_, i) => {
        const poolData = poolDataMap.get(i);
        const originalPool = original?.pools?.[i];

        const pool: any = {
            rolls: poolData?.rolls ?? originalPool?.rolls ?? 1,
            bonus_rolls: poolData?.bonus_rolls || originalPool?.bonus_rolls,
            functions: poolData?.functions || originalPool?.functions || [],
            conditions: poolData?.conditions || originalPool?.conditions || [],
            entries: []
        };

        // Restore unknown fields
        if (poolData?.unknownFields) Object.assign(pool, poolData.unknownFields);
        else if (originalPool) {
            for (const key in originalPool) {
                if (!KNOWN_POOL_FIELDS.has(key)) pool[key] = (originalPool as any)[key];
            }
        }

        return pool;
    });

    // Find items in groups (for exclusion)
    const itemsInGroups = new Set(element.groups.flatMap((g) => g.items));

    // Find child groups (for top-level detection)
    const childGroups = new Set(element.groups.flatMap((g) => g.items).filter((id) => groupMap.has(id)));

    // Add standalone items to pools
    for (const item of element.items) {
        if (!itemsInGroups.has(item.id)) {
            pools[item.poolIndex]?.entries.push(buildEntry(item));
        }
    }

    // Add top-level groups to pools
    for (const group of element.groups) {
        if (!childGroups.has(group.id)) {
            pools[group.poolIndex]?.entries.push(buildGroupEntry(group, itemMap, groupMap));
        }
    }

    // Build final result
    return {
        element: {
            data: {
                ...lootTable,
                type: element.type,
                pools,
                random_sequence: element.randomSequence,
                ...(element.functions?.length && { functions: element.functions }),
                ...(element.unknownFields && element.unknownFields)
            },
            identifier: element.identifier
        },
        tags: []
    };
};

/**
 * Build entry from item - simplified
 */
function buildEntry(item: LootItem): MinecraftLootEntry {
    // Handle items created by actions that might not have entryType
    const entryType = item.entryType || "minecraft:item";

    const entry: MinecraftLootEntry = {
        type: entryType,
        ...(item.weight && { weight: item.weight }),
        ...(item.quality !== undefined && { quality: item.quality }),
        ...(item.conditions?.length && { conditions: item.conditions }),
        ...(item.functions?.length && { functions: item.functions }),
        ...(item.expand !== undefined && { expand: item.expand }),
        ...item.unknownFields
    };

    // Set name/value based on type
    if (entryType === "minecraft:loot_table") entry.value = item.value ?? item.name;
    else if (entryType === "minecraft:tag") entry.name = item.name.replace(/^#/, "");
    else if (entryType !== "minecraft:empty") entry.name = item.name;

    return entry;
}

/**
 * Build group entry recursively - simplified
 */
function buildGroupEntry(group: LootGroup, itemMap: Map<string, LootItem>, groupMap: Map<string, LootGroup>): MinecraftLootEntry {
    return {
        type: `minecraft:${group.type}`,
        children: group.items
            .map((id) => {
                const nestedGroup = groupMap.get(id);
                if (nestedGroup) return buildGroupEntry(nestedGroup, itemMap, groupMap);

                const item = itemMap.get(id);
                return item ? buildEntry(item) : null;
            })
            .filter((entry): entry is MinecraftLootEntry => entry !== null),
        ...(group.conditions?.length && { conditions: group.conditions }),
        functions: group.functions || [],
        ...group.unknownFields
    };
}
