import type { LootTableProps, LootItem, LootGroup } from "@/core/schema/loot/types";
import type { LootTableAction } from "./LootTableActions";

let globalItemCounter = 0;
let globalGroupCounter = 0;

export function LootTableModifier(action: LootTableAction, element: Record<string, unknown>): Record<string, unknown> | undefined {
    const lootTable = element as LootTableProps;
    const clone = structuredClone(lootTable);

    switch (action.type) {
        case "add_loot_item": {
            const newItem: LootItem = {
                id: `item_${globalItemCounter++}`,
                name: action.item.name,
                weight: action.item.weight,
                quality: action.item.quality,
                conditions: action.item.conditions || [],
                functions: action.item.functions || [],
                poolIndex: action.poolIndex,
                entryIndex: 0, // Will be recalculated
                entryType: "minecraft:item" // Default entry type for new items
            };
            clone.items.push(newItem);
            return clone;
        }

        case "remove_loot_item": {
            clone.items = clone.items.filter((item) => item.id !== action.itemId);
            for (const group of clone.groups) {
                group.items = group.items.filter((itemId) => itemId !== action.itemId);
            }
            clone.groups = clone.groups.filter((group) => group.items.length > 0);
            return clone;
        }

        case "modify_loot_item": {
            const item = clone.items.find((item) => item.id === action.itemId);
            if (item) {
                switch (action.property) {
                    case "name":
                        item.name = action.value as string;
                        break;
                    case "weight":
                        item.weight = action.value as number;
                        break;
                    case "quality":
                        item.quality = action.value as number;
                        break;
                }
            }
            return clone;
        }

        case "create_loot_group": {
            const newGroup: LootGroup = {
                id: `group_${globalGroupCounter++}`,
                type: action.groupType,
                items: action.itemIds,
                poolIndex: action.poolIndex,
                entryIndex: action.entryIndex || 0
            };
            clone.groups.push(newGroup);
            return clone;
        }

        case "modify_loot_group": {
            const group = clone.groups.find((g) => g.id === action.groupId);
            if (group) {
                switch (action.operation) {
                    case "add_item":
                        if (!group.items.includes(action.value as string)) {
                            group.items.push(action.value as string);
                        }
                        break;
                    case "remove_item":
                        group.items = group.items.filter((itemId) => itemId !== action.value);
                        break;
                    case "change_type":
                        group.type = action.value as "alternatives" | "group" | "sequence";
                        break;
                }
            }
            return clone;
        }

        case "dissolve_loot_group": {
            // Remove group but keep items
            clone.groups = clone.groups.filter((group) => group.id !== action.groupId);
            // Remove group references from other groups
            for (const group of clone.groups) {
                group.items = group.items.filter((itemId) => itemId !== action.groupId);
            }
            return clone;
        }

        case "move_item_between_pools": {
            const item = clone.items.find((item) => item.id === action.itemId);
            if (item) {
                item.poolIndex = action.targetPoolIndex;
            }
            return clone;
        }

        case "move_group_between_pools": {
            const group = clone.groups.find((group) => group.id === action.groupId);
            if (group) {
                group.poolIndex = action.targetPoolIndex;
            }
            return clone;
        }

        case "duplicate_loot_item": {
            const originalItem = clone.items.find((item) => item.id === action.itemId);
            if (originalItem) {
                const duplicatedItem: LootItem = {
                    ...originalItem,
                    id: `item_${globalItemCounter++}`,
                    poolIndex: action.targetPoolIndex ?? originalItem.poolIndex
                };
                clone.items.push(duplicatedItem);
            }
            return clone;
        }

        case "bulk_modify_items": {
            for (const itemId of action.itemIds) {
                const item = clone.items.find((item) => item.id === itemId);
                if (item) {
                    const currentValue = (action.property === "weight" ? item.weight : item.quality) || 0;
                    let newValue: number;

                    switch (action.operation) {
                        case "multiply":
                            newValue = currentValue * action.value;
                            break;
                        case "add":
                            newValue = currentValue + action.value;
                            break;
                        case "set":
                            newValue = action.value;
                            break;
                        default:
                            newValue = currentValue;
                    }

                    if (action.property === "weight") {
                        item.weight = newValue;
                    } else {
                        item.quality = newValue;
                    }
                }
            }
            return clone;
        }

        case "convert_item_to_group": {
            const item = clone.items.find((item) => item.id === action.itemId);
            if (item) {
                const newGroup: LootGroup = {
                    id: `group_${globalGroupCounter++}`,
                    type: action.groupType,
                    items: [action.itemId, ...(action.additionalItems || [])],
                    poolIndex: item.poolIndex,
                    entryIndex: item.entryIndex
                };
                clone.groups.push(newGroup);
            }
            return clone;
        }

        case "convert_group_to_item": {
            const group = clone.groups.find((group) => group.id === action.groupId);
            if (group && group.items.length > 0) {
                if (action.keepFirstItem) {
                    // Keep only the first item, remove the group
                    clone.groups = clone.groups.filter((g) => g.id !== action.groupId);
                    // Remove group references
                    for (const g of clone.groups) {
                        g.items = g.items.filter((itemId) => itemId !== action.groupId);
                    }
                } else {
                    // Remove all items in the group
                    for (const itemId of group.items) {
                        clone.items = clone.items.filter((item) => item.id !== itemId);
                    }
                    clone.groups = clone.groups.filter((g) => g.id !== action.groupId);
                }
            }
            return clone;
        }

        case "nest_group_in_group": {
            const parentGroup = clone.groups.find((group) => group.id === action.parentGroupId);
            if (parentGroup) {
                const position = action.position ?? parentGroup.items.length;
                parentGroup.items.splice(position, 0, action.childGroupId);
            }
            return clone;
        }

        case "unnest_group": {
            // Remove group from all parent groups but keep the group itself
            for (const group of clone.groups) {
                group.items = group.items.filter((itemId) => itemId !== action.groupId);
            }
            return clone;
        }

        case "balance_weights": {
            const poolItems = clone.items.filter((item) => item.poolIndex === action.poolIndex);
            const targetTotal = action.targetTotal || 100;
            const itemCount = poolItems.length;

            if (itemCount > 0) {
                const weightPerItem = Math.floor(targetTotal / itemCount);
                for (const item of poolItems) {
                    item.weight = weightPerItem;
                }
            }
            return clone;
        }

        case "conditional_loot": {
            let conditionMet = false;

            switch (action.condition.type) {
                case "pool_empty":
                    if (action.condition.poolIndex !== undefined) {
                        const poolItems = clone.items.filter((item) => item.poolIndex === action.condition.poolIndex);
                        conditionMet = poolItems.length === 0;
                    }
                    break;
                case "item_count":
                    conditionMet = clone.items.length >= (action.condition.count || 0);
                    break;
                case "group_exists":
                    conditionMet = clone.groups.some((group) => group.id === action.condition.groupId);
                    break;
            }

            const actionToExecute = conditionMet ? action.thenAction : action.elseAction;
            if (actionToExecute) {
                return LootTableModifier(actionToExecute, clone);
            }
            return clone;
        }

        default:
            return undefined;
    }
}

// Keep the old function for backward compatibility if needed
export function updateLootTable(action: LootTableAction, element: LootTableProps): LootTableProps | undefined {
    const result = LootTableModifier(action, element);
    return result as LootTableProps | undefined;
}
