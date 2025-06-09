import type { RecipeProps } from "@/core/schema/recipe/types";
import type { ActionHandler } from "../../types";
import type { RecipeAction } from "./types";

export class AddIngredientHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.add_ingredient" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = element as RecipeProps;
        const newRecipe = { ...recipe };
        const newSlots = { ...newRecipe.slots };

        const { slot, items, replace } = action;

        if (replace || !newSlots[slot]) {
            newSlots[slot] = [...items];
        } else {
            const existingItems = new Set(newSlots[slot]);
            const newItems = items.filter((item) => !existingItems.has(item));
            newSlots[slot] = [...newSlots[slot], ...newItems];
        }

        newRecipe.slots = newSlots;
        return newRecipe;
    }
}

export class RemoveIngredientHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.remove_ingredient" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = element as RecipeProps;
        const newRecipe = { ...recipe };
        const newSlots = { ...newRecipe.slots };

        const { slot, items } = action;

        if (!newSlots[slot]) {
            return newRecipe;
        }

        if (!items) {
            delete newSlots[slot];
        } else {
            const itemsToRemove = new Set(items);
            newSlots[slot] = newSlots[slot].filter((item) => !itemsToRemove.has(item));

            if (newSlots[slot].length === 0) {
                delete newSlots[slot];
            }
        }

        newRecipe.slots = newSlots;
        return newRecipe;
    }
}

export class ClearSlotHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.clear_slot" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = element as RecipeProps;
        const newRecipe = { ...recipe };
        const newSlots = { ...newRecipe.slots };

        delete newSlots[action.slot];
        newRecipe.slots = newSlots;
        return newRecipe;
    }
}

export class SwapSlotsHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.swap_slots" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = element as RecipeProps;
        const newRecipe = { ...recipe };
        const newSlots = { ...newRecipe.slots };

        const { fromSlot, toSlot } = action;

        const fromItems = newSlots[fromSlot] || [];
        const toItems = newSlots[toSlot] || [];

        delete newSlots[fromSlot];
        delete newSlots[toSlot];

        if (toItems.length > 0) {
            newSlots[fromSlot] = [...toItems];
        }
        if (fromItems.length > 0) {
            newSlots[toSlot] = [...fromItems];
        }

        newRecipe.slots = newSlots;
        return newRecipe;
    }
}
