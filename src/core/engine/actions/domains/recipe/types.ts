import { type AllExpectedHandlerKeys, type ValidateHandlerRegistry, createHandlers } from "../../types";

export interface RecipeActions {
    add_ingredient: {
        slot: string;
        items: string[];
        replace?: boolean;
    };
    remove_ingredient: {
        slot: string;
        items?: string[];
    };
    convert_recipe_type: {
        newType: string;
        preserveIngredients?: boolean;
    };
    swap_slots: {
        fromSlot: string;
        toSlot: string;
    };
    clear_slot: {
        slot: string;
    };
}

export type RecipeAction = {
    [K in keyof RecipeActions]: RecipeActions[K] & { type: `recipe.${K}` };
}[keyof RecipeActions];

export type RecipeHandlerKeys = AllExpectedHandlerKeys<"recipe", RecipeActions>;
export const createRecipeHandlers = <T extends Record<RecipeHandlerKeys, any>>(
    handlers: ValidateHandlerRegistry<T, RecipeHandlerKeys>
): T => createHandlers(handlers);
