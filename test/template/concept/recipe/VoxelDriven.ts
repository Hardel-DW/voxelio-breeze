import type { DataDrivenRegistryElement } from "@/core/Element";
import type { RecipeProps } from "@/core/schema/recipe/types";

export const shapelessVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shapeless" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "shapeless" },
        type: "minecraft:crafting_shapeless",
        group: "planks",
        category: "building",
        ingredients: [
            {
                id: "ingredient_0",
                items: ["#minecraft:acacia_logs"]
            }
        ],
        result: {
            item: "minecraft:acacia_planks",
            count: 4
        }
    }
};

export const shapedVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shaped" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "shaped" },
        type: "minecraft:crafting_shaped",
        group: "wooden_slab",
        category: "building",
        ingredients: [
            {
                id: "ingredient_0",
                slot: "#",
                items: ["minecraft:acacia_planks"]
            }
        ],
        result: {
            item: "minecraft:acacia_slab",
            count: 6
        },
        typeSpecific: {
            pattern: ["###"],
            width: 3,
            height: 1
        }
    }
};

export const shapedWithEmptyLineVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shaped_empty_line" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "shaped_empty_line" },
        type: "minecraft:crafting_shaped",
        category: "building",
        showNotification: true,
        ingredients: [
            {
                id: "ingredient_0",
                slot: "X",
                items: ["minecraft:chicken"]
            }
        ],
        result: {
            item: "minecraft:acacia_button",
            count: 1,
            components: {
                "minecraft:damage": 10,
                "!minecraft:block_entity_data": {}
            }
        },
        typeSpecific: {
            pattern: ["XXX", "   ", "XXX"],
            width: 3,
            height: 3
        }
    }
};

export const stonecuttingVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "stonecutting" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "stonecutting" },
        type: "minecraft:stonecutting",
        ingredients: [
            {
                id: "ingredient_0",
                items: ["minecraft:andesite"]
            }
        ],
        result: {
            item: "minecraft:andesite_slab",
            count: 2
        }
    }
};

export const blastingVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "blasting" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "blasting" },
        type: "minecraft:blasting",
        group: "iron_ingot",
        category: "misc",
        ingredients: [
            {
                id: "ingredient_0",
                items: ["minecraft:iron_ore"]
            }
        ],
        result: {
            item: "minecraft:iron_ingot"
        },
        typeSpecific: {
            experience: 0.7,
            cookingTime: 100
        }
    }
};

export const smeltingVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "smelting" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "smelting" },
        type: "minecraft:smelting",
        group: "iron_ingot",
        category: "misc",
        ingredients: [
            {
                id: "ingredient_0",
                items: ["minecraft:deepslate_iron_ore"]
            }
        ],
        result: {
            item: "minecraft:iron_ingot"
        },
        typeSpecific: {
            experience: 0.7,
            cookingTime: 200
        }
    }
};

export const smokingVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "smoking" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "smoking" },
        type: "minecraft:smoking",
        category: "food",
        ingredients: [
            {
                id: "ingredient_0",
                items: ["minecraft:potato"]
            }
        ],
        result: {
            item: "minecraft:baked_potato"
        },
        typeSpecific: {
            experience: 0.35,
            cookingTime: 100
        }
    }
};

export const campfireCookingVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "campfire_cooking" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "campfire_cooking" },
        type: "minecraft:campfire_cooking",
        category: "food",
        ingredients: [
            {
                id: "ingredient_0",
                items: ["minecraft:potato"]
            }
        ],
        result: {
            item: "minecraft:baked_potato"
        },
        typeSpecific: {
            experience: 0.35,
            cookingTime: 600
        }
    }
};

export const smithingTrimVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "smithing_trim" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "smithing_trim" },
        type: "minecraft:smithing_trim",
        ingredients: [
            {
                id: "ingredient_0",
                items: ["#minecraft:trimmable_armor"]
            },
            {
                id: "ingredient_1",
                items: ["#minecraft:trim_materials"]
            },
            {
                id: "ingredient_2",
                items: ["minecraft:bolt_armor_trim_smithing_template"]
            }
        ],
        result: {
            item: "minecraft:air" // Smithing trim doesn't produce a result item
        },
        typeSpecific: {
            baseSlot: "ingredient_0",
            additionSlot: "ingredient_1",
            templateSlot: "ingredient_2",
            pattern: "minecraft:bolt"
        }
    }
};

export const transmuteVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "transmute" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "transmute" },
        type: "minecraft:crafting_transmute",
        category: "misc",
        ingredients: [
            {
                id: "ingredient_0",
                items: ["#minecraft:acacia_logs"]
            },
            {
                id: "ingredient_1",
                items: ["minecraft:acacia_door", "minecraft:acacia_fence_gate"]
            }
        ],
        result: {
            item: "minecraft:acacia_boat"
        },
        typeSpecific: {
            inputSlot: "ingredient_0",
            materialSlot: "ingredient_1"
        }
    }
};

export const transformVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "transform" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "transform" },
        type: "minecraft:smithing_transform",
        ingredients: [
            {
                id: "ingredient_0",
                items: ["#minecraft:trimmable_armor"]
            },
            {
                id: "ingredient_1",
                items: ["#minecraft:trim_materials"]
            },
            {
                id: "ingredient_2",
                items: ["minecraft:wayfinder_armor_trim_smithing_template"]
            }
        ],
        result: {
            item: "minecraft:acacia_button",
            count: 1
        },
        typeSpecific: {
            baseSlot: "ingredient_0",
            additionSlot: "ingredient_1",
            templateSlot: "ingredient_2"
        }
    }
};

export const VOXEL_TEMPLATE_RECIPE = [
    shapelessVoxel,
    shapedVoxel,
    shapedWithEmptyLineVoxel,
    stonecuttingVoxel,
    blastingVoxel,
    smeltingVoxel,
    smokingVoxel,
    campfireCookingVoxel,
    smithingTrimVoxel,
    transmuteVoxel,
    transformVoxel
];
