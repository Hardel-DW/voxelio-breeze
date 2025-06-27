import { updateData } from "@/core/engine/actions";
import type { RecipeAction } from "@/core/engine/actions/domains/recipe/types";
import type { RecipeProps } from "@/core/schema/recipe/types";
import { createMockRecipe, createShapelessRecipe, createSmeltingRecipe } from "@test/template/concept/recipe/VoxelDriven";
import { describe, it, expect, beforeEach } from "vitest";

// Helper function to update data with proper typing
async function updateRecipe(action: any, recipe: RecipeProps, packVersion = 48): Promise<RecipeProps> {
    const result = await updateData(action, recipe, packVersion);
    expect(result).toBeDefined();
    return result as RecipeProps;
}

describe("Recipe Actions", () => {
    let mockRecipe: RecipeProps;
    let shapelessRecipe: RecipeProps;
    let smeltingRecipe: RecipeProps;

    beforeEach(() => {
        mockRecipe = createMockRecipe();
        shapelessRecipe = createShapelessRecipe();
        smeltingRecipe = createSmeltingRecipe();
    });

    describe("Recipe Domain Actions", () => {
        describe("add_ingredient", () => {
            it("should add ingredient to empty slot", async () => {
                // Vérifie l'état initial
                expect(mockRecipe.slots["2"]).toBeUndefined();
                expect(mockRecipe.slots["0"]).toEqual(["minecraft:diamond"]);

                const action: RecipeAction = {
                    type: "recipe.add_ingredient",
                    slot: "2",
                    items: ["minecraft:emerald"]
                };

                const result = await updateRecipe(action, mockRecipe);
                expect(result.slots["2"]).toEqual(["minecraft:emerald"]);
                expect(result.slots["0"]).toEqual(["minecraft:diamond"]); // Pas touché

                // Vérifie que l'objet original n'a pas changé
                expect(mockRecipe.slots["2"]).toBeUndefined();
                expect(result).not.toBe(mockRecipe);
            });

            it("should merge ingredients with existing slot", async () => {
                // Vérifie l'état initial
                expect(mockRecipe.slots["0"]).toEqual(["minecraft:diamond"]);

                const action: RecipeAction = {
                    type: "recipe.add_ingredient",
                    slot: "0",
                    items: ["minecraft:emerald"]
                };

                const result = await updateRecipe(action, mockRecipe);
                expect(result.slots["0"]).toEqual(["minecraft:diamond", "minecraft:emerald"]);

                // Vérifie que l'objet original n'a pas changé
                expect(mockRecipe.slots["0"]).toEqual(["minecraft:diamond"]);
                expect(result).not.toBe(mockRecipe);
            });

            it("should replace ingredients when replace=true", async () => {
                // Vérifie l'état initial
                expect(mockRecipe.slots["0"]).toEqual(["minecraft:diamond"]);

                const action: RecipeAction = {
                    type: "recipe.add_ingredient",
                    slot: "0",
                    items: ["minecraft:emerald"],
                    replace: true
                };

                const result = await updateRecipe(action, mockRecipe);
                expect(result.slots["0"]).toEqual(["minecraft:emerald"]);

                // Vérifie que l'objet original n'a pas changé
                expect(mockRecipe.slots["0"]).toEqual(["minecraft:diamond"]);
                expect(result).not.toBe(mockRecipe);
            });

            it("should avoid duplicate items when merging", async () => {
                const recipeWithDuplicates = createMockRecipe({
                    slots: {
                        "0": ["minecraft:diamond", "minecraft:stick"]
                    }
                });

                const action: RecipeAction = {
                    type: "recipe.add_ingredient",
                    slot: "0",
                    items: ["minecraft:diamond", "minecraft:emerald"] // diamond déjà présent
                };

                const result = await updateRecipe(action, recipeWithDuplicates);
                expect(result.slots["0"]).toEqual(["minecraft:diamond", "minecraft:stick", "minecraft:emerald"]);
            });
        });

        describe("remove_ingredient", () => {
            it("should remove entire slot when no items specified", async () => {
                // Vérifie l'état initial
                expect(mockRecipe.slots["0"]).toEqual(["minecraft:diamond"]);
                expect(mockRecipe.slots["1"]).toEqual(["minecraft:stick"]);

                const action: RecipeAction = {
                    type: "recipe.remove_ingredient",
                    slot: "0"
                };

                const result = await updateRecipe(action, mockRecipe);
                expect(result.slots["0"]).toBeUndefined();
                expect(result.slots["1"]).toEqual(["minecraft:stick"]); // Pas touché

                // Vérifie que l'objet original n'a pas changé
                expect(mockRecipe.slots["0"]).toEqual(["minecraft:diamond"]);
                expect(result).not.toBe(mockRecipe);
            });

            it("should remove specific items from slot", async () => {
                const recipeWithMultipleItems = createMockRecipe({
                    slots: {
                        "0": ["minecraft:diamond", "minecraft:emerald", "minecraft:gold_ingot"]
                    }
                });

                const action: RecipeAction = {
                    type: "recipe.remove_ingredient",
                    slot: "0",
                    items: ["minecraft:emerald"]
                };

                const result = await updateRecipe(action, recipeWithMultipleItems);
                expect(result.slots["0"]).toEqual(["minecraft:diamond", "minecraft:gold_ingot"]);

                // Vérifie que l'objet original n'a pas changé
                expect(recipeWithMultipleItems.slots["0"]).toEqual(["minecraft:diamond", "minecraft:emerald", "minecraft:gold_ingot"]);
                expect(result).not.toBe(recipeWithMultipleItems);
            });

            it("should remove slot when it becomes empty", async () => {
                const recipeWithSingleItem = createMockRecipe({
                    slots: {
                        "0": ["minecraft:diamond"]
                    }
                });

                const action: RecipeAction = {
                    type: "recipe.remove_ingredient",
                    slot: "0",
                    items: ["minecraft:diamond"]
                };

                const result = await updateRecipe(action, recipeWithSingleItem);
                expect(result.slots["0"]).toBeUndefined();
            });

            it("should handle removing from non-existent slot gracefully", async () => {
                const action: RecipeAction = {
                    type: "recipe.remove_ingredient",
                    slot: "99" // N'existe pas
                };

                const result = await updateRecipe(action, mockRecipe);
                expect(result.slots).toEqual(mockRecipe.slots); // Pas de changement
            });
        });

        describe("convert_recipe_type", () => {
            it("should convert shaped to shapeless", async () => {
                // Vérifie l'état initial
                expect(mockRecipe.type).toBe("minecraft:crafting_shaped");
                expect(mockRecipe.gridSize).toEqual({ width: 3, height: 3 });

                const action: RecipeAction = {
                    type: "recipe.convert_recipe_type",
                    newType: "minecraft:crafting_shapeless"
                };

                const result = await updateRecipe(action, mockRecipe);
                expect(result.type).toBe("minecraft:crafting_shapeless");
                expect(result.gridSize).toBeUndefined();
                expect(result.slots).toEqual(mockRecipe.slots); // Slots préservés

                // Vérifie que l'objet original n'a pas changé
                expect(mockRecipe.type).toBe("minecraft:crafting_shaped");
                expect(mockRecipe.gridSize).toEqual({ width: 3, height: 3 });
                expect(result).not.toBe(mockRecipe);
            });

            it("should convert shapeless to shaped with default grid", async () => {
                // Vérifie l'état initial
                expect(shapelessRecipe.type).toBe("minecraft:crafting_shapeless");
                expect(shapelessRecipe.gridSize).toBeUndefined();

                const action: RecipeAction = {
                    type: "recipe.convert_recipe_type",
                    newType: "minecraft:crafting_shaped"
                };

                const result = await updateRecipe(action, shapelessRecipe);
                expect(result.type).toBe("minecraft:crafting_shaped");
                expect(result.gridSize).toEqual({ width: 3, height: 3 });

                // Vérifie que l'objet original n'a pas changé
                expect(shapelessRecipe.type).toBe("minecraft:crafting_shapeless");
                expect(shapelessRecipe.gridSize).toBeUndefined();
                expect(result).not.toBe(shapelessRecipe);
            });

            it("should convert to smelting with single ingredient", async () => {
                // Vérifie l'état initial
                expect(mockRecipe.slots).toEqual({
                    "0": ["minecraft:diamond"],
                    "1": ["minecraft:stick"],
                    "4": ["minecraft:stick"]
                });

                const action: RecipeAction = {
                    type: "recipe.convert_recipe_type",
                    newType: "minecraft:smelting"
                };

                const result = await updateRecipe(action, mockRecipe);
                expect(result.type).toBe("minecraft:smelting");
                expect(result.gridSize).toBeUndefined();
                expect(result.slots).toEqual({ "0": ["minecraft:diamond"] }); // Premier item seulement

                // Vérifie que l'objet original n'a pas changé
                expect(mockRecipe.slots).toEqual({
                    "0": ["minecraft:diamond"],
                    "1": ["minecraft:stick"],
                    "4": ["minecraft:stick"]
                });
                expect(result).not.toBe(mockRecipe);
            });

            it("should convert to stonecutting and remove type-specific data", async () => {
                const action: RecipeAction = {
                    type: "recipe.convert_recipe_type",
                    newType: "minecraft:stonecutting"
                };

                const result = await updateRecipe(action, smeltingRecipe);
                expect(result.type).toBe("minecraft:stonecutting");
                expect(result.gridSize).toBeUndefined();
                expect(result.typeSpecific).toBeUndefined();
                expect(result.slots).toEqual({ "0": ["minecraft:iron_ore"] });

                // Vérifie que l'objet original n'a pas changé
                expect(smeltingRecipe.typeSpecific).toBeDefined();
                expect(result).not.toBe(smeltingRecipe);
            });
        });

        describe("clear_slot", () => {
            it("should clear a specific slot", async () => {
                // Vérifie l'état initial
                expect(mockRecipe.slots["0"]).toEqual(["minecraft:diamond"]);
                expect(mockRecipe.slots["1"]).toEqual(["minecraft:stick"]);

                const action: RecipeAction = {
                    type: "recipe.clear_slot",
                    slot: "0"
                };

                const result = await updateRecipe(action, mockRecipe);
                expect(result.slots["0"]).toBeUndefined();
                expect(result.slots["1"]).toEqual(["minecraft:stick"]); // Pas touché

                // Vérifie que l'objet original n'a pas changé
                expect(mockRecipe.slots["0"]).toEqual(["minecraft:diamond"]);
                expect(result).not.toBe(mockRecipe);
            });

            it("should handle clearing non-existent slot gracefully", async () => {
                const action: RecipeAction = {
                    type: "recipe.clear_slot",
                    slot: "99" // N'existe pas
                };

                const result = await updateRecipe(action, mockRecipe);
                expect(result.slots).toEqual(mockRecipe.slots); // Pas de changement
            });
        });
    });

    describe("Complex Recipe Operations", () => {
        it("should handle sequential recipe modifications", async () => {
            const sequentialAction = {
                type: "core.sequential",
                actions: [
                    {
                        type: "recipe.add_ingredient",
                        slot: "2",
                        items: ["minecraft:emerald"]
                    },
                    {
                        type: "recipe.remove_ingredient",
                        slot: "1"
                    }
                ]
            };

            const result = await updateRecipe(sequentialAction, mockRecipe);
            expect(result.slots["2"]).toEqual(["minecraft:emerald"]); // Ajouté
            expect(result.slots["1"]).toBeUndefined(); // Supprimé

            // Vérifie que l'objet original n'a pas changé
            expect(mockRecipe.slots["0"]).toEqual(["minecraft:diamond"]);
            expect(mockRecipe.slots["1"]).toEqual(["minecraft:stick"]);
            expect(result).not.toBe(mockRecipe);
        });

        it("should preserve identifier through recipe actions", async () => {
            const action: RecipeAction = {
                type: "recipe.add_ingredient",
                slot: "5",
                items: ["minecraft:coal"]
            };

            const result = await updateRecipe(action, mockRecipe);
            expect(result.identifier).toBeDefined();
            expect(mockRecipe.identifier).toEqual(result.identifier);
        });

        it("should handle complex type conversion", async () => {
            const complexRecipe = createMockRecipe({
                type: "minecraft:crafting_shaped",
                slots: {
                    "0": ["minecraft:coal", "minecraft:charcoal"],
                    "1": ["minecraft:stick"],
                    "3": ["minecraft:stick"],
                    "4": ["minecraft:stick"],
                    "5": ["minecraft:stick"]
                },
                gridSize: { width: 3, height: 2 }
            });

            const action: RecipeAction = {
                type: "recipe.convert_recipe_type",
                newType: "minecraft:campfire_cooking"
            };

            const result = await updateRecipe(action, complexRecipe);
            expect(result.type).toBe("minecraft:campfire_cooking");
            expect(result.slots).toEqual({ "0": ["minecraft:coal"] });
            expect(result.gridSize).toBeUndefined();
        });
    });
});
