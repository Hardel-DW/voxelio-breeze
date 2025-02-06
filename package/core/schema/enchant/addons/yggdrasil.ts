import type { ToolRevealElementType } from "@/core/schema/primitive/component";

export const yggdrasil: ToolRevealElementType = {
    id: "enchant.addons.yggdrasil",
    logo: "/images/addons/logo/yggdrasil.webp",
    image: "/images/addons/hero/yggdrasil.png",
    href: "https://modrinth.com/datapack/yggdrasil-structure",
    title: {
        type: "translate",
        value: "tools.enchantments.section.addons.yggdrasil.title"
    },
    description: {
        type: "translate",
        value: "tools.enchantments.section.addons.yggdrasil.description"
    },
    children: [
        {
            type: "Category",
            title: {
                type: "translate",
                value: "tools.enchantments.section.addons.yggdrasil.alfheim.title"
            },
            children: [
                {
                    type: "Grid",
                    size: "400px",
                    children: [
                        {
                            type: "Slot",
                            image: "/images/features/title/yg.webp",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.yggdrasil.components.yggdrasilMobEquipment.title"
                            },
                            description: {
                                type: "translate",
                                value: "tools.enchantments.section.yggdrasil.components.yggdrasilMobEquipment.description"
                            },
                            action: {
                                type: "toggle_multiple_values",
                                field: "tags",
                                value: [
                                    "#yggdrasil:equipment/item/bow",
                                    "#yggdrasil:equipment/item/sword",
                                    "#yggdrasil:equipment/item/helmet",
                                    "#yggdrasil:equipment/item/chestplate",
                                    "#yggdrasil:equipment/item/leggings",
                                    "#yggdrasil:equipment/item/boots"
                                ]
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "tags",
                                    values: [
                                        "#yggdrasil:equipment/item/bow",
                                        "#yggdrasil:equipment/item/sword",
                                        "#yggdrasil:equipment/item/helmet",
                                        "#yggdrasil:equipment/item/chestplate",
                                        "#yggdrasil:equipment/item/leggings",
                                        "#yggdrasil:equipment/item/boots"
                                    ]
                                }
                            }
                        },
                        {
                            type: "Iteration",
                            values: [
                                {
                                    type: "object",
                                    values: [
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.random_chest.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.random_chest.description",
                                            image: "/images/features/block/chest.webp",
                                            tag: "#yggdrasil:structure/alfheim_tree/random_loot"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.vault.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.vault.description",
                                            image: "/images/features/block/vault.webp",
                                            tag: "#yggdrasil:structure/alfheim_tree/vault"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.ominous_vault.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.ominous_vault.description",
                                            image: "/images/features/block/ominous_vault.webp",
                                            tag: "#yggdrasil:structure/alfheim_tree/ominous_vault"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.trial_spawner.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.trial_spawner.description",
                                            image: "/images/features/block/trial_spawner.webp",
                                            tag: "#yggdrasil:structure/alfheim_tree/trial_spawner"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.ominous_trial_spawner.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.ominous_trial_spawner.description",
                                            image: "/images/features/block/ominous_trial_spawner.webp",
                                            tag: "#yggdrasil:structure/alfheim_tree/ominous_trial_spawner"
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
                                description: {
                                    type: "translate",
                                    value: {
                                        type: "get_value_from_context",
                                        key: "description"
                                    }
                                },
                                image: {
                                    type: "get_value_from_context",
                                    key: "image"
                                },
                                action: {
                                    type: "toggle_value_in_list",
                                    field: "tags",
                                    value: {
                                        type: "get_value_from_context",
                                        key: "tag"
                                    }
                                },
                                renderer: {
                                    type: "conditionnal",
                                    return_condition: true,
                                    term: {
                                        condition: "contains",
                                        field: "tags",
                                        values: [{ type: "get_value_from_context", key: "tag" }]
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            type: "Category",
            title: {
                type: "translate",
                value: "tools.enchantments.section.addons.yggdrasil.asflors.title"
            },
            children: [
                {
                    type: "Grid",
                    size: "300px",
                    children: [
                        {
                            type: "Iteration",
                            values: [
                                {
                                    type: "object",
                                    values: [
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.common_chest.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.common_chest.description",
                                            image: "/images/features/block/chest.webp",
                                            tag: "#yggdrasil:structure/asflors/common"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.structure_vault.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.structure_vault.description",
                                            image: "/images/features/block/vault.webp",
                                            tag: "#yggdrasil:structure/asflors/vault"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.structure_ominous_vault.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.structure_ominous_vault.description",
                                            image: "/images/features/block/ominous_vault.webp",
                                            tag: "#yggdrasil:structure/asflors/ominous_vault"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.asflors_sword.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.asflors_sword.description",
                                            image: "/images/features/item/sword.webp",
                                            tag: "#yggdrasil:structure/asflors/asflors_sword"
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
                                description: {
                                    type: "translate",
                                    value: {
                                        type: "get_value_from_context",
                                        key: "description"
                                    }
                                },
                                image: {
                                    type: "get_value_from_context",
                                    key: "image"
                                },
                                action: {
                                    type: "toggle_value_in_list",
                                    field: "tags",
                                    value: {
                                        type: "get_value_from_context",
                                        key: "tag"
                                    }
                                },
                                renderer: {
                                    type: "conditionnal",
                                    return_condition: true,
                                    term: {
                                        condition: "contains",
                                        field: "tags",
                                        values: [{ type: "get_value_from_context", key: "tag" }]
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            type: "Category",
            title: {
                type: "translate",
                value: "tools.enchantments.section.addons.yggdrasil.runic_fracture.title"
            },
            children: [
                {
                    type: "Grid",
                    size: "400px",
                    children: [
                        {
                            type: "Slot",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.addons.yggdrasil.boss_trial_spawner.title"
                            },
                            description: {
                                type: "translate",
                                value: "tools.enchantments.section.addons.yggdrasil.boss_trial_spawner.description"
                            },
                            image: "/images/features/block/ominous_trial_spawner.webp",
                            action: {
                                type: "toggle_value_in_list",
                                field: "tags",
                                value: "#yggdrasil:structure/runic_fracture/boss_trial_spawner"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "tags",
                                    values: ["#yggdrasil:structure/runic_fracture/boss_trial_spawner"]
                                }
                            }
                        },
                        {
                            type: "Slot",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.addons.yggdrasil.monster_trial_spawner.title"
                            },
                            description: {
                                type: "translate",
                                value: "tools.enchantments.section.addons.yggdrasil.monster_trial_spawner.description"
                            },
                            image: "/images/features/block/ominous_trial_spawner.webp",
                            action: {
                                type: "toggle_value_in_list",
                                field: "tags",
                                value: "#yggdrasil:structure/runic_fracture/monster_trial_spawner"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "tags",
                                    values: ["#yggdrasil:structure/runic_fracture/monster_trial_spawner"]
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            type: "Category",
            title: {
                type: "translate",
                value: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.title"
            },
            children: [
                {
                    type: "Grid",
                    size: "400px",
                    children: [
                        {
                            type: "Iteration",
                            values: [
                                {
                                    type: "object",
                                    values: [
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.dark_elven_bow.title",
                                            description:
                                                "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.dark_elven_bow.description",
                                            image: "/images/features/item/bow.webp",
                                            tag: "#yggdrasil:structure/runic_labyrinth/dark_elven_bow"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.twilight_bow.title",
                                            description:
                                                "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.twilight_bow.description",
                                            image: "/images/features/item/bow.webp",
                                            tag: "#yggdrasil:structure/runic_labyrinth/twilight_of_yggdrasil_bow"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.library.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.library.description",
                                            image: "/images/features/block/chest.webp",
                                            tag: "#yggdrasil:structure/runic_labyrinth/library"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.random.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.random.description",
                                            image: "/images/features/block/chest.webp",
                                            tag: "#yggdrasil:structure/runic_labyrinth/random"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.shulker.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.shulker.description",
                                            image: "/images/features/block/chest.webp",
                                            tag: "#yggdrasil:structure/runic_labyrinth/shulker"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.trial.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.trial.description",
                                            image: "/images/features/block/trial_spawner.webp",
                                            tag: "#yggdrasil:structure/runic_labyrinth/trial"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.vault.title",
                                            description: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.vault.description",
                                            image: "/images/features/block/vault.webp",
                                            tag: "#yggdrasil:structure/runic_labyrinth/vault"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.ominous_trial.title",
                                            description:
                                                "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.ominous_trial.description",
                                            image: "/images/features/block/ominous_trial_spawner.webp",
                                            tag: "#yggdrasil:structure/runic_labyrinth/ominous_trial"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.ominous_vault.title",
                                            description:
                                                "tools.enchantments.section.addons.yggdrasil.runic_labyrinth.ominous_vault.description",
                                            image: "/images/features/block/ominous_vault.webp",
                                            tag: "#yggdrasil:structure/runic_labyrinth/ominous_vault"
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
                                description: {
                                    type: "translate",
                                    value: {
                                        type: "get_value_from_context",
                                        key: "description"
                                    }
                                },
                                image: {
                                    type: "get_value_from_context",
                                    key: "image"
                                },
                                action: {
                                    type: "toggle_value_in_list",
                                    field: "tags",
                                    value: {
                                        type: "get_value_from_context",
                                        key: "tag"
                                    }
                                },
                                renderer: {
                                    type: "conditionnal",
                                    return_condition: true,
                                    term: {
                                        condition: "contains",
                                        field: "tags",
                                        values: [{ type: "get_value_from_context", key: "tag" }]
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
