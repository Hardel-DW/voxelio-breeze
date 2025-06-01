import type { Analysers } from "@/core/engine/Analyser";
import type {
    CompilerResult,
    CraftingTransmuteData,
    MinecraftRecipe,
    RecipeCompiler,
    RecipeProps,
    SmeltingData,
    SmithingTransformData,
    SmithingTrimData
} from "./types";
import { denormalizeIngredient, slotToPosition, getOccupiedSlots } from "./types";

/**
 * Compile Voxel recipe format back to Minecraft Recipe format using slot-based system
 */
export const VoxelToRecipeDataDriven: RecipeCompiler = (
    element: RecipeProps,
    _: keyof Analysers,
    original?: MinecraftRecipe
): CompilerResult => {
    const recipe = original ? structuredClone(original) : ({} as MinecraftRecipe);

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
        const gridSize = element.gridSize || { width: 3, height: 3 };

        // If we have an original recipe, try to recreate its pattern structure
        if (original?.pattern && original?.key) {
            const originalPattern = Array.isArray(original.pattern) ? original.pattern : [original.pattern];
            const canReuseOriginal = checkCanReuseOriginalPattern(originalPattern, original.key, gridSize);

            if (canReuseOriginal) {
                recipe.pattern = originalPattern;
                recipe.key = original.key;
                return;
            }
        }

        // Fallback to generating new pattern
        const pattern: string[] = [];
        const key: Record<string, any> = {};
        let symbolCounter = 65; // Start with 'A'

        // Create pattern and key from slots
        for (let row = 0; row < gridSize.height; row++) {
            let patternRow = "";
            for (let col = 0; col < gridSize.width; col++) {
                const slotIndex = (row * gridSize.width + col).toString();
                const items = element.slots[slotIndex];

                if (items && items.length > 0) {
                    // Find existing symbol for these items or create new one
                    let symbol = findExistingSymbol(items, key);
                    if (!symbol) {
                        symbol = String.fromCharCode(symbolCounter++);
                        key[symbol] = denormalizeIngredient(items);
                    }
                    patternRow += symbol;
                } else {
                    patternRow += " ";
                }
            }
            pattern.push(patternRow);
        }

        recipe.pattern = pattern;
        recipe.key = key;
    }

    function compileShapelessCrafting() {
        const occupiedSlots = getOccupiedSlots(element.slots);

        // Use original format if available
        if (original?.ingredients) {
            recipe.ingredients = original.ingredients;
        } else {
            recipe.ingredients = occupiedSlots
                .map((slot) => element.slots[slot])
                .map((items) => denormalizeIngredient(items))
                .filter((ing) => ing !== undefined);
        }
    }

    function compileCraftingTransmute() {
        const transmuteData = element.typeSpecific as CraftingTransmuteData;
        if (!transmuteData) return;

        const inputItems = element.slots[transmuteData.inputSlot];
        const materialItems = element.slots[transmuteData.materialSlot];

        if (inputItems) {
            recipe.input = original?.input || denormalizeIngredient(inputItems);
        }
        if (materialItems) {
            recipe.material = original?.material || denormalizeIngredient(materialItems);
        }
    }

    function compileSmelting() {
        const smeltingData = element.typeSpecific as SmeltingData;

        // Set ingredient from slot 0
        const ingredientItems = element.slots["0"];
        if (ingredientItems) {
            recipe.ingredient = original?.ingredient || denormalizeIngredient(ingredientItems);
        }

        if (smeltingData?.experience !== undefined) {
            recipe.experience = smeltingData.experience;
        }
        if (smeltingData?.cookingTime !== undefined) {
            recipe.cookingtime = smeltingData.cookingTime;
        }
    }

    function compileStonecutting() {
        // Set ingredient from slot 0
        const ingredientItems = element.slots["0"];
        if (ingredientItems) {
            recipe.ingredient = original?.ingredient || denormalizeIngredient(ingredientItems);
        }

        // Legacy count field for older versions
        if (element.result.count && element.result.count > 1) {
            recipe.count = element.result.count;
        }
    }

    function compileSmithingTransform() {
        const smithingData = element.typeSpecific as SmithingTransformData;
        if (!smithingData) return;

        const templateItems = element.slots[smithingData.templateSlot];
        const baseItems = element.slots[smithingData.baseSlot];
        const additionItems = element.slots[smithingData.additionSlot];

        if (templateItems) {
            recipe.template = original?.template || denormalizeIngredient(templateItems);
        }
        if (baseItems) {
            recipe.base = original?.base || denormalizeIngredient(baseItems);
        }
        if (additionItems) {
            recipe.addition = original?.addition || denormalizeIngredient(additionItems);
        }
    }

    function compileSmithingTrim() {
        const trimData = element.typeSpecific as SmithingTrimData;
        if (!trimData) return;

        const templateItems = element.slots[trimData.templateSlot];
        const baseItems = element.slots[trimData.baseSlot];
        const additionItems = element.slots[trimData.additionSlot];

        if (templateItems) {
            recipe.template = original?.template || denormalizeIngredient(templateItems);
        }
        if (baseItems) {
            recipe.base = original?.base || denormalizeIngredient(baseItems);
        }
        if (additionItems) {
            recipe.addition = original?.addition || denormalizeIngredient(additionItems);
        }
        if (trimData.pattern) {
            recipe.pattern_trim = trimData.pattern;
        }
    }

    function compileGenericRecipe() {
        // For unknown recipe types, try to set common fields
        const occupiedSlots = getOccupiedSlots(element.slots);

        if (occupiedSlots.length > 0) {
            // If there's only one ingredient, use singular form
            if (occupiedSlots.length === 1) {
                const items = element.slots[occupiedSlots[0]];
                recipe.ingredient = denormalizeIngredient(items);
            } else {
                // Multiple ingredients, use array form
                recipe.ingredients = occupiedSlots
                    .map((slot) => element.slots[slot])
                    .map((items) => denormalizeIngredient(items))
                    .filter((ing) => ing !== undefined);
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

    // Helper function to check if we can reuse the original pattern
    function checkCanReuseOriginalPattern(
        originalPattern: string[],
        originalKey: Record<string, any>,
        gridSize: { width: number; height: number }
    ): boolean {
        // Check if grid dimensions match
        if (originalPattern.length !== gridSize.height) return false;
        if (originalPattern.some((row) => row.length !== gridSize.width)) return false;

        // Check if all slots match the original pattern
        for (let row = 0; row < gridSize.height; row++) {
            for (let col = 0; col < gridSize.width; col++) {
                const slotIndex = (row * gridSize.width + col).toString();
                const items = element.slots[slotIndex];
                const symbol = originalPattern[row][col];

                if (symbol === " ") {
                    // Empty slot should have no items
                    if (items && items.length > 0) return false;
                } else {
                    // Non-empty slot should match the key
                    if (!items || items.length === 0) return false;
                    const expectedIngredient = originalKey[symbol];
                    const actualIngredient = denormalizeIngredient(items);
                    if (JSON.stringify(expectedIngredient) !== JSON.stringify(actualIngredient)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    // Helper function to find existing symbol for items in key
    function findExistingSymbol(items: string[], key: Record<string, any>): string | null {
        const normalizedTarget = denormalizeIngredient(items);

        for (const [symbol, ingredient] of Object.entries(key)) {
            // Compare the denormalized forms
            if (JSON.stringify(normalizedTarget) === JSON.stringify(ingredient)) {
                return symbol;
            }
        }
        return null;
    }
};
