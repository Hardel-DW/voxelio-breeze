import type { ActionHandler } from "../../types";
import type { RecipeAction } from "./types";
import { createRecipeHandlers } from "./types";
import { AddIngredientHandler, RemoveIngredientHandler, ClearSlotHandler, SwapSlotsHandler } from "./AddIngredientHandler";
import { ConvertRecipeTypeHandler } from "./ConvertRecipeTypeHandler";

export default function register(): Map<string, ActionHandler<RecipeAction>> {
    const handlerDefinitions = createRecipeHandlers({
        "recipe.add_ingredient": new AddIngredientHandler(),
        "recipe.remove_ingredient": new RemoveIngredientHandler(),
        "recipe.convert_recipe_type": new ConvertRecipeTypeHandler(),
        "recipe.swap_slots": new SwapSlotsHandler(),
        "recipe.clear_slot": new ClearSlotHandler()
    });

    return new Map(Object.entries(handlerDefinitions));
}
