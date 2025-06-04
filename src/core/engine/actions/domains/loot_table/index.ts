import type { ActionHandler } from "../../types";
import type { LootTableAction } from "./types";
import {
    AddLootItemHandler,
    RemoveLootItemHandler,
    ModifyLootItemHandler,
    DuplicateLootItemHandler,
    BulkModifyItemsHandler
} from "./ItemHandlers";
import {
    CreateLootGroupHandler,
    ModifyLootGroupHandler,
    DissolveLootGroupHandler,
    ConvertItemToGroupHandler,
    ConvertGroupToItemHandler,
    NestGroupInGroupHandler,
    UnnestGroupHandler
} from "./GroupHandlers";
import {
    MoveItemBetweenPoolsHandler,
    MoveGroupBetweenPoolsHandler,
    BalanceWeightsHandler,
    ConditionalLootHandler
} from "./MovementHandlers";

export default function register(): Map<string, ActionHandler<LootTableAction>> {
    const handlers = new Map<string, ActionHandler<LootTableAction>>();

    // Item handlers
    handlers.set("loot_table.add_loot_item", new AddLootItemHandler());
    handlers.set("loot_table.remove_loot_item", new RemoveLootItemHandler());
    handlers.set("loot_table.modify_loot_item", new ModifyLootItemHandler());
    handlers.set("loot_table.duplicate_loot_item", new DuplicateLootItemHandler());
    handlers.set("loot_table.bulk_modify_items", new BulkModifyItemsHandler());

    // Group handlers
    handlers.set("loot_table.create_loot_group", new CreateLootGroupHandler());
    handlers.set("loot_table.modify_loot_group", new ModifyLootGroupHandler());
    handlers.set("loot_table.dissolve_loot_group", new DissolveLootGroupHandler());
    handlers.set("loot_table.convert_item_to_group", new ConvertItemToGroupHandler());
    handlers.set("loot_table.convert_group_to_item", new ConvertGroupToItemHandler());
    handlers.set("loot_table.nest_group_in_group", new NestGroupInGroupHandler());
    handlers.set("loot_table.unnest_group", new UnnestGroupHandler());

    // Movement handlers
    handlers.set("loot_table.move_item_between_pools", new MoveItemBetweenPoolsHandler());
    handlers.set("loot_table.move_group_between_pools", new MoveGroupBetweenPoolsHandler());
    handlers.set("loot_table.balance_weights", new BalanceWeightsHandler());
    handlers.set("loot_table.conditional_loot", new ConditionalLootHandler());

    return handlers;
}
