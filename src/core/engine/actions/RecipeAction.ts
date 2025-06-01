import type { RecipeProps } from "@/core/schema/recipe/types";
import type { Action, BaseAction } from "@/core/engine/actions/types";

// Recipe-specific action types
export interface AddIngredientAction extends BaseAction {
    type: "add_ingredient";
    slot: string; // Target slot ("0", "1", etc.)
    items: string[]; // Items to add (["minecraft:diamond"] or ["#minecraft:logs"])
    replace?: boolean; // If true, replace existing items in slot
}

export interface RemoveIngredientAction extends BaseAction {
    type: "remove_ingredient";
    slot: string; // Slot to remove ingredient from
    items?: string[]; // Specific items to remove (if not provided, clear entire slot)
}

export interface ConvertRecipeTypeAction extends BaseAction {
    type: "convert_recipe_type";
    newType: string; // New recipe type ("minecraft:crafting_shapeless", etc.)
    preserveIngredients?: boolean; // Try to preserve ingredients when possible
}

export interface SwapSlotsAction extends BaseAction {
    type: "swap_slots";
    fromSlot: string;
    toSlot: string;
}

export interface ClearSlotAction extends BaseAction {
    type: "clear_slot";
    slot: string;
}

export type RecipeAction = AddIngredientAction | RemoveIngredientAction | ConvertRecipeTypeAction | SwapSlotsAction | ClearSlotAction;

/**
 * Apply recipe-specific actions to a RecipeProps element
 */
export function RecipeModifier(action: RecipeAction, element: Record<string, unknown>): Record<string, unknown> | undefined {
    const recipe = element as RecipeProps;

    switch (action.type) {
        case "add_ingredient": {
            return addIngredient(recipe, action);
        }
        case "remove_ingredient": {
            return removeIngredient(recipe, action);
        }
        case "convert_recipe_type": {
            return convertRecipeType(recipe, action);
        }
        case "swap_slots": {
            return swapSlots(recipe, action);
        }
        case "clear_slot": {
            return clearSlot(recipe, action);
        }
        default:
            return recipe;
    }
}

function addIngredient(recipe: RecipeProps, action: AddIngredientAction): RecipeProps {
    const newRecipe = { ...recipe };
    const newSlots = { ...newRecipe.slots };

    if (action.replace || !newSlots[action.slot]) {
        newSlots[action.slot] = [...action.items];
    } else {
        // Merge items, avoiding duplicates
        const existingItems = new Set(newSlots[action.slot]);
        const newItems = action.items.filter((item) => !existingItems.has(item));
        newSlots[action.slot] = [...newSlots[action.slot], ...newItems];
    }

    newRecipe.slots = newSlots;
    return newRecipe;
}

function removeIngredient(recipe: RecipeProps, action: RemoveIngredientAction): RecipeProps {
    const newRecipe = { ...recipe };
    const newSlots = { ...newRecipe.slots };

    if (!newSlots[action.slot]) {
        return newRecipe; // Slot doesn't exist
    }

    if (!action.items) {
        // Remove entire slot
        delete newSlots[action.slot];
    } else {
        // Remove specific items
        const itemsToRemove = new Set(action.items);
        newSlots[action.slot] = newSlots[action.slot].filter((item) => !itemsToRemove.has(item));

        // Remove slot if empty
        if (newSlots[action.slot].length === 0) {
            delete newSlots[action.slot];
        }
    }

    newRecipe.slots = newSlots;
    return newRecipe;
}

function convertRecipeType(recipe: RecipeProps, action: ConvertRecipeTypeAction): RecipeProps {
    const newRecipe = { ...recipe };
    newRecipe.type = action.newType as any;

    // Handle type-specific conversions
    if (action.preserveIngredients !== false) {
        switch (action.newType) {
            case "minecraft:crafting_shapeless":
                // Remove grid constraints for shapeless
                newRecipe.gridSize = undefined;
                break;

            case "minecraft:crafting_shaped":
                // Add default grid size if not present
                if (!newRecipe.gridSize) {
                    newRecipe.gridSize = { width: 3, height: 3 };
                }
                break;

            case "minecraft:smelting":
            case "minecraft:blasting":
            case "minecraft:smoking":
            case "minecraft:campfire_cooking": {
                // Convert to single ingredient in slot 0
                const allItems = getAllItemsFromSlots(newRecipe.slots);
                newRecipe.slots = allItems.length > 0 ? { "0": [allItems[0]] } : {};
                newRecipe.gridSize = undefined;
                break;
            }

            case "minecraft:stonecutting": {
                // Single ingredient, no cooking time
                const stoneItems = getAllItemsFromSlots(newRecipe.slots);
                newRecipe.slots = stoneItems.length > 0 ? { "0": [stoneItems[0]] } : {};
                newRecipe.gridSize = undefined;
                newRecipe.typeSpecific = undefined;
                break;
            }
        }
    }

    return newRecipe;
}

function swapSlots(recipe: RecipeProps, action: SwapSlotsAction): RecipeProps {
    const newRecipe = { ...recipe };
    const newSlots = { ...newRecipe.slots };

    const fromItems = newSlots[action.fromSlot] || [];
    const toItems = newSlots[action.toSlot] || [];

    // Clear both slots first
    delete newSlots[action.fromSlot];
    delete newSlots[action.toSlot];

    // Set new values if not empty
    if (toItems.length > 0) {
        newSlots[action.fromSlot] = [...toItems];
    }
    if (fromItems.length > 0) {
        newSlots[action.toSlot] = [...fromItems];
    }

    newRecipe.slots = newSlots;
    return newRecipe;
}

function clearSlot(recipe: RecipeProps, action: ClearSlotAction): RecipeProps {
    const newRecipe = { ...recipe };
    const newSlots = { ...newRecipe.slots };

    delete newSlots[action.slot];
    newRecipe.slots = newSlots;
    return newRecipe;
}

// Helper function to get all items from all slots
function getAllItemsFromSlots(slots: Record<string, string[]>): string[] {
    return Object.values(slots).flat();
}
