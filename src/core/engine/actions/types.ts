import type { IdentifierObject } from "@/core/Identifier";
import type { LootTableAction } from "./LootTableActions";

export type ActionValue = string | number | boolean | IdentifierObject | GetValueField;
type GetValueField = {
    type: "get_value_from_field";
    field: string;
};

export interface BaseAction {
    field: string;
}

export interface RemoveKeyAction extends BaseAction {
    type: "remove_key";
    value: ActionValue;
}

export interface UndefinedAction extends BaseAction {
    type: "set_undefined";
}

export interface SimpleAction extends BaseAction {
    type: "set_value" | "toggle_value";
    value: ActionValue;
}

export interface SlotAction extends BaseAction {
    type: "set_computed_slot";
    value: ActionValue;
}

export interface ToggleListValueAction extends BaseAction {
    type: "toggle_value_in_list";
    mode?: ("remove_if_empty" | "override")[];
    value?: ActionValue;
}

export interface MultipleAction extends BaseAction {
    type: "toggle_multiple_values";
    value: ValidType[];
}

export interface SequentialAction {
    type: "sequential";
    actions: Action[];
}

export interface ListAction extends BaseAction {
    type: "list_operation";
    mode: "prepend" | "append";
    flag?: "not_duplicate"[];
    value: ActionValue;
}

export interface ComputedAction extends BaseAction {
    type: "set_value_from_computed_value" | "toggle_value_from_computed_value";
}

export interface RemoveValueFromListAction extends BaseAction {
    type: "remove_value_from_list";
    mode?: ("remove_if_empty" | "if_type_string")[];
    value?: ActionValue;
}

export interface AlternativeAction extends BaseAction {
    type: "alternative";
    cases: {
        when: ActionValue;
        do: Action;
    }[];
}

export type ValidType = string | number | IdentifierObject;

export type Action =
    | RemoveKeyAction
    | UndefinedAction
    | SimpleAction
    | SlotAction
    | ToggleListValueAction
    | MultipleAction
    | SequentialAction
    | ListAction
    | ComputedAction
    | RemoveValueFromListAction
    | AlternativeAction
    | LootTableAction;

export type UpdateDataFunction = (
    action: Action,
    element: Record<string, unknown>,
    version: number,
    value?: ActionValue
) => Record<string, unknown> | undefined;
