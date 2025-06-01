import type { ActionValue, BaseAction } from "./types";

// Actions spécifiques aux LootTables
export interface AddLootItemAction extends BaseAction {
    type: "add_loot_item";
    poolIndex: number;
    item: {
        name: string;
        weight?: number;
        quality?: number;
        conditions?: string[];
        functions?: string[];
    };
}

export interface RemoveLootItemAction extends BaseAction {
    type: "remove_loot_item";
    itemId: string;
}

export interface ModifyLootItemAction extends BaseAction {
    type: "modify_loot_item";
    itemId: string;
    property: "name" | "weight" | "quality";
    value: ActionValue;
}

export interface CreateLootGroupAction extends BaseAction {
    type: "create_loot_group";
    groupType: "alternatives" | "group" | "sequence";
    itemIds: string[];
    poolIndex: number;
    entryIndex?: number;
}

export interface ModifyLootGroupAction extends BaseAction {
    type: "modify_loot_group";
    groupId: string;
    operation: "add_item" | "remove_item" | "change_type";
    value: string | "alternatives" | "group" | "sequence";
}

export interface DissolveLootGroupAction extends BaseAction {
    type: "dissolve_loot_group";
    groupId: string;
}

export interface AddPoolAction extends BaseAction {
    type: "add_pool";
    rolls?: { min: number; max: number };
    bonus_rolls?: number;
}

export interface RemovePoolAction extends BaseAction {
    type: "remove_pool";
    poolIndex: number;
}

export interface MoveItemBetweenPoolsAction extends BaseAction {
    type: "move_item_between_pools";
    itemId: string;
    targetPoolIndex: number;
}

export interface MoveGroupBetweenPoolsAction extends BaseAction {
    type: "move_group_between_pools";
    groupId: string;
    targetPoolIndex: number;
}

export interface ReorderItemsInPoolAction extends BaseAction {
    type: "reorder_items_in_pool";
    poolIndex: number;
    itemOrder: string[]; // Array of item/group IDs in desired order
}

export interface DuplicateLootItemAction extends BaseAction {
    type: "duplicate_loot_item";
    itemId: string;
    targetPoolIndex?: number;
}

export interface BulkModifyItemsAction extends BaseAction {
    type: "bulk_modify_items";
    itemIds: string[];
    property: "weight" | "quality";
    operation: "multiply" | "add" | "set";
    value: number;
}

export interface ConvertItemToGroupAction extends BaseAction {
    type: "convert_item_to_group";
    itemId: string;
    groupType: "alternatives" | "group" | "sequence";
    additionalItems?: string[];
}

export interface ConvertGroupToItemAction extends BaseAction {
    type: "convert_group_to_item";
    groupId: string;
    keepFirstItem?: boolean;
}

export interface NestGroupInGroupAction extends BaseAction {
    type: "nest_group_in_group";
    childGroupId: string;
    parentGroupId: string;
    position?: number;
}

export interface UnnestGroupAction extends BaseAction {
    type: "unnest_group";
    groupId: string;
}

export interface BalanceWeightsAction extends BaseAction {
    type: "balance_weights";
    poolIndex: number;
    targetTotal?: number;
}

export interface ConditionalLootAction extends BaseAction {
    type: "conditional_loot";
    condition: {
        type: "pool_empty" | "item_count" | "group_exists";
        poolIndex?: number;
        itemId?: string;
        groupId?: string;
        count?: number;
    };
    thenAction: LootTableAction;
    elseAction?: LootTableAction;
}

export type LootTableAction =
    | AddLootItemAction
    | RemoveLootItemAction
    | ModifyLootItemAction
    | CreateLootGroupAction
    | ModifyLootGroupAction
    | DissolveLootGroupAction
    | AddPoolAction
    | RemovePoolAction
    | MoveItemBetweenPoolsAction
    | MoveGroupBetweenPoolsAction
    | ReorderItemsInPoolAction
    | DuplicateLootItemAction
    | BulkModifyItemsAction
    | ConvertItemToGroupAction
    | ConvertGroupToItemAction
    | NestGroupInGroupAction
    | UnnestGroupAction
    | BalanceWeightsAction
    | ConditionalLootAction;
