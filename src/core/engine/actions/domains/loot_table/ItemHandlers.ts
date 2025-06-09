import type { LootItem, LootTableProps } from "@/core/schema/loot/types";
import type { ActionHandler } from "../../types";
import type { LootTableAction } from "./types";

let globalItemCounter = 0;

export class AddLootItemHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.add_loot_item" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

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
}

export class RemoveLootItemHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.remove_loot_item" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

        clone.items = clone.items.filter((item) => item.id !== action.itemId);
        for (const group of clone.groups) {
            group.items = group.items.filter((itemId) => itemId !== action.itemId);
        }
        clone.groups = clone.groups.filter((group) => group.items.length > 0);
        return clone;
    }
}

export class ModifyLootItemHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.modify_loot_item" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

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
}

export class DuplicateLootItemHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.duplicate_loot_item" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

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
}

export class BulkModifyItemsHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.bulk_modify_items" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

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
}
