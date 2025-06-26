import type { DataDrivenRegistryElement } from "@/core/Element";
import type { MinecraftRecipe } from "@/core/schema/recipe/types";

export const shapeless: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shapeless" },
    data: {
        type: "minecraft:crafting_shapeless",
        category: "building",
        group: "planks",
        ingredients: ["#minecraft:acacia_logs"],
        result: {
            count: 4,
            id: "minecraft:acacia_planks"
        }
    }
};

export const shaped: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shaped" },
    data: {
        type: "minecraft:crafting_shaped",
        category: "building",
        group: "wooden_slab",
        key: {
            "#": "minecraft:acacia_planks"
        },
        pattern: ["###"],
        result: {
            count: 6,
            id: "minecraft:acacia_slab"
        }
    }
};

export const shaped2: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shaped2" },
    data: {
        type: "crafting_shaped",
        category: "equipment",
        key: {
            "#": "minecraft:iron_ingot",
            "X": "redstone"
        },
        pattern: [
            " # ",
            "#X#",
            " # "
        ],
        result: {
            count: 1,
            id: "minecraft:compass"
        }
    }
};

export const ShapedWithEmptyLine: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shaped_empty_line" },
    data: {
        type: "minecraft:crafting_shaped",
        category: "building",
        pattern: ["XXX", "   ", "XXX"],
        key: {
            X: ["minecraft:chicken"]
        },
        result: {
            id: "minecraft:acacia_button",
            components: {
                "minecraft:damage": 10,
                "!minecraft:block_entity_data": {}
            },
            count: 1
        },
        show_notification: true
    }
};

export const ShapedWithEmptyRows: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shaped_empty_rows" },
    data: {
        type: "minecraft:crafting_shaped",
        category: "building",
        pattern: ["XXX", "XXX", "   "],
        key: {
            X: ["minecraft:chicken"]
        },
        result: {
            id: "minecraft:acacia_button",
            components: {
                "minecraft:damage": 10,
                "!minecraft:block_entity_data": {}
            },
            count: 1
        },
        show_notification: true
    }
};

export const shapedTwoByTwo: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shaped_two_by_two" },
    data: {
        type: "minecraft:crafting_shaped",
        category: "building",
        pattern: ["XX", "XX"],
        key: {
            X: ["minecraft:chicken"]
        },
        result: {
            id: "minecraft:acacia_button",
            components: {
                "minecraft:damage": 10,
                "!minecraft:block_entity_data": {}
            },
            count: 1
        },
        show_notification: true
    }
};

export const ShapedWithEmptyRowsAndColumns: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shaped_empty_rows_columns" },
    data: {
        type: "minecraft:crafting_shaped",
        category: "building",
        pattern: ["XX ", "XX ", "XX "],
        key: {
            X: ["minecraft:chicken"]
        },
        result: {
            id: "minecraft:acacia_button",
            components: {
                "minecraft:damage": 10,
                "!minecraft:block_entity_data": {}
            },
            count: 1
        },
        show_notification: true
    }
};

export const stonecutting: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "stonecutting" },
    data: {
        type: "minecraft:stonecutting",
        ingredient: "minecraft:andesite",
        result: {
            count: 2,
            id: "minecraft:andesite_slab"
        }
    }
};

export const blasting: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "blasting" },
    data: {
        type: "minecraft:blasting",
        category: "misc",
        cookingtime: 100,
        experience: 0.7,
        group: "iron_ingot",
        ingredient: "minecraft:iron_ore",
        result: {
            id: "minecraft:iron_ingot"
        }
    }
};

export const smelting: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "smelting" },
    data: {
        type: "minecraft:smelting",
        category: "misc",
        cookingtime: 200,
        experience: 0.7,
        group: "iron_ingot",
        ingredient: "minecraft:deepslate_iron_ore",
        result: {
            id: "minecraft:iron_ingot"
        }
    }
};

export const smoking: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "smoking" },
    data: {
        type: "minecraft:smoking",
        category: "food",
        cookingtime: 100,
        experience: 0.35,
        ingredient: "minecraft:potato",
        result: {
            id: "minecraft:baked_potato"
        }
    }
};

export const campfire_cooking: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "campfire_cooking" },
    data: {
        type: "minecraft:campfire_cooking",
        category: "food",
        cookingtime: 600,
        experience: 0.35,
        ingredient: "minecraft:potato",
        result: {
            id: "minecraft:baked_potato"
        }
    }
};

export const smithing_transform: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "smithing_trim" },
    data: {
        type: "minecraft:smithing_trim",
        addition: "#minecraft:trim_materials",
        base: "#minecraft:trimmable_armor",
        pattern: "minecraft:bolt",
        template: "minecraft:bolt_armor_trim_smithing_template"
    }
};

export const transmute: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "transmute" },
    data: {
        type: "minecraft:crafting_transmute",
        category: "misc",
        input: "#minecraft:acacia_logs",
        material: ["minecraft:acacia_door", "minecraft:acacia_fence_gate"],
        result: "minecraft:acacia_boat"
    }
};

export const transform: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "transform" },
    data: {
        type: "minecraft:smithing_transform",
        addition: "#minecraft:trim_materials",
        base: "#minecraft:trimmable_armor",
        template: "minecraft:wayfinder_armor_trim_smithing_template",
        result: {
            id: "minecraft:acacia_button",
            count: 1
        }
    }
};

export const shapedWithoutNamespace: DataDrivenRegistryElement<MinecraftRecipe> = {
    identifier: { namespace: "test", registry: "recipe", resource: "shaped_no_namespace" },
    data: {
        type: "crafting_shaped",
        category: "equipment",
        key: {
            "#": "iron_ingot",
            "X": "redstone"
        },
        pattern: [
            " # ",
            "#X#",
            " # "
        ],
        result: "compass"
    }
};

export const recipeDataDriven = [
    shapeless,
    shaped,
    shaped2,
    ShapedWithEmptyLine,
    ShapedWithEmptyRows,
    shapedTwoByTwo,
    stonecutting,
    blasting,
    campfire_cooking,
    shapedWithoutNamespace
];
