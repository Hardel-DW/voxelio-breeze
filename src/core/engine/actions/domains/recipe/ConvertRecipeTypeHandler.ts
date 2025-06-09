import type { RecipeProps } from "@/core/schema/recipe/types";
import type { ActionHandler } from "../../types";
import type { RecipeAction } from "./types";

export class ConvertRecipeTypeHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.convert_recipe_type" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = element as RecipeProps;
        const newRecipe = { ...recipe };

        const { newType, preserveIngredients } = action;
        newRecipe.type = newType as any;

        // Handle type-specific conversions
        if (preserveIngredients !== false) {
            switch (newType) {
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
                    const allItems = this.getAllItemsFromSlots(newRecipe.slots);
                    newRecipe.slots = allItems.length > 0 ? { "0": [allItems[0]] } : {};
                    newRecipe.gridSize = undefined;
                    break;
                }

                case "minecraft:stonecutting": {
                    // Single ingredient, no cooking time
                    const stoneItems = this.getAllItemsFromSlots(newRecipe.slots);
                    newRecipe.slots = stoneItems.length > 0 ? { "0": [stoneItems[0]] } : {};
                    newRecipe.gridSize = undefined;
                    newRecipe.typeSpecific = undefined;
                    break;
                }
            }
        }

        return newRecipe;
    }

    private getAllItemsFromSlots(slots: Record<string, string[]>): string[] {
        return Object.values(slots).flat();
    }
}
