import { createHandlers, type AllExpectedHandlerKeys, type ValidateHandlerRegistry } from "../../types";

// Recipe domain action types
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

// Export typed actions for this domain
export type RecipeAction = {
    [K in keyof RecipeActions]: RecipeActions[K] & { type: `recipe.${K}` };
}[keyof RecipeActions];

// Use generic validation system
export type RecipeHandlerKeys = AllExpectedHandlerKeys<"recipe", RecipeActions>;
export const createRecipeHandlers = <T extends Record<RecipeHandlerKeys, any>>(
    handlers: ValidateHandlerRegistry<T, RecipeHandlerKeys>
): T => createHandlers(handlers);
