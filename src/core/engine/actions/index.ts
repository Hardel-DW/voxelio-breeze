import AlternativeModifier from "@/core/engine/actions/AlternativeModifier";
import AppendListModifier from "@/core/engine/actions/AppendListModifier";
import { ComputedModifier } from "@/core/engine/actions/ComputedModifier";
import { LootTableModifier } from "@/core/engine/actions/LootTableModifiers";
import MultipleModifier from "@/core/engine/actions/MultipleModifier";
import RemoveKeyModifier from "@/core/engine/actions/RemoveKeyModifier";
import RemoveValueFromListModifier from "@/core/engine/actions/RemoveValueFromListModifier";
import SequentialModifier from "@/core/engine/actions/SequentialModifier";
import { SimpleModifier } from "@/core/engine/actions/SimpleModifier";
import { SlotModifier } from "@/core/engine/actions/SlotModifier";
import ToggleListValueModifier from "@/core/engine/actions/ToggleListValueModifier";
import { UndefinedModifier } from "@/core/engine/actions/UndefinedModifier";
import type { Action, ActionValue } from "@/core/engine/actions/types";

export function updateData(
    action: Action,
    element: Record<string, unknown>,
    version: number,
    value?: ActionValue
): Record<string, unknown> | undefined {
    return (() => {
        switch (action.type) {
            case "set_value_from_computed_value":
            case "toggle_value_from_computed_value":
                return ComputedModifier(action, element, value);
            case "set_value":
            case "toggle_value":
                return SimpleModifier(action, element);
            case "set_undefined":
                return UndefinedModifier(action, element);
            case "set_computed_slot":
                return SlotModifier(action, element, version);
            case "toggle_multiple_values":
                return MultipleModifier(action, element);
            case "toggle_value_in_list":
                return ToggleListValueModifier(action, element, value);
            case "remove_key":
                return RemoveKeyModifier(action, element);
            case "remove_value_from_list":
                return RemoveValueFromListModifier(action, element, value);
            case "sequential":
                return SequentialModifier(action, element, version, updateData, value);
            case "list_operation":
                return AppendListModifier(action, element);
            case "alternative":
                return AlternativeModifier(action, element, version, updateData);
            case "add_loot_item":
            case "remove_loot_item":
            case "modify_loot_item":
            case "create_loot_group":
            case "modify_loot_group":
            case "dissolve_loot_group":
            case "move_item_between_pools":
            case "move_group_between_pools":
            case "duplicate_loot_item":
            case "bulk_modify_items":
            case "convert_item_to_group":
            case "convert_group_to_item":
            case "nest_group_in_group":
            case "unnest_group":
            case "balance_weights":
            case "conditional_loot":
                return LootTableModifier(action, element);
        }
    })();
}

/**
 * Split a SequentialAction into multiple actions, handling nested sequential actions recursively
 * @param action - The action to split (can be any Action type)
 * @returns The flattened list of actions
 */
export function SplitSequentialAction(action: Action): Action[] {
    if (action.type === "sequential") {
        return action.actions.flatMap((subAction) => SplitSequentialAction(subAction));
    }
    return [action];
}
