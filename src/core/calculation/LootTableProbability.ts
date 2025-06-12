import type { LootGroup, LootItem, LootTableProps, PoolData } from "@/core/schema/loot/types";

export interface ProbabilityResult {
    itemId: string;
    itemIndex: number;
    poolIndex: number;
    probability: number;
    name: string;
    entryType?: string;
}

export interface ProbabilityOptions {
    luck?: number;
    excludedItemIds?: string[];
    excludeConditionTypes?: string[];
}

export class LootTableProbabilityCalculator {
    private lootTable: LootTableProps;
    private itemMap: Map<string, LootItem & { index: number }>;
    private groupMap: Map<string, LootGroup>;
    private poolMap: Map<number, PoolData>;

    constructor(lootTable: LootTableProps) {
        this.lootTable = lootTable;
        this.itemMap = new Map(lootTable.items.map((item, index) => [item.id, { ...item, index }]));
        this.groupMap = new Map(lootTable.groups.map((group) => [group.id, group]));
        this.poolMap = new Map((lootTable.pools || []).map((pool) => [pool.poolIndex, pool]));
    }

    public calculateProbabilities(options: ProbabilityOptions = {}): ProbabilityResult[] {
        const { luck = 0, excludedItemIds = [], excludeConditionTypes = [] } = options;
        const results: ProbabilityResult[] = [];

        // Group items and groups by pool
        const poolItems = new Map<number, Array<{ item?: LootItem; group?: LootGroup; itemIndex?: number }>>();

        // Add standalone items (not in groups)
        const itemsInGroups = new Set(this.lootTable.groups.flatMap((g) => g.items));

        for (const [itemIndex, item] of this.lootTable.items.entries()) {
            if (!itemsInGroups.has(item.id)) {
                if (!poolItems.has(item.poolIndex)) {
                    poolItems.set(item.poolIndex, []);
                }
                const poolEntries = poolItems.get(item.poolIndex);
                if (poolEntries) {
                    poolEntries.push({ item, itemIndex });
                }
            }
        }

        // Add groups
        const childGroups = new Set(this.lootTable.groups.flatMap((g) => g.items).filter((id) => this.groupMap.has(id)));

        for (const group of this.lootTable.groups) {
            if (!childGroups.has(group.id)) {
                if (!poolItems.has(group.poolIndex)) {
                    poolItems.set(group.poolIndex, []);
                }
                const poolEntries = poolItems.get(group.poolIndex);
                if (poolEntries) {
                    poolEntries.push({ group });
                }
            }
        }

        // Calculate probabilities for each pool
        for (const [poolIndex, entries] of poolItems) {
            const poolData = this.poolMap.get(poolIndex);
            const poolResults = this.calculatePoolProbabilities(entries, poolData, luck, excludedItemIds, excludeConditionTypes);
            results.push(...poolResults);
        }

        return results;
    }

    private calculatePoolProbabilities(
        entries: Array<{ item?: LootItem; group?: LootGroup; itemIndex?: number }>,
        poolData: PoolData | undefined,
        luck: number,
        excludedItemIds: string[],
        excludeConditionTypes: string[]
    ): ProbabilityResult[] {
        const results: ProbabilityResult[] = [];

        // Filter out excluded entries and those with excluded conditions
        const validEntries = entries.filter((entry) => {
            if (entry.item) {
                if (excludedItemIds.includes(entry.item.id)) return false;
                if (this.hasExcludedCondition(entry.item.conditions, excludeConditionTypes)) return false;
            }
            if (entry.group) {
                if (this.hasExcludedCondition(entry.group.conditions, excludeConditionTypes)) return false;
            }
            return true;
        });

        // Calculate total weight with luck adjustment
        let totalWeight = 0;
        const weights: number[] = [];

        for (const entry of validEntries) {
            let weight = 1;
            let quality = 0;

            if (entry.item) {
                weight = entry.item.weight || 1;
                quality = entry.item.quality || 0;
            }

            const adjustedWeight = Math.floor(weight + quality * luck);
            weights.push(adjustedWeight);
            totalWeight += adjustedWeight;
        }

        if (totalWeight === 0) return results;

        // Calculate probabilities
        for (const [index, entry] of validEntries.entries()) {
            const probability = weights[index] / totalWeight;

            if (entry.item && entry.itemIndex !== undefined) {
                results.push({
                    itemId: entry.item.id,
                    itemIndex: entry.itemIndex,
                    poolIndex: entry.item.poolIndex,
                    probability,
                    name: entry.item.name,
                    entryType: entry.item.entryType
                });
            } else if (entry.group) {
                const groupResults = this.calculateGroupProbabilities(
                    entry.group,
                    probability,
                    luck,
                    excludedItemIds,
                    excludeConditionTypes
                );
                results.push(...groupResults);
            }
        }

        return results;
    }

    private calculateGroupProbabilities(
        group: LootGroup,
        groupProbability: number,
        luck: number,
        excludedItemIds: string[],
        excludeConditionTypes: string[]
    ): ProbabilityResult[] {
        const results: ProbabilityResult[] = [];

        if (group.type === "alternatives") {
            // For alternatives, only one item is chosen
            const validItems = group.items.filter((itemId) => {
                if (excludedItemIds.includes(itemId)) return false;
                const item = this.itemMap.get(itemId);
                const nestedGroup = this.groupMap.get(itemId);

                if (item && this.hasExcludedCondition(item.conditions, excludeConditionTypes)) return false;
                if (nestedGroup && this.hasExcludedCondition(nestedGroup.conditions, excludeConditionTypes)) return false;

                return true;
            });

            let totalWeight = 0;
            const weights: number[] = [];

            for (const itemId of validItems) {
                let weight = 1;
                let quality = 0;

                const item = this.itemMap.get(itemId);
                if (item) {
                    weight = item.weight || 1;
                    quality = item.quality || 0;
                }

                const adjustedWeight = Math.floor(weight + quality * luck);
                weights.push(adjustedWeight);
                totalWeight += adjustedWeight;
            }

            if (totalWeight > 0) {
                for (const [index, itemId] of validItems.entries()) {
                    const itemProbability = (weights[index] / totalWeight) * groupProbability;

                    const item = this.itemMap.get(itemId);
                    const nestedGroup = this.groupMap.get(itemId);

                    if (item) {
                        const itemIndex = this.lootTable.items.findIndex((i) => i.id === itemId);
                        results.push({
                            itemId: item.id,
                            itemIndex,
                            poolIndex: item.poolIndex,
                            probability: itemProbability,
                            name: item.name,
                            entryType: item.entryType
                        });
                    } else if (nestedGroup) {
                        const nestedResults = this.calculateGroupProbabilities(
                            nestedGroup,
                            itemProbability,
                            luck,
                            excludedItemIds,
                            excludeConditionTypes
                        );
                        results.push(...nestedResults);
                    }
                }
            }
        } else if (group.type === "group" || group.type === "sequence") {
            // For group/sequence, all valid items are chosen
            for (const itemId of group.items) {
                if (excludedItemIds.includes(itemId)) continue;

                const item = this.itemMap.get(itemId);
                const nestedGroup = this.groupMap.get(itemId);

                if (item) {
                    if (this.hasExcludedCondition(item.conditions, excludeConditionTypes)) continue;

                    const itemIndex = this.lootTable.items.findIndex((i) => i.id === itemId);
                    results.push({
                        itemId: item.id,
                        itemIndex,
                        poolIndex: item.poolIndex,
                        probability: groupProbability,
                        name: item.name,
                        entryType: item.entryType
                    });
                } else if (nestedGroup) {
                    if (this.hasExcludedCondition(nestedGroup.conditions, excludeConditionTypes)) continue;

                    const nestedResults = this.calculateGroupProbabilities(
                        nestedGroup,
                        groupProbability,
                        luck,
                        excludedItemIds,
                        excludeConditionTypes
                    );
                    results.push(...nestedResults);
                }
            }
        }

        return results;
    }

    private hasExcludedCondition(conditions: any[] | undefined, excludeConditionTypes: string[]): boolean {
        if (!conditions || excludeConditionTypes.length === 0) return false;

        return conditions.some((condition) => {
            if (typeof condition === "object" && condition.condition) {
                return excludeConditionTypes.includes(condition.condition);
            }
            if (typeof condition === "string") {
                return excludeConditionTypes.includes(condition);
            }
            return false;
        });
    }

    public getItemById(itemId: string): LootItem | undefined {
        return this.itemMap.get(itemId);
    }

    public getItemByIndex(index: number): LootItem | undefined {
        return this.lootTable.items[index];
    }

    public getGroupById(groupId: string): LootGroup | undefined {
        return this.groupMap.get(groupId);
    }
}
