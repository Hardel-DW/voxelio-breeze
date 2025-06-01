import type {
    RecipeProps,
    MinecraftRecipe,
    RecipeCompiler,
    CompilerResult,
    RecipeIngredient,
    ShapedCraftingData,
    SmeltingData,
    SmithingTransformData,
    SmithingTrimData,
    CraftingTransmuteData
} from "./types";
import type { Analysers } from "@/core/engine/Analyser";
import { denormalizeIngredient } from "./types";

/**
 * Compile Voxel recipe format back to Minecraft Recipe format
 */
export const VoxelToRecipeDataDriven: RecipeCompiler = (
    element: RecipeProps,
    _: keyof Analysers,
    original?: MinecraftRecipe
): CompilerResult => {
    const recipe = original ? structuredClone(original) : ({} as MinecraftRecipe);

    // Build ingredient lookup map
    const ingredientMap = new Map(element.ingredients.map((ing) => [ing.id, ing]));

    // Set common fields
    recipe.type = element.type;
    if (element.group) recipe.group = element.group;
    if (element.category) recipe.category = element.category;
    if (element.showNotification !== undefined) recipe.show_notification = element.showNotification;

    // Compile based on recipe type
    switch (element.type) {
        case "minecraft:crafting_shaped":
            compileShapedCrafting();
            break;
        case "minecraft:crafting_shapeless":
            compileShapelessCrafting();
            break;
        case "minecraft:crafting_transmute":
            compileCraftingTransmute();
            break;
        case "minecraft:smelting":
        case "minecraft:blasting":
        case "minecraft:smoking":
        case "minecraft:campfire_cooking":
            compileSmelting();
            break;
        case "minecraft:stonecutting":
            compileStonecutting();
            break;
        case "minecraft:smithing_transform":
            compileSmithingTransform();
            break;
        case "minecraft:smithing_trim":
            compileSmithingTrim();
            break;
        default:
            compileGenericRecipe();
            break;
    }

    // Set result
    if (element.type !== "minecraft:smithing_trim") {
        recipe.result = compileResult();
    }

    // Restore unknown fields
    if (element.unknownFields) {
        Object.assign(recipe, element.unknownFields);
    }

    return {
        element: {
            data: recipe,
            identifier: element.identifier
        },
        tags: []
    };

    function compileShapedCrafting() {
        const shapedData = element.typeSpecific as ShapedCraftingData;
        if (!shapedData) return;

        recipe.pattern = shapedData.pattern;
        recipe.key = {};

        // Build key from ingredients with slots
        for (const ingredient of element.ingredients) {
            if (ingredient.slot && ingredient.slot !== " ") {
                // Use original format if available, otherwise denormalize
                if (original?.key?.[ingredient.slot]) {
                    recipe.key[ingredient.slot] = original.key[ingredient.slot];
                } else {
                    recipe.key[ingredient.slot] = denormalizeIngredient(ingredient.items);
                }
            }
        }
    }

    function compileShapelessCrafting() {
        // Use original format if available
        if (original?.ingredients) {
            recipe.ingredients = original.ingredients;
        } else {
            recipe.ingredients = element.ingredients.map((ing) => denormalizeIngredient(ing.items)).filter((ing) => ing !== undefined);
        }
    }

    function compileCraftingTransmute() {
        const transmuteData = element.typeSpecific as CraftingTransmuteData;
        if (!transmuteData) return;

        const inputIngredient = ingredientMap.get(transmuteData.inputSlot);
        const materialIngredient = ingredientMap.get(transmuteData.materialSlot);

        if (inputIngredient) {
            recipe.input = original?.input || denormalizeIngredient(inputIngredient.items);
        }
        if (materialIngredient) {
            recipe.material = original?.material || denormalizeIngredient(materialIngredient.items);
        }
    }

    function compileSmelting() {
        const smeltingData = element.typeSpecific as SmeltingData;

        // Set ingredient (should be only one for smelting)
        if (element.ingredients.length > 0) {
            recipe.ingredient = original?.ingredient || denormalizeIngredient(element.ingredients[0].items);
        }

        if (smeltingData?.experience !== undefined) {
            recipe.experience = smeltingData.experience;
        }
        if (smeltingData?.cookingTime !== undefined) {
            recipe.cookingtime = smeltingData.cookingTime;
        }
    }

    function compileStonecutting() {
        // Set ingredient (should be only one for stonecutting)
        if (element.ingredients.length > 0) {
            recipe.ingredient = original?.ingredient || denormalizeIngredient(element.ingredients[0].items);
        }

        // Legacy count field for older versions
        if (element.result.count && element.result.count > 1) {
            recipe.count = element.result.count;
        }
    }

    function compileSmithingTransform() {
        const smithingData = element.typeSpecific as SmithingTransformData;
        if (!smithingData) return;

        const baseIngredient = ingredientMap.get(smithingData.baseSlot);
        const additionIngredient = ingredientMap.get(smithingData.additionSlot);
        const templateIngredient = ingredientMap.get(smithingData.templateSlot);

        if (baseIngredient) {
            recipe.base = original?.base || denormalizeIngredient(baseIngredient.items);
        }
        if (additionIngredient) {
            recipe.addition = original?.addition || denormalizeIngredient(additionIngredient.items);
        }
        if (templateIngredient) {
            recipe.template = original?.template || denormalizeIngredient(templateIngredient.items);
        }
    }

    function compileSmithingTrim() {
        const trimData = element.typeSpecific as SmithingTrimData;
        if (!trimData) return;

        const baseIngredient = ingredientMap.get(trimData.baseSlot);
        const additionIngredient = ingredientMap.get(trimData.additionSlot);
        const templateIngredient = ingredientMap.get(trimData.templateSlot);

        if (baseIngredient) {
            recipe.base = original?.base || denormalizeIngredient(baseIngredient.items);
        }
        if (additionIngredient) {
            recipe.addition = original?.addition || denormalizeIngredient(additionIngredient.items);
        }
        if (templateIngredient) {
            recipe.template = original?.template || denormalizeIngredient(templateIngredient.items);
        }
        if (trimData.pattern) {
            recipe.pattern = trimData.pattern;
        }
    }

    function compileGenericRecipe() {
        // For unknown recipe types, try to set common fields
        if (element.ingredients.length > 0) {
            // If there's only one ingredient, use singular form
            if (element.ingredients.length === 1) {
                recipe.ingredient = denormalizeIngredient(element.ingredients[0].items);
            } else {
                // Multiple ingredients, use array form
                recipe.ingredients = element.ingredients.map((ing) => denormalizeIngredient(ing.items)).filter((ing) => ing !== undefined);
            }
        }
    }

    function compileResult(): any {
        const result = element.result;

        // Use original result if available
        if (original?.result) {
            return original.result;
        }

        // Handle different result formats based on recipe type and version
        if (element.type === "minecraft:stonecutting" && !result.components) {
            // Legacy stonecutting format
            return result.item;
        }

        if (result.components) {
            // Modern ItemStack format (1.20.5+)
            return {
                item: result.item,
                ...(result.count && result.count > 1 && { count: result.count }),
                components: result.components,
                ...result.unknownFields
            };
        }

        if (result.count && result.count > 1) {
            // ItemResult format
            return {
                item: result.item,
                count: result.count,
                ...result.unknownFields
            };
        }

        // Simple string format
        return result.item;
    }
};
