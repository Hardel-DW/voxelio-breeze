import type { InterfaceConfiguration } from "@/lib/minecraft/core/schema/primitive";

export const supported: InterfaceConfiguration = {
    id: "enchant.supported",
    section: { type: "translate", value: "tools.enchantments.section.supported" },
    components: [
        {
            type: "Section",
            title: {
                type: "translate",
                value: "tools.enchantments.section.supported.description"
            },
            id: "main.supported",
            toggle: [
                {
                    name: "main.supported.items",
                    field: "supportedItems",
                    title: {
                        type: "translate",
                        value: "tools.enchantments.section.toggle.supported.title"
                    },
                    description: {
                        type: "translate",
                        value: "tools.enchantments.section.toggle.supported.description"
                    }
                },
                {
                    name: "main.primary.items",
                    field: "primaryItems",
                    title: {
                        type: "translate",
                        value: "tools.enchantments.section.toggle.primary.title"
                    },
                    description: {
                        type: "translate",
                        value: "tools.enchantments.section.toggle.primary.description"
                    }
                }
            ],
            children: [
                {
                    type: "Grid",
                    children: [
                        {
                            type: "Iteration",
                            values: [
                                {
                                    type: "object",
                                    values: [
                                        {
                                            title: "tools.enchantments.section.supported.components.sword.title",
                                            image: "/images/features/item/sword.webp",
                                            value: "#minecraft:enchantable/sword"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.trident.title",
                                            image: "/images/features/item/trident.webp",
                                            value: "#minecraft:enchantable/trident"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.mace.title",
                                            image: "/images/features/item/mace.webp",
                                            value: "#minecraft:enchantable/mace"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.bow.title",
                                            image: "/images/features/item/bow.webp",
                                            value: "#minecraft:enchantable/bow"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.crossbow.title",
                                            image: "/images/features/item/crossbow.webp",
                                            value: "#minecraft:enchantable/crossbow"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.range.title",
                                            image: "/images/features/item/range.webp",
                                            value: "#voxel:enchantable/range"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.fishing.title",
                                            image: "/images/features/item/fishing_rod.webp",
                                            value: "#minecraft:enchantable/fishing"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.shield.title",
                                            image: "/images/features/item/shield.webp",
                                            value: "#voxel:enchantable/shield"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.weapon.title",
                                            image: "/images/features/item/weapon.webp",
                                            value: "#minecraft:enchantable/weapon"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.melee.title",
                                            image: "/images/features/item/melee.webp",
                                            value: "#voxel:enchantable/melee"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.head_armor.title",
                                            image: "/images/features/item/helmet.webp",
                                            value: "#minecraft:enchantable/head_armor"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.chest_armor.title",
                                            image: "/images/features/item/chestplate.webp",
                                            value: "#minecraft:enchantable/chest_armor"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.leg_armor.title",
                                            image: "/images/features/item/leggings.webp",
                                            value: "#minecraft:enchantable/leg_armor"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.foot_armor.title",
                                            image: "/images/features/item/boots.webp",
                                            value: "#minecraft:enchantable/foot_armor"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.elytra.title",
                                            image: "/images/features/item/elytra.webp",
                                            value: "#voxel:enchantable/elytra"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.armor.title",
                                            image: "/images/features/item/armor.webp",
                                            value: "#minecraft:enchantable/armor"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.equippable.title",
                                            image: "/images/features/item/equipable.webp",
                                            value: "#minecraft:enchantable/equippable"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.axes.title",
                                            image: "/images/features/item/axe.webp",
                                            value: "#voxel:enchantable/axes"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.shovels.title",
                                            image: "/images/features/item/shovel.webp",
                                            value: "#voxel:enchantable/shovels"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.hoes.title",
                                            image: "/images/features/item/hoe.webp",
                                            value: "#voxel:enchantable/hoes"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.pickaxes.title",
                                            image: "/images/features/item/pickaxe.webp",
                                            value: "#voxel:enchantable/pickaxes"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.durability.title",
                                            image: "/images/features/item/durability.webp",
                                            value: "#minecraft:enchantable/durability"
                                        },
                                        {
                                            title: "tools.enchantments.section.supported.components.mining_loot.title",
                                            image: "/images/features/item/mining.webp",
                                            value: "#minecraft:enchantable/mining_loot"
                                        }
                                    ]
                                }
                            ],
                            template: {
                                type: "Slot",
                                title: {
                                    type: "translate",
                                    value: {
                                        type: "get_value_from_context",
                                        key: "title"
                                    }
                                },
                                image: {
                                    type: "get_value_from_context",
                                    key: "image"
                                },
                                action: {
                                    type: "set_value",
                                    value: {
                                        type: "get_value_from_context",
                                        key: "value"
                                    },
                                    field: "$resolver.field$:main.supported"
                                },
                                renderer: {
                                    type: "conditionnal",
                                    return_condition: true,
                                    term: {
                                        condition: "compare_value_to_field_value",
                                        field: "$resolver.field$:main.supported",
                                        value: {
                                            type: "get_value_from_context",
                                            key: "value"
                                        }
                                    }
                                }
                            }
                        },
                        {
                            type: "Slot",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.supported.components.none.title"
                            },
                            image: "/images/tools/cross.webp",
                            action: {
                                type: "set_undefined",
                                field: "$resolver.field$:main.supported"
                            },
                            hide: {
                                condition: "compare_to_value",
                                compare: "$resolver.name$:main.supported",
                                value: "main.supported.items"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "if_field_is_undefined",
                                    field: "$resolver.field$:main.supported"
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
