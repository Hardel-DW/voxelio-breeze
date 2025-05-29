import type { DataDrivenRegistryElement } from "@/core/Element";
import type { EnchantmentProps } from "@/core/schema/EnchantmentProps";
import type { Enchantment, SlotRegistryType } from "@/schema/enchantment/Enchantment";
import type { MinecraftLootTable } from "@/core/schema/loot/types";

const baseEnchantment = {
    weight: 2,
    anvil_cost: 4,
    max_level: 1,
    min_cost: {
        base: 20,
        per_level_above_first: 9
    },
    max_cost: {
        base: 65,
        per_level_above_first: 9
    }
};

const advancedBaseEnchantment = {
    ...baseEnchantment,
    effects: {},
    description: {
        translate: "enchantment.enchantplus.accuracy_shot",
        fallback: "Accuracy Shot"
    },
    slots: ["mainhand", "offhand"] as SlotRegistryType[],
    supported_items: "#voxel:enchantable/range"
};

export const DATA_DRIVEN_TEMPLATE_ENCHANTMENT: DataDrivenRegistryElement<Enchantment>[] = [
    {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "bow/accuracy_shot" },
        data: {
            ...baseEnchantment,
            description: {
                translate: "enchantment.enchantplus.accuracy_shot",
                fallback: "Accuracy Shot"
            },
            supported_items: "#voxel:enchantable/range",
            slots: ["mainhand", "offhand"],
            effects: {
                "minecraft:projectile_spawned": [
                    {
                        effect: {
                            type: "minecraft:run_function",
                            function: "enchantplus:actions/accuracy_shot/on_shoot"
                        }
                    }
                ]
            }
        }
    },
    {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "boots/agility" },
        data: {
            ...baseEnchantment,
            description: {
                translate: "enchantment.enchantplus.agility",
                fallback: "Agility"
            },
            slots: ["feet"],
            supported_items: "#minecraft:enchantable/foot_armor",
            effects: {
                "minecraft:attributes": [
                    {
                        id: "minecraft:enchantment.agility",
                        attribute: "minecraft:movement_speed",
                        amount: {
                            type: "minecraft:linear",
                            base: 0.2,
                            per_level_above_first: 0.2
                        },
                        operation: "add_multiplied_total"
                    }
                ]
            } as any
        }
    },
    {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "elytra/armored" },
        data: {
            ...baseEnchantment,
            description: {
                translate: "enchantment.enchantplus.armored",
                fallback: "Armored"
            },
            effects: {
                "minecraft:damage_protection": [
                    {
                        effect: {
                            type: "minecraft:add",
                            value: 9
                        },
                        requirements: {
                            condition: "minecraft:damage_source_properties",
                            predicate: {
                                tags: [
                                    {
                                        expected: false,
                                        id: "minecraft:bypasses_invulnerability"
                                    }
                                ]
                            }
                        }
                    }
                ]
            } as any,
            slots: ["chest"],
            supported_items: "#voxel:enchantable/elytra",
            weight: 1
        }
    },
    {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "sword/attack_speed" },
        data: {
            ...baseEnchantment,
            description: {
                translate: "enchantment.enchantplus.harvest",
                fallback: "Harvest"
            },
            supported_items: "#voxel:enchantable/hoes",
            slots: ["mainhand"],
            effects: {} as any
        }
    },
    {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "sword/death_touch" },
        data: {
            ...baseEnchantment,
            description: {
                translate: "enchantment.enchantplus.death_touch",
                fallback: "Death Touch"
            },
            exclusive_set: "#enchantplus:exclusive_set/sword_effect",
            supported_items: "#minecraft:enchantable/weapon",
            primary_items: "#minecraft:enchantable/sword",
            slots: ["mainhand"],
            effects: {
                "minecraft:post_attack": [
                    {
                        enchanted: "attacker",
                        affected: "victim",
                        effect: {
                            type: "minecraft:run_function",
                            function: "enchantplus:actions/death_touch"
                        },
                        requirements: {
                            condition: "minecraft:random_chance",
                            chance: 0.5
                        }
                    }
                ]
            } as any
        }
    },
    {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "sword/poison_aspect" },
        data: {
            ...baseEnchantment,
            description: {
                translate: "enchantment.enchantplus.poison_aspect",
                fallback: "Poison Aspect"
            },
            effects: {
                "minecraft:post_attack": [
                    {
                        affected: "victim",
                        enchanted: "attacker",
                        effect: {
                            type: "minecraft:apply_mob_effect",
                            max_duration: {
                                type: "minecraft:linear",
                                base: 3.25,
                                per_level_above_first: 1.25
                            },
                            max_amplifier: {
                                type: "minecraft:linear",
                                base: 2,
                                per_level_above_first: 1
                            },
                            min_duration: 3.25,
                            min_amplifier: 2,
                            to_apply: "minecraft:wither"
                        }
                    }
                ]
            } as any,
            primary_items: "#minecraft:enchantable/sword",
            slots: ["mainhand"],
            exclusive_set: "#enchantplus:exclusive_set/aspect",
            supported_items: "#minecraft:enchantable/weapon"
        }
    }
];

export const VOXEL_ELEMENTS: EnchantmentProps[] = [
    {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "bow/accuracy_shot" },
        description: {
            translate: "enchantment.enchantplus.accuracy_shot",
            fallback: "Accuracy Shot"
        },
        maxLevel: 1,
        weight: 2,
        anvilCost: 4,
        minCostBase: 20,
        minCostPerLevelAboveFirst: 9,
        maxCostBase: 65,
        maxCostPerLevelAboveFirst: 9,
        exclusiveSet: "",
        primaryItems: "",
        mode: "normal" as const,
        disabledEffects: [],
        effects: {},
        supportedItems: "#voxel:enchantable/range",
        tags: [
            "minecraft:non_treasure",
            "yggdrasil:structure/alfheim_tree/ominous_vault",
            "yggdrasil:structure/alfheim_tree/random_loot",
            "yggdrasil:structure/asflors/common"
        ],

        slots: ["mainhand", "offhand"]
    },
    {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "boots/agility" },
        description: {
            translate: "enchantment.enchantplus.agility",
            fallback: "Agility"
        },
        maxLevel: 1,
        weight: 2,
        anvilCost: 4,
        minCostBase: 20,
        minCostPerLevelAboveFirst: 9,
        maxCostBase: 65,
        maxCostPerLevelAboveFirst: 9,
        exclusiveSet: "",
        primaryItems: "",
        mode: "normal" as const,
        disabledEffects: [],
        effects: {},
        supportedItems: "#minecraft:enchantable/foot_armor",
        tags: ["minecraft:non_treasure"],
        slots: ["feet"]
    },
    {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "elytra/armored" },
        description: {
            translate: "enchantment.enchantplus.armored",
            fallback: "Armored"
        },
        maxLevel: 1,
        weight: 1,
        anvilCost: 4,
        minCostBase: 20,
        minCostPerLevelAboveFirst: 9,
        maxCostBase: 65,
        maxCostPerLevelAboveFirst: 9,
        exclusiveSet: "",
        primaryItems: "",
        mode: "normal" as const,
        disabledEffects: [],
        effects: {},
        supportedItems: "#voxel:enchantable/elytra",
        tags: ["minecraft:non_treasure"],
        slots: ["chest"]
    },
    {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "sword/attack_speed" },
        description: {
            translate: "enchantment.enchantplus.harvest",
            fallback: "Harvest"
        },
        maxLevel: 1,
        weight: 2,
        anvilCost: 4,
        minCostBase: 20,
        minCostPerLevelAboveFirst: 9,
        maxCostBase: 65,
        maxCostPerLevelAboveFirst: 9,
        exclusiveSet: "",
        primaryItems: "",
        mode: "normal" as const,
        disabledEffects: [],
        effects: {},
        supportedItems: "#voxel:enchantable/hoes",
        tags: ["minecraft:non_treasure", "foo:bar"],
        slots: ["mainhand"]
    },
    {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "sword/poison_aspect" },
        description: {
            translate: "enchantment.enchantplus.poison_aspect",
            fallback: "Poison Aspect"
        },
        maxLevel: 1,
        weight: 2,
        anvilCost: 4,
        minCostBase: 20,
        minCostPerLevelAboveFirst: 9,
        maxCostBase: 65,
        maxCostPerLevelAboveFirst: 9,
        exclusiveSet: "#enchantplus:exclusive_set/aspect",
        primaryItems: "#minecraft:enchantable/sword",
        mode: "normal" as const,
        disabledEffects: [],
        effects: {},
        supportedItems: "#minecraft:enchantable/weapon",
        tags: ["minecraft:non_treasure", "enchantplus:sword/poison_aspect"],
        slots: ["mainhand"]
    }
];

export const makeAdvancedEnchantment: (props: Partial<EnchantmentProps>) => DataDrivenRegistryElement<Enchantment> = (props) => {
    const base = {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "bow/accuracy_shot" },
        data: {
            ...advancedBaseEnchantment,
            tags: []
        }
    };

    const clone = structuredClone(base);
    const { identifier, data } = clone;
    return {
        identifier,
        data: { ...data, ...props }
    };
};

export const DATA_DRIVEN_TEMPLATE_LOOT_TABLE: DataDrivenRegistryElement<MinecraftLootTable>[] = [
    // Simple loot table
    {
        identifier: { namespace: "test", registry: "loot_table", resource: "simple" },
        data: {
            type: "minecraft:entity",
            pools: [
                {
                    rolls: 1,
                    bonus_rolls: 0,
                    entries: [
                        {
                            type: "minecraft:item",
                            name: "minecraft:experience_bottle",
                            functions: [
                                {
                                    function: "minecraft:set_count",
                                    count: {
                                        min: 1,
                                        max: 3
                                    }
                                }
                            ],
                            conditions: [
                                {
                                    condition: "minecraft:random_chance",
                                    chance: 0.5
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    // Complex loot table with nested groups
    {
        identifier: { namespace: "test", registry: "loot_table", resource: "extreme" },
        data: {
            type: "minecraft:entity",
            pools: [
                {
                    rolls: 5,
                    entries: [
                        {
                            type: "minecraft:alternatives",
                            children: [
                                {
                                    type: "minecraft:dynamic",
                                    name: "minecraft:contents"
                                },
                                {
                                    type: "minecraft:group",
                                    children: [
                                        {
                                            type: "minecraft:sequence",
                                            children: [
                                                {
                                                    type: "minecraft:item",
                                                    name: "minecraft:amethyst_shard"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            random_sequence: "minecraft:entities/wither_skeleton"
        }
    },
    // Multi-pool loot table
    {
        identifier: { namespace: "test", registry: "loot_table", resource: "reference" },
        data: {
            type: "minecraft:equipment",
            pools: [
                {
                    rolls: 1,
                    bonus_rolls: 0,
                    entries: [
                        {
                            type: "minecraft:loot_table",
                            value: "yggdrasil:generic/equipment/ominous/item/sword"
                        }
                    ]
                },
                {
                    rolls: 1,
                    bonus_rolls: 0,
                    entries: [
                        {
                            type: "minecraft:loot_table",
                            value: "yggdrasil:generic/equipment/ominous/item/helmet"
                        }
                    ]
                },
                {
                    rolls: 1,
                    bonus_rolls: 0,
                    entries: [
                        {
                            type: "minecraft:loot_table",
                            value: "yggdrasil:generic/equipment/ominous/item/chestplate"
                        }
                    ]
                }
            ],
            random_sequence: "yggdrasil:equipment"
        }
    }
];
