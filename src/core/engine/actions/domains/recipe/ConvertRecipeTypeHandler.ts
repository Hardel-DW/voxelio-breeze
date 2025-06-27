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

        if (preserveIngredients !== false) {
            switch (newType) {
                case "minecraft:crafting_shapeless":
                    newRecipe.gridSize = undefined;
                    break;

                case "minecraft:crafting_shaped":
                    if (!newRecipe.gridSize) {
                        newRecipe.gridSize = { width: 3, height: 3 };
                    }
                    break;

                case "minecraft:smelting":
                case "minecraft:blasting":
                case "minecraft:smoking":
                case "minecraft:campfire_cooking": {
                    const firstSlotWithContent = this.getFirstSlotWithContent(newRecipe.slots);
                    newRecipe.slots = firstSlotWithContent ? { "0": firstSlotWithContent } : {};
                    newRecipe.gridSize = undefined;
                    break;
                }

                case "minecraft:stonecutting": {
                    const firstSlotWithContent = this.getFirstSlotWithContent(newRecipe.slots);
                    newRecipe.slots = firstSlotWithContent ? { "0": firstSlotWithContent } : {};
                    newRecipe.gridSize = undefined;
                    newRecipe.typeSpecific = undefined;
                    break;
                }
            }
        }

        return newRecipe;
    }

    private getFirstSlotWithContent(slots: Record<string, string[] | string>): string[] | string | null {
        for (const slotContent of Object.values(slots)) {
            if (slotContent && (typeof slotContent === "string" || slotContent.length > 0)) {
                // For cooking recipe types, we only want the first item
                if (Array.isArray(slotContent) && slotContent.length > 1) {
                    return [slotContent[0]]; // Return only the first item as an array
                }
                return slotContent;
            }
        }
        return null;
    }
}
