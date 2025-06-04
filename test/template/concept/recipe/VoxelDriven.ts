import type { DataDrivenRegistryElement } from "@/core/Element";
import type { RecipeProps } from "@/core/schema/recipe/types";

// Helper function to create mock recipe elements
export function createMockRecipe(overrides: Partial<RecipeProps> = {}): RecipeProps {
    return {
        identifier: { namespace: "test", registry: "recipe", resource: "test_recipe" },
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
        },
        ...overrides
    };
}

export function createShapelessRecipe(overrides: Partial<RecipeProps> = {}): RecipeProps {
    return {
        identifier: { namespace: "test", registry: "recipe", resource: "shapeless_recipe" },
        type: "minecraft:crafting_shapeless",
        slots: {
            "0": ["#minecraft:acacia_logs"]
        },
        result: {
            item: "minecraft:acacia_planks",
            count: 4
        },
        group: "planks",
        category: "building",
        ...overrides
    };
}

export function createSmeltingRecipe(overrides: Partial<RecipeProps> = {}): RecipeProps {
    return {
        identifier: { namespace: "test", registry: "recipe", resource: "smelting_recipe" },
        type: "minecraft:smelting",
        slots: {
            "0": ["minecraft:iron_ore"]
        },
        result: {
            item: "minecraft:iron_ingot",
            count: 1
        },
        typeSpecific: {
            experience: 0.7,
            cookingTime: 200
        },
        group: "iron_ingot",
        category: "misc",
        ...overrides
    };
}

export const shapelessVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shapeless" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "shapeless" },
        type: "minecraft:crafting_shapeless",
        group: "planks",
        category: "building",
        slots: {
            "0": ["#minecraft:acacia_logs"]
        },
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
        slots: {
            "0": ["minecraft:acacia_planks"],
            "1": ["minecraft:acacia_planks"],
            "2": ["minecraft:acacia_planks"]
        },
        gridSize: { width: 3, height: 1 },
        result: {
            item: "minecraft:acacia_slab",
            count: 6
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
        slots: {
            "0": ["minecraft:chicken"],
            "1": ["minecraft:chicken"],
            "2": ["minecraft:chicken"],
            "6": ["minecraft:chicken"],
            "7": ["minecraft:chicken"],
            "8": ["minecraft:chicken"]
        },
        gridSize: { width: 3, height: 3 },
        result: {
            item: "minecraft:acacia_button",
            count: 1,
            components: {
                "minecraft:damage": 10,
                "!minecraft:block_entity_data": {}
            }
        }
    }
};

export const stonecuttingVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "stonecutting" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "stonecutting" },
        type: "minecraft:stonecutting",
        slots: {
            "0": ["minecraft:andesite"]
        },
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
        slots: {
            "0": ["minecraft:iron_ore"]
        },
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
        slots: {
            "0": ["minecraft:deepslate_iron_ore"]
        },
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
        slots: {
            "0": ["minecraft:potato"]
        },
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
        slots: {
            "0": ["minecraft:potato"]
        },
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
        slots: {
            "0": ["minecraft:bolt_armor_trim_smithing_template"], // template
            "1": ["#minecraft:trimmable_armor"], // base
            "2": ["#minecraft:trim_materials"] // addition
        },
        result: {
            item: "minecraft:air" // Smithing trim doesn't produce a result item
        },
        typeSpecific: {
            templateSlot: "0",
            baseSlot: "1",
            additionSlot: "2",
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
        slots: {
            "0": ["#minecraft:acacia_logs"], // input
            "1": ["minecraft:acacia_door", "minecraft:acacia_fence_gate"] // material
        },
        result: {
            item: "minecraft:acacia_boat"
        },
        typeSpecific: {
            inputSlot: "0",
            materialSlot: "1"
        }
    }
};

export const transformVoxel: DataDrivenRegistryElement<RecipeProps> = {
    identifier: { namespace: "test", registry: "recipe", resource: "transform" },
    data: {
        identifier: { namespace: "test", registry: "recipe", resource: "transform" },
        type: "minecraft:smithing_transform",
        slots: {
            "0": ["minecraft:wayfinder_armor_trim_smithing_template"], // template
            "1": ["#minecraft:trimmable_armor"], // base
            "2": ["#minecraft:trim_materials"] // addition
        },
        result: {
            item: "minecraft:acacia_button",
            count: 1
        },
        typeSpecific: {
            templateSlot: "0",
            baseSlot: "1",
            additionSlot: "2"
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
