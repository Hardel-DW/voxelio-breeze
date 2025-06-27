import type { RecipeProps } from "@/core/schema/recipe/types";
import type { ActionHandler } from "../../types";
import type { RecipeAction } from "./types";

export class AddIngredientHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.add_ingredient" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = structuredClone(element) as RecipeProps;

        if (recipe.type === "minecraft:crafting_shapeless") {
            return recipe;
        }

        const { slot, items, replace } = action;

        if (replace || !recipe.slots[slot]) {
            recipe.slots[slot] = [...items];
        } else {
            const existingSlot = recipe.slots[slot];
            const existingItems = Array.isArray(existingSlot) ? existingSlot : [existingSlot];
            const existingSet = new Set(existingItems);
            const newItems = items.filter((item) => !existingSet.has(item));
            recipe.slots[slot] = [...existingItems, ...newItems];
        }

        return recipe;
    }
}

export class AddShapelessIngredientHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.add_shapeless_ingredient" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = structuredClone(element) as RecipeProps;

        if (recipe.type !== "minecraft:crafting_shapeless") {
            return recipe;
        }

        const { items } = action;

        let nextSlot = 0;
        while (recipe.slots[nextSlot.toString()]) {
            nextSlot++;
        }

        recipe.slots[nextSlot.toString()] = items;

        return recipe;
    }
}

export class RemoveIngredientHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.remove_ingredient" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = structuredClone(element) as RecipeProps;

        const { slot, items } = action;

        if (!recipe.slots[slot]) {
            return recipe;
        }

        if (!items) {
            delete recipe.slots[slot];
        } else {
            const existingSlot = recipe.slots[slot];
            const existingItems = Array.isArray(existingSlot) ? existingSlot : [existingSlot];
            const itemsToRemove = new Set(items);
            const filteredItems = existingItems.filter((item) => !itemsToRemove.has(item));

            if (filteredItems.length === 0) delete recipe.slots[slot];
            else recipe.slots[slot] = filteredItems;
        }

        return recipe;
    }
}

export class RemoveItemEverywhereHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.remove_item_everywhere" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = structuredClone(element) as RecipeProps;

        const { items } = action;
        const itemsToRemove = new Set(items);

        for (const [slotKey, slotContent] of Object.entries(recipe.slots)) {
            if (typeof slotContent === "string" && itemsToRemove.has(slotContent)) {
                delete recipe.slots[slotKey];
            } else if (Array.isArray(slotContent)) {
                const filteredItems = slotContent.filter(item => !itemsToRemove.has(item));
                if (filteredItems.length === 0) delete recipe.slots[slotKey];
                else recipe.slots[slotKey] = filteredItems;
            }
        }

        return recipe;
    }
}

export class ReplaceItemEverywhereHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.replace_item_everywhere" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = structuredClone(element) as RecipeProps;
        const { from, to } = action;

        for (const [slotKey, slotContent] of Object.entries(recipe.slots)) {
            if (typeof slotContent === "string" && slotContent === from) recipe.slots[slotKey] = to;
            else if (Array.isArray(slotContent)) {
                const replacedItems = slotContent.map(item => item === from ? to : item);
                const uniqueItems: string[] = [];
                const seen = new Set<string>();
                for (const item of replacedItems) {
                    if (!seen.has(item)) {
                        uniqueItems.push(item);
                        seen.add(item);
                    }
                }

                recipe.slots[slotKey] = uniqueItems;
            }
        }

        return recipe;
    }
}

export class ClearSlotHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.clear_slot" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = structuredClone(element) as RecipeProps;
        delete recipe.slots[action.slot];
        return recipe;
    }
}


