import type { EnchantmentProps } from "@/core/schema/enchant/types";
import type { Enchantment } from "@/schema/enchantment/Enchantment";
import type { TagType } from "@/schema/tag/TagType";

export const attack_speed_element: EnchantmentProps[] = [
    {
        exclusiveSet: undefined,
        primaryItems: undefined,
        identifier: {
            namespace: "enchantplus",
            registry: "enchantment",
            resource: "sword/attack_speed"
        },
        description: {
            translate: "enchantment.enchantplus.attack_speed",
            fallback: "Attack Speed"
        },
        supportedItems: "#minecraft:enchantable/sword",
        maxLevel: 2,
        weight: 4,
        anvilCost: 2,
        minCostBase: 8,
        minCostPerLevelAboveFirst: 11,
        maxCostBase: 21,
        maxCostPerLevelAboveFirst: 9,
        effects: {},
        tags: ["#minecraft:non_treasure", "#yggdrasil:equipment/item/sword", "#yggdrasil:structure/alfheim_tree/random_loot"],
        slots: ["mainhand"],
        mode: "normal",
        disabledEffects: []
    }
];

const tags: TagType = {
    values: [
        "enchantplus:sword/attack_speed",
        "enchantplus:sword/reach",
        "enchantplus:sword/runic_despair",
        "enchantplus:sword/dimensional_hit"
    ],
    replace: false
};

const tags2: TagType = {
    values: ["minecraft:fire_aspect"],
    replace: false
};

const enchantment: Enchantment = {
    anvil_cost: 2,

    description: {
        translate: "enchantment.enchantplus.attack_speed",
        fallback: "Attack Speed"
    },
    effects: {
        "minecraft:attributes": [
            {
                id: "minecraft:enchantment.attack_speed",
                attribute: "minecraft:attack_speed",
                amount: {
                    type: "minecraft:linear",
                    base: 0.15,
                    per_level_above_first: 0.15
                },
                operation: "add_multiplied_base"
            }
        ]
    } as any,
    max_cost: {
        base: 21,
        per_level_above_first: 9
    },
    max_level: 2,
    min_cost: {
        base: 8,
        per_level_above_first: 11
    },
    slots: ["mainhand"],
    exclusive_set: "#enchantplus:exclusive_set/sword_attribute",
    supported_items: "#minecraft:enchantable/sword",
    weight: 4
};

export const test_attack_speed_files = {
    "pack.mcmeta": new TextEncoder().encode(JSON.stringify({ pack: { pack_format: 61, description: "lorem ipsum" } }, null, 2)),
    "data/enchantplus/enchantment/sword/attack_speed.json": new TextEncoder().encode(JSON.stringify(enchantment, null, 2)),
    "data/enchantplus/tags/enchantment/exclusive_set/sword_attribute.json": new TextEncoder().encode(JSON.stringify(tags, null, 2)),
    "data/minecraft/tags/enchantment/non_treasure.json": new TextEncoder().encode(JSON.stringify(tags2, null, 2)),
    "data/yggdrasil/tags/enchantment/equipment/item/sword.json": new TextEncoder().encode(JSON.stringify(tags2, null, 2))
};
