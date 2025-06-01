import type { Compiler } from "@/core/engine/Compiler";
import { RecipeDataDrivenToVoxelFormat } from "@/core/schema/recipe/Parser";
import { VoxelToRecipeDataDriven } from "@/core/schema/recipe/Compiler";
import type { RecipeProps, MinecraftRecipe } from "@/core/schema/recipe/types";
import {
    shapeless,
    shaped,
    ShapedWithEmptyLine,
    ShapedWithEmptyRows,
    shapedTwoByTwo,
    ShapedWithEmptyRowsAndColumns,
    stonecutting,
    blasting,
    smelting,
    smoking,
    campfire_cooking,
    smithing_transform,
    transmute,
    transform
} from "@test/template/concept/recipe/DataDriven";
import {
    shapelessVoxel,
    shapedVoxel,
    stonecuttingVoxel,
    blastingVoxel,
    smeltingVoxel,
    transformVoxel
} from "@test/template/concept/recipe/VoxelDriven";
import { describe, it, expect, beforeEach } from "vitest";

describe("Recipe Schema", () => {
    describe("Data Driven to Voxel Element", () => {
        describe("Shapeless Crafting", () => {
            let parsed: RecipeProps;

            beforeEach(() => {
                parsed = RecipeDataDrivenToVoxelFormat({ element: shapeless });
            });

            it("should parse shapeless recipe correctly", () => {
                expect(parsed).toBeDefined();
                expect(parsed.type).toBe("minecraft:crafting_shapeless");
                expect(parsed.group).toBe("planks");
                expect(parsed.category).toBe("building");
            });

            it("should have correct ingredients", () => {
                expect(parsed.ingredients).toHaveLength(1);
                const ingredient = parsed.ingredients[0];
                expect(ingredient.id).toBe("ingredient_0");
                expect(ingredient.items).toEqual(["#minecraft:acacia_logs"]);
                expect(ingredient.slot).toBeUndefined();
            });

            it("should have correct result", () => {
                expect(parsed.result.item).toBe("minecraft:acacia_planks");
                expect(parsed.result.count).toBe(4);
            });

            it("should not have type-specific data", () => {
                expect(parsed.typeSpecific).toBeUndefined();
            });
        });

        describe("Shaped Crafting", () => {
            let parsed: RecipeProps;

            beforeEach(() => {
                parsed = RecipeDataDrivenToVoxelFormat({ element: shaped });
            });

            it("should parse shaped recipe correctly", () => {
                expect(parsed).toBeDefined();
                expect(parsed.type).toBe("minecraft:crafting_shaped");
                expect(parsed.group).toBe("wooden_slab");
                expect(parsed.category).toBe("building");
            });

            it("should have correct ingredients with slots", () => {
                expect(parsed.ingredients).toHaveLength(1);
                const ingredient = parsed.ingredients[0];
                expect(ingredient.id).toBe("ingredient_0");
                expect(ingredient.slot).toBe("#");
                expect(ingredient.items).toEqual(["minecraft:acacia_planks"]);
            });

            it("should have correct shaped-specific data", () => {
                expect(parsed.typeSpecific).toBeDefined();
                const shapedData = parsed.typeSpecific as any;
                expect(shapedData.pattern).toEqual(["###"]);
                expect(shapedData.width).toBe(3);
                expect(shapedData.height).toBe(1);
            });
        });

        describe("Shaped Crafting with Empty Lines", () => {
            let parsed: RecipeProps;

            beforeEach(() => {
                parsed = RecipeDataDrivenToVoxelFormat({ element: ShapedWithEmptyLine });
            });

            it("should parse complex shaped recipe", () => {
                expect(parsed.type).toBe("minecraft:crafting_shaped");
                expect(parsed.showNotification).toBe(true);
            });

            it("should handle pattern with spaces", () => {
                const shapedData = parsed.typeSpecific as any;
                expect(shapedData.pattern).toEqual(["XXX", "   ", "XXX"]);
                expect(shapedData.width).toBe(3);
                expect(shapedData.height).toBe(3);
            });

            it("should parse result with components", () => {
                expect(parsed.result.item).toBe("minecraft:acacia_button");
                expect(parsed.result.count).toBe(1);
                expect(parsed.result.components).toEqual({
                    "minecraft:damage": 10,
                    "!minecraft:block_entity_data": {}
                });
            });
        });

        describe("Smelting Recipes", () => {
            let blastingParsed: RecipeProps;
            let smeltingParsed: RecipeProps;
            let smokingParsed: RecipeProps;
            let campfireParsed: RecipeProps;

            beforeEach(() => {
                blastingParsed = RecipeDataDrivenToVoxelFormat({ element: blasting });
                smeltingParsed = RecipeDataDrivenToVoxelFormat({ element: smelting });
                smokingParsed = RecipeDataDrivenToVoxelFormat({ element: smoking });
                campfireParsed = RecipeDataDrivenToVoxelFormat({ element: campfire_cooking });
            });

            it("should parse blasting recipe", () => {
                expect(blastingParsed.type).toBe("minecraft:blasting");
                expect(blastingParsed.group).toBe("iron_ingot");
                expect(blastingParsed.category).toBe("misc");

                const smeltingData = blastingParsed.typeSpecific as any;
                expect(smeltingData.experience).toBe(0.7);
                expect(smeltingData.cookingTime).toBe(100);
            });

            it("should parse smelting recipe", () => {
                expect(smeltingParsed.type).toBe("minecraft:smelting");

                const smeltingData = smeltingParsed.typeSpecific as any;
                expect(smeltingData.experience).toBe(0.7);
                expect(smeltingData.cookingTime).toBe(200);
            });

            it("should parse smoking recipe", () => {
                expect(smokingParsed.type).toBe("minecraft:smoking");
                expect(smokingParsed.category).toBe("food");

                const smeltingData = smokingParsed.typeSpecific as any;
                expect(smeltingData.experience).toBe(0.35);
                expect(smeltingData.cookingTime).toBe(100);
            });

            it("should parse campfire cooking recipe", () => {
                expect(campfireParsed.type).toBe("minecraft:campfire_cooking");

                const smeltingData = campfireParsed.typeSpecific as any;
                expect(smeltingData.experience).toBe(0.35);
                expect(smeltingData.cookingTime).toBe(600);
            });
        });

        describe("Stonecutting", () => {
            let parsed: RecipeProps;

            beforeEach(() => {
                parsed = RecipeDataDrivenToVoxelFormat({ element: stonecutting });
            });

            it("should parse stonecutting recipe", () => {
                expect(parsed.type).toBe("minecraft:stonecutting");
                expect(parsed.ingredients).toHaveLength(1);
                expect(parsed.ingredients[0].items).toEqual(["minecraft:andesite"]);
                expect(parsed.result.item).toBe("minecraft:andesite_slab");
                expect(parsed.result.count).toBe(2);
            });
        });

        describe("Smithing Recipes", () => {
            let transformParsed: RecipeProps;

            beforeEach(() => {
                transformParsed = RecipeDataDrivenToVoxelFormat({ element: transform });
            });

            it("should parse smithing transform recipe", () => {
                expect(transformParsed.type).toBe("minecraft:smithing_transform");
                expect(transformParsed.ingredients).toHaveLength(3);

                const smithingData = transformParsed.typeSpecific as any;
                expect(smithingData.baseSlot).toBe("ingredient_0");
                expect(smithingData.additionSlot).toBe("ingredient_1");
                expect(smithingData.templateSlot).toBe("ingredient_2");
            });
        });

        describe("Transmute Crafting", () => {
            let parsed: RecipeProps;

            beforeEach(() => {
                parsed = RecipeDataDrivenToVoxelFormat({ element: transmute });
            });

            it("should parse transmute recipe", () => {
                expect(parsed.type).toBe("minecraft:crafting_transmute");
                expect(parsed.category).toBe("misc");
                expect(parsed.ingredients).toHaveLength(2);

                const transmuteData = parsed.typeSpecific as any;
                expect(transmuteData.inputSlot).toBe("ingredient_0");
                expect(transmuteData.materialSlot).toBe("ingredient_1");
            });

            it("should handle array ingredients", () => {
                const materialIngredient = parsed.ingredients.find((ing) => ing.id === "ingredient_1");
                expect(materialIngredient?.items).toEqual(["minecraft:acacia_door", "minecraft:acacia_fence_gate"]);
            });
        });
    });

    describe("Voxel Element to Data Driven", () => {
        describe("Shapeless Compilation", () => {
            let compiled: ReturnType<Compiler<RecipeProps, MinecraftRecipe>>;

            beforeEach(() => {
                compiled = VoxelToRecipeDataDriven(shapelessVoxel.data, "recipe");
            });

            it("should compile shapeless recipe", () => {
                expect(compiled).toBeDefined();
                expect(compiled.element.data.type).toBe("minecraft:crafting_shapeless");
                expect(compiled.element.data.group).toBe("planks");
                expect(compiled.element.data.category).toBe("building");
            });

            it("should have correct ingredients array", () => {
                expect(compiled.element.data.ingredients).toHaveLength(1);
                expect(compiled.element.data.ingredients?.[0]).toEqual({ tag: "minecraft:acacia_logs" });
            });

            it("should have correct result", () => {
                expect(compiled.element.data.result).toEqual({
                    item: "minecraft:acacia_planks",
                    count: 4
                });
            });
        });

        describe("Shaped Compilation", () => {
            let compiled: ReturnType<Compiler<RecipeProps, MinecraftRecipe>>;

            beforeEach(() => {
                compiled = VoxelToRecipeDataDriven(shapedVoxel.data, "recipe");
            });

            it("should compile shaped recipe", () => {
                expect(compiled.element.data.type).toBe("minecraft:crafting_shaped");
                expect(compiled.element.data.pattern).toEqual(["###"]);
            });

            it("should have correct key mapping", () => {
                expect(compiled.element.data.key).toEqual({
                    "#": { item: "minecraft:acacia_planks" }
                });
            });
        });

        describe("Smelting Compilation", () => {
            let blastingCompiled: ReturnType<Compiler<RecipeProps, MinecraftRecipe>>;
            let smeltingCompiled: ReturnType<Compiler<RecipeProps, MinecraftRecipe>>;

            beforeEach(() => {
                blastingCompiled = VoxelToRecipeDataDriven(blastingVoxel.data, "recipe");
                smeltingCompiled = VoxelToRecipeDataDriven(smeltingVoxel.data, "recipe");
            });

            it("should compile blasting recipe", () => {
                expect(blastingCompiled.element.data.type).toBe("minecraft:blasting");
                expect(blastingCompiled.element.data.ingredient).toEqual({ item: "minecraft:iron_ore" });
                expect(blastingCompiled.element.data.experience).toBe(0.7);
                expect(blastingCompiled.element.data.cookingtime).toBe(100);
            });

            it("should compile smelting recipe", () => {
                expect(smeltingCompiled.element.data.type).toBe("minecraft:smelting");
                expect(smeltingCompiled.element.data.cookingtime).toBe(200);
            });
        });

        describe("Stonecutting Compilation", () => {
            let compiled: ReturnType<Compiler<RecipeProps, MinecraftRecipe>>;

            beforeEach(() => {
                compiled = VoxelToRecipeDataDriven(stonecuttingVoxel.data, "recipe");
            });

            it("should compile stonecutting with legacy count", () => {
                expect(compiled.element.data.type).toBe("minecraft:stonecutting");
                expect(compiled.element.data.ingredient).toEqual({ item: "minecraft:andesite" });
                expect(compiled.element.data.result).toBe("minecraft:andesite_slab");
                expect(compiled.element.data.count).toBe(2);
            });
        });

        describe("Smithing Compilation", () => {
            let compiled: ReturnType<Compiler<RecipeProps, MinecraftRecipe>>;

            beforeEach(() => {
                compiled = VoxelToRecipeDataDriven(transformVoxel.data, "recipe");
            });

            it("should compile smithing transform", () => {
                expect(compiled.element.data.type).toBe("minecraft:smithing_transform");
                expect(compiled.element.data.base).toEqual({ tag: "minecraft:trimmable_armor" });
                expect(compiled.element.data.addition).toEqual({ tag: "minecraft:trim_materials" });
                expect(compiled.element.data.template).toEqual({ item: "minecraft:wayfinder_armor_trim_smithing_template" });
            });
        });

        describe("Tags handling", () => {
            it("should return empty tags array", () => {
                const compiled = VoxelToRecipeDataDriven(shapelessVoxel.data, "recipe");
                expect(compiled.tags).toEqual([]);
            });
        });
    });

    describe("Round-trip conversion", () => {
        describe("Shapeless round-trip", () => {
            it("should maintain data integrity", () => {
                const original = shapeless;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.type).toBe(original.data.type);
                expect(compiled.element.data.group).toBe(original.data.group);
                expect(compiled.element.data.category).toBe(original.data.category);
                expect(compiled.element.data.ingredients).toEqual(original.data.ingredients);
                expect(compiled.element.data.result).toEqual(original.data.result);
            });
        });

        describe("Shaped round-trip", () => {
            it("should maintain data integrity", () => {
                const original = shaped;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.type).toBe(original.data.type);
                expect(compiled.element.data.pattern).toEqual(original.data.pattern);
                expect(compiled.element.data.key).toEqual(original.data.key);
                expect(compiled.element.data.result).toEqual(original.data.result);
            });
        });

        describe("Complex shaped round-trip", () => {
            it("should maintain data integrity with empty lines", () => {
                const original = ShapedWithEmptyLine;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.pattern).toEqual(original.data.pattern);
                expect(compiled.element.data.key).toEqual(original.data.key);
                expect(compiled.element.data.show_notification).toBe(original.data.show_notification);
                expect(compiled.element.data.result).toEqual(original.data.result);
            });

            it("should maintain data integrity with empty rows", () => {
                const original = ShapedWithEmptyRows;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.pattern).toEqual(original.data.pattern);
                expect(compiled.element.data.key).toEqual(original.data.key);
            });

            it("should maintain data integrity for 2x2 pattern", () => {
                const original = shapedTwoByTwo;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.pattern).toEqual(original.data.pattern);
                expect(compiled.element.data.key).toEqual(original.data.key);
            });

            it("should maintain data integrity with empty rows and columns", () => {
                const original = ShapedWithEmptyRowsAndColumns;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.pattern).toEqual(original.data.pattern);
                expect(compiled.element.data.key).toEqual(original.data.key);
            });
        });

        describe("Smelting round-trip", () => {
            it("should maintain blasting data integrity", () => {
                const original = blasting;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.type).toBe(original.data.type);
                expect(compiled.element.data.ingredient).toEqual(original.data.ingredient);
                expect(compiled.element.data.experience).toBe(original.data.experience);
                expect(compiled.element.data.cookingtime).toBe(original.data.cookingtime);
                expect(compiled.element.data.result).toEqual(original.data.result);
            });

            it("should maintain smelting data integrity", () => {
                const original = smelting;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.type).toBe(original.data.type);
                expect(compiled.element.data.ingredient).toEqual(original.data.ingredient);
                expect(compiled.element.data.experience).toBe(original.data.experience);
                expect(compiled.element.data.cookingtime).toBe(original.data.cookingtime);
            });

            it("should maintain smoking data integrity", () => {
                const original = smoking;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.type).toBe(original.data.type);
                expect(compiled.element.data.category).toBe(original.data.category);
                expect(compiled.element.data.experience).toBe(original.data.experience);
                expect(compiled.element.data.cookingtime).toBe(original.data.cookingtime);
            });

            it("should maintain campfire cooking data integrity", () => {
                const original = campfire_cooking;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.type).toBe(original.data.type);
                expect(compiled.element.data.experience).toBe(original.data.experience);
                expect(compiled.element.data.cookingtime).toBe(original.data.cookingtime);
            });
        });

        describe("Stonecutting round-trip", () => {
            it("should maintain data integrity", () => {
                const original = stonecutting;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.type).toBe(original.data.type);
                expect(compiled.element.data.ingredient).toEqual(original.data.ingredient);
                expect(compiled.element.data.result).toEqual(original.data.result);
            });
        });

        describe("Smithing round-trip", () => {
            it("should maintain smithing trim data integrity", () => {
                const original = smithing_transform; // This is actually smithing_trim in the data
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.type).toBe(original.data.type);
                expect(compiled.element.data.base).toEqual(original.data.base);
                expect(compiled.element.data.addition).toEqual(original.data.addition);
                expect(compiled.element.data.template).toEqual(original.data.template);
                expect(compiled.element.data.pattern).toBe(original.data.pattern);
            });

            it("should maintain smithing transform data integrity", () => {
                const original = transform;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.type).toBe(original.data.type);
                expect(compiled.element.data.base).toEqual(original.data.base);
                expect(compiled.element.data.addition).toEqual(original.data.addition);
                expect(compiled.element.data.template).toEqual(original.data.template);
                expect(compiled.element.data.result).toEqual(original.data.result);
            });
        });

        describe("Transmute round-trip", () => {
            it("should maintain data integrity", () => {
                const original = transmute;
                const voxel = RecipeDataDrivenToVoxelFormat({ element: original });
                const compiled = VoxelToRecipeDataDriven(voxel, "recipe", original.data);

                expect(compiled.element.data.type).toBe(original.data.type);
                expect(compiled.element.data.category).toBe(original.data.category);
                expect(compiled.element.data.input).toEqual(original.data.input);
                expect(compiled.element.data.material).toEqual(original.data.material);
                expect(compiled.element.data.result).toEqual(original.data.result);
            });
        });
    });

    describe("Edge cases and error handling", () => {
        it("should handle missing optional fields", () => {
            const minimalRecipe = {
                identifier: { namespace: "test", registry: "recipe", resource: "minimal" },
                data: {
                    type: "minecraft:crafting_shapeless",
                    ingredients: ["minecraft:dirt"],
                    result: "minecraft:stone"
                }
            };

            const voxel = RecipeDataDrivenToVoxelFormat({ element: minimalRecipe });
            expect(voxel).toBeDefined();
            expect(voxel.group).toBeUndefined();
            expect(voxel.category).toBeUndefined();
        });

        it("should handle unknown recipe types", () => {
            const unknownRecipe = {
                identifier: { namespace: "test", registry: "recipe", resource: "unknown" },
                data: {
                    type: "modname:custom_recipe",
                    custom_field: "value",
                    ingredients: ["minecraft:dirt"],
                    result: "minecraft:stone"
                }
            };

            const voxel = RecipeDataDrivenToVoxelFormat({ element: unknownRecipe });
            expect(voxel).toBeDefined();
            expect(voxel.type).toBe("modname:custom_recipe");
            expect(voxel.unknownFields?.custom_field).toBe("value");
        });

        it("should preserve unknown fields in round-trip", () => {
            const modRecipe = {
                identifier: { namespace: "test", registry: "recipe", resource: "mod_recipe" },
                data: {
                    type: "minecraft:crafting_shapeless",
                    ingredients: ["minecraft:dirt"],
                    result: "minecraft:stone",
                    mod_field: "preserved",
                    mod_complex: { nested: true, value: 42 }
                }
            };

            const voxel = RecipeDataDrivenToVoxelFormat({ element: modRecipe });
            const compiled = VoxelToRecipeDataDriven(voxel, "recipe", modRecipe.data);

            expect(compiled.element.data.mod_field).toBe("preserved");
            expect(compiled.element.data.mod_complex).toEqual({ nested: true, value: 42 });
        });
    });
});
