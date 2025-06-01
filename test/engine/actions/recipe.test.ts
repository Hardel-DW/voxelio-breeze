import { describe, it, expect } from "vitest";
import { RecipeModifier } from "@/core/engine/actions/RecipeAction";
import type { RecipeProps } from "@/core/schema/recipe/types";
import type { AddIngredientAction, RemoveIngredientAction, ConvertRecipeTypeAction } from "@/core/engine/actions/RecipeAction";

describe("Recipe Actions", () => {
    const baseRecipe: RecipeProps = {
        identifier: { namespace: "test", registry: "recipe", resource: "test" },
        type: "minecraft:crafting_shaped",
        slots: {
            "0": ["minecraft:diamond"],
            "1": ["minecraft:stick"],
            "4": ["minecraft:stick"]
        },
        gridSize: { width: 3, height: 3 },
        result: {
            item: "minecraft:diamond_sword",
            count: 1
        }
    };

    describe("add_ingredient", () => {
        it("should add ingredient to empty slot", () => {
            const action: AddIngredientAction = {
                type: "add_ingredient",
                field: "slots",
                slot: "2",
                items: ["minecraft:emerald"]
            };

            const result = RecipeModifier(action, baseRecipe) as RecipeProps;

            expect(result.slots["2"]).toEqual(["minecraft:emerald"]);
            expect(result.slots["0"]).toEqual(["minecraft:diamond"]); // Other slots unchanged
        });

        it("should merge ingredients with existing slot", () => {
            const action: AddIngredientAction = {
                type: "add_ingredient",
                field: "slots",
                slot: "0",
                items: ["minecraft:emerald"]
            };

            const result = RecipeModifier(action, baseRecipe) as RecipeProps;

            expect(result.slots["0"]).toEqual(["minecraft:diamond", "minecraft:emerald"]);
        });

        it("should replace ingredients when replace=true", () => {
            const action: AddIngredientAction = {
                type: "add_ingredient",
                field: "slots",
                slot: "0",
                items: ["minecraft:emerald"],
                replace: true
            };

            const result = RecipeModifier(action, baseRecipe) as RecipeProps;

            expect(result.slots["0"]).toEqual(["minecraft:emerald"]);
        });
    });

    describe("remove_ingredient", () => {
        it("should remove entire slot when no items specified", () => {
            const action: RemoveIngredientAction = {
                type: "remove_ingredient",
                field: "slots",
                slot: "0"
            };

            const result = RecipeModifier(action, baseRecipe) as RecipeProps;

            expect(result.slots["0"]).toBeUndefined();
            expect(result.slots["1"]).toEqual(["minecraft:stick"]); // Other slots unchanged
        });

        it("should remove specific items from slot", () => {
            const recipeWithMultipleItems: RecipeProps = {
                ...baseRecipe,
                slots: {
                    "0": ["minecraft:diamond", "minecraft:emerald", "minecraft:gold_ingot"]
                }
            };

            const action: RemoveIngredientAction = {
                type: "remove_ingredient",
                field: "slots",
                slot: "0",
                items: ["minecraft:emerald"]
            };

            const result = RecipeModifier(action, recipeWithMultipleItems) as RecipeProps;

            expect(result.slots["0"]).toEqual(["minecraft:diamond", "minecraft:gold_ingot"]);
        });
    });

    describe("convert_recipe_type", () => {
        it("should convert shaped to shapeless", () => {
            const action: ConvertRecipeTypeAction = {
                type: "convert_recipe_type",
                field: "type",
                newType: "minecraft:crafting_shapeless"
            };

            const result = RecipeModifier(action, baseRecipe) as RecipeProps;

            expect(result.type).toBe("minecraft:crafting_shapeless");
            expect(result.gridSize).toBeUndefined();
            expect(result.slots).toEqual(baseRecipe.slots); // Slots preserved
        });

        it("should convert to smelting with single ingredient", () => {
            const action: ConvertRecipeTypeAction = {
                type: "convert_recipe_type",
                field: "type",
                newType: "minecraft:smelting"
            };

            const result = RecipeModifier(action, baseRecipe) as RecipeProps;

            expect(result.type).toBe("minecraft:smelting");
            expect(result.gridSize).toBeUndefined();
            expect(result.slots).toEqual({ "0": ["minecraft:diamond"] }); // First item only
        });
    });
});
