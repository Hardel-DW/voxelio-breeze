import { bench, describe } from "vitest";
import { VoxelToRecipeDataDriven } from "@/core/schema/recipe/Compiler";
import { RecipeDataDrivenToVoxelFormat } from "@/core/schema/recipe/Parser";
import type { MinecraftRecipe } from "@/core/schema/recipe/types";
import type { DataDrivenRegistryElement } from "@/core/Element";
import {
    shapeless,
    shaped,
    ShapedWithEmptyLine,
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

describe("Recipe Performance", () => {
    const simpleShapeless = shapeless;
    const complexShaped = ShapedWithEmptyLine;
    const smeltingRecipe = smelting;
    const smithingRecipe = transform;

    const simpleVoxel = shapelessVoxel.data;
    const complexVoxel = shapedVoxel.data;
    const smeltingVoxelData = smeltingVoxel.data;
    const smithingVoxel = transformVoxel.data;

    const largeShapedRecipe: DataDrivenRegistryElement<MinecraftRecipe> = {
        identifier: { namespace: "test", registry: "recipe", resource: "large_shaped" },
        data: {
            type: "minecraft:crafting_shaped",
            group: "large_test",
            category: "building",
            pattern: ["ABC", "DEF", "GHI"],
            key: Object.fromEntries("ABCDEFGHI".split("").map((char, i) => [char, { item: `minecraft:test_item_${i}` }])),
            result: {
                item: "minecraft:large_result",
                count: 64
            }
        }
    };

    const complexShapelessRecipe: DataDrivenRegistryElement<MinecraftRecipe> = {
        identifier: { namespace: "test", registry: "recipe", resource: "complex_shapeless" },
        data: {
            type: "minecraft:crafting_shapeless",
            group: "complex_test",
            category: "misc",
            ingredients: Array.from({ length: 9 }, (_, i) => ({
                tag: `minecraft:test_tag_${i}`
            })),
            result: {
                item: "minecraft:complex_result",
                count: 1,
                components: {
                    "minecraft:custom_data": {
                        test: true,
                        value: 42,
                        array: Array.from({ length: 10 }, (_, i) => i)
                    },
                    "minecraft:enchantments": {
                        levels: {
                            "minecraft:sharpness": 5,
                            "minecraft:unbreaking": 3,
                            "minecraft:mending": 1
                        }
                    }
                }
            }
        }
    };

    const batchSmeltingRecipes = Array.from({ length: 50 }, (_, i) => ({
        identifier: { namespace: "test", registry: "recipe", resource: `smelting_${i}` },
        data: {
            type: "minecraft:smelting",
            group: `group_${i % 5}`,
            category: "misc",
            ingredient: `minecraft:raw_material_${i}`,
            result: `minecraft:processed_material_${i}`,
            experience: 0.1 + i * 0.01,
            cookingtime: 200 + i * 10
        }
    }));

    const modRecipe: DataDrivenRegistryElement<MinecraftRecipe> = {
        identifier: { namespace: "test", registry: "recipe", resource: "mod_recipe" },
        data: {
            type: "modname:custom_recipe_type",
            group: "mod_group",
            category: "mod_category",
            ingredients: Array.from({ length: 5 }, (_, i) => `mod:ingredient_${i}`),
            result: {
                item: "mod:result_item",
                count: 3,
                components: {
                    "mod:custom_component": {
                        power: 100,
                        rarity: "legendary",
                        effects: Array.from({ length: 20 }, (_, i) => `effect_${i}`)
                    }
                }
            },
            mod_field_1: "custom_value",
            mod_field_2: { complex: true, nested: { data: Array.from({ length: 100 }, (_, i) => i) } },
            mod_field_3: Array.from({ length: 50 }, (_, i) => ({ id: i, name: `item_${i}` })),
            mod_processing_time: 5000,
            mod_energy_cost: 1000,
            mod_requirements: {
                level: 50,
                tools: ["mod:special_tool", "mod:rare_catalyst"],
                conditions: Array.from({ length: 10 }, (_, i) => `condition_${i}`)
            }
        }
    };

    describe("Parsing Performance", () => {
        bench("Parse simple shapeless recipe", () => {
            RecipeDataDrivenToVoxelFormat({ element: simpleShapeless });
        });

        bench("Parse complex shaped recipe", () => {
            RecipeDataDrivenToVoxelFormat({ element: complexShaped });
        });

        bench("Parse smelting recipe", () => {
            RecipeDataDrivenToVoxelFormat({ element: smeltingRecipe });
        });

        bench("Parse smithing recipe", () => {
            RecipeDataDrivenToVoxelFormat({ element: smithingRecipe });
        });

        bench("Parse large shaped recipe (3x3 grid)", () => {
            RecipeDataDrivenToVoxelFormat({ element: largeShapedRecipe });
        });

        bench("Parse complex shapeless recipe (9 ingredients)", () => {
            RecipeDataDrivenToVoxelFormat({ element: complexShapelessRecipe });
        });

        bench("Parse mod recipe with custom fields", () => {
            RecipeDataDrivenToVoxelFormat({ element: modRecipe });
        });
    });

    describe("Compilation Performance", () => {
        bench("Compile simple shapeless recipe", () => {
            VoxelToRecipeDataDriven(simpleVoxel, "recipe");
        });

        bench("Compile complex shaped recipe", () => {
            VoxelToRecipeDataDriven(complexVoxel, "recipe");
        });

        bench("Compile smelting recipe", () => {
            VoxelToRecipeDataDriven(smeltingVoxelData, "recipe");
        });

        bench("Compile smithing recipe", () => {
            VoxelToRecipeDataDriven(smithingVoxel, "recipe");
        });

        bench("Compile large shaped recipe", () => {
            const largeVoxel = RecipeDataDrivenToVoxelFormat({ element: largeShapedRecipe });
            VoxelToRecipeDataDriven(largeVoxel, "recipe", largeShapedRecipe.data);
        });

        bench("Compile complex shapeless recipe", () => {
            const complexVoxel = RecipeDataDrivenToVoxelFormat({ element: complexShapelessRecipe });
            VoxelToRecipeDataDriven(complexVoxel, "recipe", complexShapelessRecipe.data);
        });

        bench("Compile mod recipe with custom fields", () => {
            const modVoxel = RecipeDataDrivenToVoxelFormat({ element: modRecipe });
            VoxelToRecipeDataDriven(modVoxel, "recipe", modRecipe.data);
        });
    });

    describe("Round-trip Performance", () => {
        bench("Round-trip simple shapeless recipe", () => {
            const voxel = RecipeDataDrivenToVoxelFormat({ element: simpleShapeless });
            VoxelToRecipeDataDriven(voxel, "recipe", simpleShapeless.data);
        });

        bench("Round-trip complex shaped recipe", () => {
            const voxel = RecipeDataDrivenToVoxelFormat({ element: complexShaped });
            VoxelToRecipeDataDriven(voxel, "recipe", complexShaped.data);
        });

        bench("Round-trip smelting recipe", () => {
            const voxel = RecipeDataDrivenToVoxelFormat({ element: smeltingRecipe });
            VoxelToRecipeDataDriven(voxel, "recipe", smeltingRecipe.data);
        });

        bench("Round-trip large shaped recipe", () => {
            const voxel = RecipeDataDrivenToVoxelFormat({ element: largeShapedRecipe });
            VoxelToRecipeDataDriven(voxel, "recipe", largeShapedRecipe.data);
        });

        bench("Round-trip mod recipe", () => {
            const voxel = RecipeDataDrivenToVoxelFormat({ element: modRecipe });
            VoxelToRecipeDataDriven(voxel, "recipe", modRecipe.data);
        });
    });

    describe("Batch Processing Performance", () => {
        bench("Parse 100 simple recipes", () => {
            for (let i = 0; i < 100; i++) {
                RecipeDataDrivenToVoxelFormat({ element: simpleShapeless });
            }
        });

        bench("Parse 50 complex shaped recipes", () => {
            for (let i = 0; i < 50; i++) {
                RecipeDataDrivenToVoxelFormat({ element: complexShaped });
            }
        });

        bench("Parse 50 smelting recipes", () => {
            for (const recipe of batchSmeltingRecipes) {
                RecipeDataDrivenToVoxelFormat({ element: recipe });
            }
        });

        bench("Round-trip 25 mixed recipes", () => {
            const recipes = [simpleShapeless, complexShaped, smeltingRecipe, smithingRecipe, stonecutting];
            for (let i = 0; i < 25; i++) {
                const recipe = recipes[i % recipes.length];
                const voxel = RecipeDataDrivenToVoxelFormat({ element: recipe });
                VoxelToRecipeDataDriven(voxel, "recipe", recipe.data);
            }
        });
    });

    describe("Recipe Type Specific Performance", () => {
        bench("Parse all crafting types", () => {
            RecipeDataDrivenToVoxelFormat({ element: shapeless });
            RecipeDataDrivenToVoxelFormat({ element: shaped });
            RecipeDataDrivenToVoxelFormat({ element: transmute });
        });

        bench("Parse all smelting types", () => {
            RecipeDataDrivenToVoxelFormat({ element: smelting });
            RecipeDataDrivenToVoxelFormat({ element: blasting });
            RecipeDataDrivenToVoxelFormat({ element: smoking });
            RecipeDataDrivenToVoxelFormat({ element: campfire_cooking });
        });

        bench("Parse all smithing types", () => {
            RecipeDataDrivenToVoxelFormat({ element: smithing_transform });
            RecipeDataDrivenToVoxelFormat({ element: transform });
        });

        bench("Parse stonecutting", () => {
            RecipeDataDrivenToVoxelFormat({ element: stonecutting });
        });
    });

    describe("Memory Usage Simulation", () => {
        bench("Create and parse 200 recipe variations", () => {
            const baseRecipes = [shapeless, shaped, smelting, stonecutting, transform];

            for (let i = 0; i < 200; i++) {
                const baseRecipe = baseRecipes[i % baseRecipes.length];
                const variation = {
                    ...baseRecipe,
                    identifier: {
                        ...baseRecipe.identifier,
                        resource: `${baseRecipe.identifier.resource}_${i}`
                    }
                };
                RecipeDataDrivenToVoxelFormat({ element: variation });
            }
        });

        bench("Stress test: 1000 simple recipe operations", () => {
            for (let i = 0; i < 1000; i++) {
                const voxel = RecipeDataDrivenToVoxelFormat({ element: simpleShapeless });
                if (i % 2 === 0) {
                    VoxelToRecipeDataDriven(voxel, "recipe", simpleShapeless.data);
                }
            }
        });
    });

    describe("Edge Cases Performance", () => {
        const emptyRecipe: DataDrivenRegistryElement<MinecraftRecipe> = {
            identifier: { namespace: "test", registry: "recipe", resource: "empty" },
            data: {
                type: "minecraft:crafting_shapeless",
                ingredients: [],
                result: "minecraft:air"
            }
        };

        const minimalRecipe: DataDrivenRegistryElement<MinecraftRecipe> = {
            identifier: { namespace: "test", registry: "recipe", resource: "minimal" },
            data: {
                type: "minecraft:smelting",
                ingredient: "minecraft:dirt",
                result: "minecraft:stone"
            }
        };

        bench("Parse empty recipe", () => {
            RecipeDataDrivenToVoxelFormat({ element: emptyRecipe });
        });

        bench("Parse minimal recipe", () => {
            RecipeDataDrivenToVoxelFormat({ element: minimalRecipe });
        });

        bench("Parse recipe with null/undefined fields", () => {
            const nullRecipe = {
                identifier: { namespace: "test", registry: "recipe", resource: "null_test" },
                data: {
                    type: "minecraft:crafting_shapeless",
                    group: undefined,
                    category: undefined,
                    ingredients: ["minecraft:dirt"],
                    result: "minecraft:stone",
                    show_notification: undefined
                }
            };
            RecipeDataDrivenToVoxelFormat({ element: nullRecipe });
        });
    });
});
