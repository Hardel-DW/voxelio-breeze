import type { RecipeProps } from "@/core/schema/recipe/types";
import type { ActionHandler } from "../../types";
import type { RecipeAction } from "./types";

export class AddIngredientHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.add_ingredient" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = element as RecipeProps;

        // Ne fonctionne pas sur les recettes shapeless
        if (recipe.type === "minecraft:crafting_shapeless") {
            return recipe;
        }

        const newRecipe = { ...recipe };
        const newSlots = { ...newRecipe.slots };

        const { slot, items, replace } = action;

        if (replace || !newSlots[slot]) {
            newSlots[slot] = [...items];
        } else {
            const existingSlot = newSlots[slot];
            const existingItems = Array.isArray(existingSlot) ? existingSlot : [existingSlot];
            const existingSet = new Set(existingItems);
            const newItems = items.filter((item) => !existingSet.has(item));
            newSlots[slot] = [...existingItems, ...newItems];
        }

        newRecipe.slots = newSlots;
        return newRecipe;
    }
}

export class AddShapelessIngredientHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.add_shapeless_ingredient" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = element as RecipeProps;

        // Fonctionne uniquement sur les recettes shapeless
        if (recipe.type !== "minecraft:crafting_shapeless") {
            return recipe;
        }

        const newRecipe = { ...recipe };
        const newSlots = { ...newRecipe.slots };

        const { items } = action;

        // Trouve le prochain slot libre
        let nextSlot = 0;
        while (newSlots[nextSlot.toString()]) {
            nextSlot++;
        }

        // Ajoute l'ingrédient dans le format approprié
        newSlots[nextSlot.toString()] = items;

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
            const existingSlot = newSlots[slot];
            const existingItems = Array.isArray(existingSlot) ? existingSlot : [existingSlot];
            const itemsToRemove = new Set(items);
            const filteredItems = existingItems.filter((item) => !itemsToRemove.has(item));

            if (filteredItems.length === 0) {
                delete newSlots[slot];
            } else {
                newSlots[slot] = filteredItems;
            }
        }

        newRecipe.slots = newSlots;
        return newRecipe;
    }
}

export class RemoveItemEverywhereHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.remove_item_everywhere" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = element as RecipeProps;
        const newRecipe = { ...recipe };
        const newSlots = { ...newRecipe.slots };

        const { items } = action;
        const itemsToRemove = new Set(items);

        for (const [slotKey, slotContent] of Object.entries(newSlots)) {
            if (typeof slotContent === "string") {
                // Tag slot - check if it should be removed
                if (itemsToRemove.has(slotContent)) {
                    delete newSlots[slotKey];
                }
            } else if (Array.isArray(slotContent)) {
                // Items array slot - filter out matching items
                const filteredItems = slotContent.filter(item => !itemsToRemove.has(item));

                if (filteredItems.length === 0) {
                    delete newSlots[slotKey];
                } else {
                    newSlots[slotKey] = filteredItems;
                }
            }
        }

        newRecipe.slots = newSlots;
        return newRecipe;
    }
}

export class ReplaceItemEverywhereHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.replace_item_everywhere" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = element as RecipeProps;
        const newRecipe = { ...recipe };
        const newSlots = { ...newRecipe.slots };

        const { from, to } = action;

        for (const [slotKey, slotContent] of Object.entries(newSlots)) {
            if (typeof slotContent === "string") {
                // Tag slot - replace if it matches
                if (slotContent === from) {
                    newSlots[slotKey] = to;
                }
            } else if (Array.isArray(slotContent)) {
                // Items array slot - replace matching items
                const replacedItems = slotContent.map(item => item === from ? to : item);

                // Remove duplicates while preserving order
                const uniqueItems: string[] = [];
                const seen = new Set<string>();
                for (const item of replacedItems) {
                    if (!seen.has(item)) {
                        uniqueItems.push(item);
                        seen.add(item);
                    }
                }

                newSlots[slotKey] = uniqueItems;
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


