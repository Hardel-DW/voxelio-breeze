import type { RecipeProps } from "@/core/schema/recipe/types";
import type { ActionHandler } from "../../types";
import type { RecipeAction } from "./types";

export class ConvertRecipeTypeHandler implements ActionHandler<RecipeAction> {
    execute(
        action: Extract<RecipeAction, { type: "recipe.convert_recipe_type" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const recipe = structuredClone(element) as RecipeProps;

        const { newType, preserveIngredients } = action;
        recipe.type = newType as any;

        if (preserveIngredients !== false) {
            switch (newType) {
                case "minecraft:crafting_shapeless":
                    recipe.gridSize = undefined;
                    break;

                case "minecraft:crafting_shaped":
                    if (!recipe.gridSize) {
                        recipe.gridSize = { width: 3, height: 3 };
                    }
                    break;

                case "minecraft:smelting":
                case "minecraft:blasting":
                case "minecraft:smoking":
                case "minecraft:campfire_cooking": {
                    const firstSlotWithContent = this.getFirstSlotWithContent(recipe.slots);
                    recipe.slots = firstSlotWithContent ? { "0": firstSlotWithContent } : {};
                    recipe.gridSize = undefined;
                    break;
                }

                case "minecraft:stonecutting": {
                    const firstSlotWithContent = this.getFirstSlotWithContent(recipe.slots);
                    recipe.slots = firstSlotWithContent ? { "0": firstSlotWithContent } : {};
                    recipe.gridSize = undefined;
                    recipe.typeSpecific = undefined;
                    break;
                }
            }
        }

        return recipe;
    }

    private getFirstSlotWithContent(slots: Record<string, string[] | string>): string[] | string | null {
        for (const slotContent of Object.values(slots)) {
            if (slotContent && (typeof slotContent === "string" || slotContent.length > 0)) {
                if (Array.isArray(slotContent) && slotContent.length > 1) {
                    return [slotContent[0]];
                }
                return slotContent;
            }
        }
        return null;
    }
}
