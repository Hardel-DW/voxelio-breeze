import type { ActionHandler } from "../../types";
import type { RecipeAction } from "./types";
import type { RecipeProps } from "@/core/schema/recipe/types";

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
            // Merge items, avoiding duplicates
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
            return newRecipe; // Slot doesn't exist
        }

        if (!items) {
            // Remove entire slot
            delete newSlots[slot];
        } else {
            // Remove specific items
            const itemsToRemove = new Set(items);
            newSlots[slot] = newSlots[slot].filter((item) => !itemsToRemove.has(item));

            // Remove slot if empty
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

        // Clear both slots first
        delete newSlots[fromSlot];
        delete newSlots[toSlot];

        // Set new values if not empty
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
