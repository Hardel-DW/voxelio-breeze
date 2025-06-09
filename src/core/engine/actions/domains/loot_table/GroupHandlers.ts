import type { LootGroup, LootTableProps } from "@/core/schema/loot/types";
import type { ActionHandler } from "../../types";
import type { LootTableAction } from "./types";

let globalGroupCounter = 0;

export class CreateLootGroupHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.create_loot_group" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

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
}

export class ModifyLootGroupHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.modify_loot_group" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

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
}

export class DissolveLootGroupHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.dissolve_loot_group" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

        // Remove group but keep items
        clone.groups = clone.groups.filter((group) => group.id !== action.groupId);
        // Remove group references from other groups
        for (const group of clone.groups) {
            group.items = group.items.filter((itemId) => itemId !== action.groupId);
        }
        return clone;
    }
}

export class ConvertItemToGroupHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.convert_item_to_group" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

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
}

export class ConvertGroupToItemHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.convert_group_to_item" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

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
}

export class NestGroupInGroupHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.nest_group_in_group" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

        const parentGroup = clone.groups.find((group) => group.id === action.parentGroupId);
        if (parentGroup) {
            const position = action.position ?? parentGroup.items.length;
            parentGroup.items.splice(position, 0, action.childGroupId);
        }
        return clone;
    }
}

export class UnnestGroupHandler implements ActionHandler<LootTableAction> {
    execute(
        action: Extract<LootTableAction, { type: "loot_table.unnest_group" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const lootTable = element as LootTableProps;
        const clone = structuredClone(lootTable);

        for (const group of clone.groups) {
            group.items = group.items.filter((itemId) => itemId !== action.groupId);
        }
        return clone;
    }
}
