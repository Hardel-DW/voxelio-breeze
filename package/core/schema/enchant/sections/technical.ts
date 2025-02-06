import type { InterfaceConfiguration } from "@/lib/minecraft/core/schema/primitive";

export const technical: InterfaceConfiguration = {
    id: "enchant.technical",
    section: { type: "translate", value: "tools.enchantments.section.technical" },
    components: [
        {
            type: "Section",
            title: {
                type: "translate",
                value: "tools.enchantments.section.technical.description"
            },
            id: "technical_behaviour",
            children: [
                {
                    type: "Switch",
                    title: {
                        type: "translate",
                        value: "tools.enchantments.section.technical.components.curse.title"
                    },
                    description: {
                        type: "translate",
                        value: "tools.enchantments.section.technical.components.curse.description"
                    },
                    lock: [
                        {
                            text: {
                                type: "translate",
                                value: "tools.disabled_because_vanilla"
                            },
                            condition: {
                                condition: "object",
                                field: "identifier",
                                terms: {
                                    condition: "compare_value_to_field_value",
                                    field: "namespace",
                                    value: "minecraft"
                                }
                            }
                        }
                    ],
                    action: {
                        type: "toggle_value_in_list",
                        field: "tags",
                        value: "#minecraft:curse"
                    },
                    renderer: {
                        type: "conditionnal",
                        return_condition: true,
                        term: {
                            condition: "contains",
                            field: "tags",
                            values: ["#minecraft:curse"]
                        }
                    }
                },
                {
                    type: "Switch",
                    title: {
                        type: "translate",
                        value: "tools.enchantments.section.technical.components.nonTreasure.title"
                    },
                    description: {
                        type: "translate",
                        value: "tools.enchantments.section.technical.components.nonTreasure.description"
                    },
                    lock: [
                        {
                            text: {
                                type: "translate",
                                value: "tools.disabled_because_vanilla"
                            },
                            condition: {
                                condition: "object",
                                field: "identifier",
                                terms: {
                                    condition: "compare_value_to_field_value",
                                    field: "namespace",
                                    value: "minecraft"
                                }
                            }
                        }
                    ],
                    action: {
                        type: "toggle_value_in_list",
                        field: "tags",
                        value: "#minecraft:non_treasure"
                    },
                    renderer: {
                        type: "conditionnal",
                        return_condition: true,
                        term: {
                            condition: "contains",
                            field: "tags",
                            values: ["#minecraft:non_treasure"]
                        }
                    }
                },
                {
                    type: "Switch",
                    title: {
                        type: "translate",
                        value: "tools.enchantments.section.technical.components.treasure.title"
                    },
                    description: {
                        type: "translate",
                        value: "tools.enchantments.section.technical.components.treasure.description"
                    },
                    lock: [
                        {
                            text: {
                                type: "translate",
                                value: "tools.disabled_because_vanilla"
                            },
                            condition: {
                                condition: "object",
                                field: "identifier",
                                terms: {
                                    condition: "compare_value_to_field_value",
                                    field: "namespace",
                                    value: "minecraft"
                                }
                            }
                        }
                    ],
                    action: {
                        type: "toggle_value_in_list",
                        field: "tags",
                        value: "#minecraft:treasure"
                    },
                    renderer: {
                        type: "conditionnal",
                        return_condition: true,
                        term: {
                            condition: "contains",
                            field: "tags",
                            values: ["#minecraft:treasure"]
                        }
                    }
                },
                {
                    type: "Switch",
                    title: {
                        type: "translate",
                        value: "tools.enchantments.section.technical.components.smeltsLoot.title"
                    },
                    description: {
                        type: "translate",
                        value: "tools.enchantments.section.technical.components.smeltsLoot.description"
                    },
                    lock: [
                        {
                            text: {
                                type: "translate",
                                value: "tools.disabled_because_vanilla"
                            },
                            condition: {
                                condition: "object",
                                field: "identifier",
                                terms: {
                                    condition: "compare_value_to_field_value",
                                    field: "namespace",
                                    value: "minecraft"
                                }
                            }
                        }
                    ],
                    action: {
                        type: "toggle_value_in_list",
                        field: "tags",
                        value: "#minecraft:smelts_loot"
                    },
                    renderer: {
                        type: "conditionnal",
                        return_condition: true,
                        term: {
                            condition: "contains",
                            field: "tags",
                            values: ["#minecraft:smelts_loot"]
                        }
                    }
                },
                {
                    type: "Grid",
                    children: [
                        {
                            type: "Switch",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.technical.components.preventsIceMelting.title"
                            },
                            description: {
                                type: "translate",
                                value: "tools.enchantments.section.technical.components.preventsIceMelting.description"
                            },
                            lock: [
                                {
                                    text: {
                                        type: "translate",
                                        value: "tools.disabled_because_vanilla"
                                    },
                                    condition: {
                                        condition: "object",
                                        field: "identifier",
                                        terms: {
                                            condition: "compare_value_to_field_value",
                                            field: "namespace",
                                            value: "minecraft"
                                        }
                                    }
                                }
                            ],
                            action: {
                                type: "toggle_value_in_list",
                                field: "tags",
                                value: "#minecraft:prevent_ice_melting"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "tags",
                                    values: ["#minecraft:prevent_ice_melting"]
                                }
                            }
                        },
                        {
                            type: "Switch",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.technical.components.preventInfestedBlockSpawning.title"
                            },
                            description: {
                                type: "translate",
                                value: "tools.enchantments.section.technical.components.preventInfestedBlockSpawning.description"
                            },
                            lock: [
                                {
                                    text: {
                                        type: "translate",
                                        value: "tools.disabled_because_vanilla"
                                    },
                                    condition: {
                                        condition: "object",
                                        field: "identifier",
                                        terms: {
                                            condition: "compare_value_to_field_value",
                                            field: "namespace",
                                            value: "minecraft"
                                        }
                                    }
                                }
                            ],
                            action: {
                                type: "toggle_value_in_list",
                                field: "tags",
                                value: "#minecraft:prevent_infested_block_spawning"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "tags",
                                    values: ["#minecraft:prevent_infested_block_spawning"]
                                }
                            }
                        }
                    ]
                },
                {
                    type: "Grid",
                    children: [
                        {
                            type: "Switch",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.technical.components.preventBeeSpawning.title"
                            },
                            description: {
                                type: "translate",
                                value: "tools.enchantments.section.technical.components.preventBeeSpawning.description"
                            },
                            lock: [
                                {
                                    text: {
                                        type: "translate",
                                        value: "tools.disabled_because_vanilla"
                                    },
                                    condition: {
                                        condition: "object",
                                        field: "identifier",
                                        terms: {
                                            condition: "compare_value_to_field_value",
                                            field: "namespace",
                                            value: "minecraft"
                                        }
                                    }
                                }
                            ],
                            action: {
                                type: "toggle_value_in_list",
                                field: "tags",
                                value: "#minecraft:prevent_bee_spawning"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "tags",
                                    values: ["#minecraft:prevent_bee_spawning"]
                                }
                            }
                        },
                        {
                            type: "Switch",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.technical.components.preventPotShattering.title"
                            },
                            description: {
                                type: "translate",
                                value: "tools.enchantments.section.technical.components.preventPotShattering.description"
                            },
                            lock: [
                                {
                                    text: {
                                        type: "translate",
                                        value: "tools.disabled_because_vanilla"
                                    },
                                    condition: {
                                        condition: "object",
                                        field: "identifier",
                                        terms: {
                                            condition: "compare_value_to_field_value",
                                            field: "namespace",
                                            value: "minecraft"
                                        }
                                    }
                                }
                            ],
                            action: {
                                type: "toggle_value_in_list",
                                field: "tags",
                                value: "#minecraft:prevent_pot_shattering"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "tags",
                                    values: ["#minecraft:prevent_pot_shattering"]
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            type: "Section",
            title: { type: "translate", value: "tools.enchantments.section.costs" },
            button: {
                text: { type: "translate", value: "generic.documentation" },
                url: "https://minecraft.wiki/w/Enchanting_mechanics"
            },
            id: "costs",
            children: [
                {
                    type: "Grid",
                    children: [
                        {
                            type: "Range",
                            label: {
                                type: "translate",
                                value: "tools.enchantments.section.global.components.minCostBase.label"
                            },
                            min: 0,
                            max: 100,
                            step: 1,
                            action: {
                                type: "set_value_from_computed_value",
                                field: "minCostBase"
                            },
                            renderer: {
                                type: "from_field",
                                field: "minCostBase"
                            }
                        },
                        {
                            type: "Range",
                            label: {
                                type: "translate",
                                value: "tools.enchantments.section.global.components.minCostPerLevelAboveFirst.label"
                            },
                            min: 0,
                            max: 100,
                            step: 1,
                            action: {
                                type: "set_value_from_computed_value",
                                field: "minCostPerLevelAboveFirst"
                            },
                            renderer: {
                                type: "from_field",
                                field: "minCostPerLevelAboveFirst"
                            }
                        }
                    ]
                },
                {
                    type: "Grid",
                    children: [
                        {
                            type: "Range",
                            label: {
                                type: "translate",
                                value: "tools.enchantments.section.global.components.maxCostBase.label"
                            },
                            min: 0,
                            max: 100,
                            step: 1,
                            action: { type: "set_value_from_computed_value", field: "maxCostBase" },
                            renderer: {
                                type: "from_field",
                                field: "maxCostBase"
                            }
                        },
                        {
                            type: "Range",
                            label: {
                                type: "translate",
                                value: "tools.enchantments.section.global.components.maxCostPerLevelAboveFirst.label"
                            },
                            min: 0,
                            max: 100,
                            step: 1,
                            action: {
                                type: "set_value_from_computed_value",
                                field: "maxCostPerLevelAboveFirst"
                            },
                            renderer: {
                                type: "from_field",
                                field: "maxCostPerLevelAboveFirst"
                            }
                        }
                    ]
                }
            ]
        },
        {
            type: "Section",
            title: {
                type: "translate",
                value: "tools.enchantments.section.effects.components.title"
            },
            id: "effects",
            children: [
                {
                    type: "Property",
                    action: {
                        type: "toggle_value_in_list",
                        field: "disabledEffects"
                    },
                    renderer: {
                        type: "from_field",
                        field: "effects"
                    },
                    condition: {
                        condition: "contains",
                        field: "disabledEffects"
                    }
                }
            ]
        }
    ]
};
