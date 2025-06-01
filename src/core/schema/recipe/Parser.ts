import type { ParserParams } from "@/core/engine/Parser";
import type {
    CraftingTransmuteData,
    MinecraftRecipe,
    RecipeIngredient,
    RecipeParser,
    RecipeProps,
    RecipeResult,
    RecipeTypeSpecific,
    ShapedCraftingData,
    SmeltingData,
    SmithingTransformData,
    SmithingTrimData
} from "./types";
import { KNOWN_RECIPE_FIELDS, extractUnknownFields, normalizeIngredient } from "./types";

/**
 * Parse Minecraft Recipe to simplified Voxel format
 */
export const RecipeDataDrivenToVoxelFormat: RecipeParser = ({ element, configurator }: ParserParams<MinecraftRecipe>): RecipeProps => {
    const data = element.data;
    let ingredientCounter = 0;
    const ingredients: RecipeIngredient[] = [];
    let typeSpecific: RecipeTypeSpecific | undefined;

    // Parse based on recipe type
    switch (data.type) {
        case "minecraft:crafting_shaped":
            parseShapedCrafting();
            break;
        case "minecraft:crafting_shapeless":
            parseShapelessCrafting();
            break;
        case "minecraft:crafting_transmute":
            parseCraftingTransmute();
            break;
        case "minecraft:smelting":
        case "minecraft:blasting":
        case "minecraft:smoking":
        case "minecraft:campfire_cooking":
            parseSmelting();
            break;
        case "minecraft:stonecutting":
            parseStonecutting();
            break;
        case "minecraft:smithing_transform":
            parseSmithingTransform();
            break;
        case "minecraft:smithing_trim":
            parseSmithingTrim();
            break;
        default:
            // Handle unknown/mod recipe types
            parseGenericRecipe();
            break;
    }

    // Parse result
    let result: RecipeResult;
    if (data.type === "minecraft:smithing_trim") {
        // Smithing trim doesn't produce a result item
        result = {
            item: "minecraft:air",
            count: 1
        };
    } else if (data.result) {
        result = parseResult(data.result, data.count);
    } else {
        // Fallback for recipes without explicit result
        result = {
            item: "minecraft:air",
            count: 1
        };
    }

    return {
        identifier: element.identifier,
        type: data.type,
        group: data.group,
        category: data.category,
        showNotification: data.show_notification,
        ingredients,
        result,
        typeSpecific,
        unknownFields: extractUnknownFields(data, KNOWN_RECIPE_FIELDS),
        override: configurator
    };

    function parseShapedCrafting() {
        if (!data.pattern || !data.key) return;

        const pattern = data.pattern;
        const key = data.key;

        // Create ingredients from key
        for (const [symbol, ingredient] of Object.entries(key)) {
            if (symbol === " ") continue; // Skip spaces

            ingredients.push({
                id: `ingredient_${ingredientCounter++}`,
                slot: symbol,
                items: normalizeIngredient(ingredient)
            });
        }

        typeSpecific = {
            pattern,
            width: Math.max(...(Array.isArray(pattern) ? pattern.map((row) => row.length) : [pattern.length])),
            height: pattern.length
        } as ShapedCraftingData;
    }

    function parseShapelessCrafting() {
        if (!data.ingredients) return;

        for (const ingredient of data.ingredients) {
            ingredients.push({
                id: `ingredient_${ingredientCounter++}`,
                items: normalizeIngredient(ingredient)
            });
        }
    }

    function parseCraftingTransmute() {
        const inputId = `ingredient_${ingredientCounter++}`;
        const materialId = `ingredient_${ingredientCounter++}`;

        if (data.input) {
            ingredients.push({
                id: inputId,
                items: normalizeIngredient(data.input)
            });
        }

        if (data.material) {
            ingredients.push({
                id: materialId,
                items: normalizeIngredient(data.material)
            });
        }

        typeSpecific = {
            inputSlot: inputId,
            materialSlot: materialId
        } as CraftingTransmuteData;
    }

    function parseSmelting() {
        if (data.ingredient) {
            ingredients.push({
                id: `ingredient_${ingredientCounter++}`,
                items: normalizeIngredient(data.ingredient)
            });
        }

        typeSpecific = {
            experience: data.experience,
            cookingTime: data.cookingtime
        } as SmeltingData;
    }

    function parseStonecutting() {
        if (data.ingredient) {
            ingredients.push({
                id: `ingredient_${ingredientCounter++}`,
                items: normalizeIngredient(data.ingredient)
            });
        }
    }

    function parseSmithingTransform() {
        const baseId = `ingredient_${ingredientCounter++}`;
        const additionId = `ingredient_${ingredientCounter++}`;
        const templateId = `ingredient_${ingredientCounter++}`;

        if (data.base) {
            ingredients.push({
                id: baseId,
                items: normalizeIngredient(data.base)
            });
        }

        if (data.addition) {
            ingredients.push({
                id: additionId,
                items: normalizeIngredient(data.addition)
            });
        }

        if (data.template) {
            ingredients.push({
                id: templateId,
                items: normalizeIngredient(data.template)
            });
        }

        typeSpecific = {
            baseSlot: baseId,
            additionSlot: additionId,
            templateSlot: templateId
        } as SmithingTransformData;
    }

    function parseSmithingTrim() {
        const baseId = `ingredient_${ingredientCounter++}`;
        const additionId = `ingredient_${ingredientCounter++}`;
        const templateId = `ingredient_${ingredientCounter++}`;

        if (data.base) {
            ingredients.push({
                id: baseId,
                items: normalizeIngredient(data.base)
            });
        }

        if (data.addition) {
            ingredients.push({
                id: additionId,
                items: normalizeIngredient(data.addition)
            });
        }

        if (data.template) {
            ingredients.push({
                id: templateId,
                items: normalizeIngredient(data.template)
            });
        }

        typeSpecific = {
            baseSlot: baseId,
            additionSlot: additionId,
            templateSlot: templateId,
            pattern: data.pattern_trim
        } as SmithingTrimData;
    }

    function parseGenericRecipe() {
        // Try to extract ingredients from common fields
        if (data.ingredients) {
            for (const ingredient of data.ingredients) {
                ingredients.push({
                    id: `ingredient_${ingredientCounter++}`,
                    items: normalizeIngredient(ingredient)
                });
            }
        }

        if (data.ingredient) {
            ingredients.push({
                id: `ingredient_${ingredientCounter++}`,
                items: normalizeIngredient(data.ingredient)
            });
        }
    }

    function parseResult(result: any, legacyCount?: number): RecipeResult {
        if (typeof result === "string") {
            return {
                item: result,
                count: legacyCount || 1
            };
        }

        if (result?.item) {
            return {
                item: result.item,
                count: result.count || legacyCount || 1,
                components: result.components
            };
        }

        // Handle complex result objects
        return {
            item: result?.id || "minecraft:air",
            count: result?.count || legacyCount || 1,
            components: result?.components,
            unknownFields: result ? extractUnknownFields(result, new Set(["item", "id", "count", "components"])) : undefined
        };
    }
};
