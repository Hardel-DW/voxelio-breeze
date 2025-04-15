import type { InterfaceConfiguration } from "@/core/schema/primitive";

export const global: InterfaceConfiguration = {
    id: "enchant.global",
    section: { type: "translate", value: "tools.enchantments.section.global" },
    components: [
        {
            type: "Section",
            title: {
                type: "translate",
                value: "tools.enchantments.section.global.description"
            },
            id: "main",
            children: [
                {
                    type: "Grid",
                    children: [
                        {
                            type: "Counter",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.global.components.maxLevel.title"
                            },
                            description: {
                                type: "translate",
                                value: "tools.enchantments.section.global.explanation.list.1"
                            },
                            image: "/icons/tools/level.svg",
                            min: 1,
                            max: 127,
                            step: 1,
                            action: {
                                type: "set_value_from_computed_value",
                                field: "maxLevel"
                            },
                            renderer: {
                                type: "from_field",
                                field: "maxLevel"
                            }
                        },
                        {
                            type: "Counter",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.global.components.weight.title"
                            },
                            description: {
                                type: "translate",
                                value: "tools.enchantments.section.global.explanation.list.2"
                            },
                            image: "/icons/tools/weight.svg",
                            min: 1,
                            max: 127,
                            step: 1,
                            action: {
                                type: "set_value_from_computed_value",
                                field: "weight"
                            },
                            renderer: {
                                type: "from_field",
                                field: "weight"
                            }
                        },
                        {
                            type: "Counter",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.global.components.anvilCost.title"
                            },
                            description: {
                                type: "translate",
                                value: "tools.enchantments.section.global.explanation.list.3"
                            },
                            image: "/icons/tools/anvil.svg",
                            min: 1,
                            max: 127,
                            step: 1,
                            action: {
                                type: "set_value_from_computed_value",
                                field: "anvilCost"
                            },
                            renderer: {
                                type: "from_field",
                                field: "anvilCost"
                            }
                        }
                    ]
                },
                {
                    type: "Selector",
                    title: {
                        type: "translate",
                        value: "tools.enchantments.section.global.components.mode.title"
                    },
                    description: {
                        type: "translate",
                        value: "tools.enchantments.section.global.components.mode.description"
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
                        type: "set_value_from_computed_value",
                        field: "mode"
                    },
                    renderer: {
                        type: "from_field",
                        field: "mode"
                    },
                    options: [
                        {
                            label: {
                                type: "translate",
                                value: "tools.enchantments.section.global.components.selector.normal"
                            },
                            value: "normal"
                        },
                        {
                            label: {
                                type: "translate",
                                value: "tools.enchantments.section.global.components.selector.soft_delete"
                            },
                            value: "soft_delete"
                        },
                        {
                            label: {
                                type: "translate",
                                value: "tools.enchantments.section.global.components.selector.only_creative"
                            },
                            value: "only_creative"
                        }
                    ]
                },
                {
                    type: "Donation",
                    icon: "/icons/logo.svg",
                    title: {
                        type: "translate",
                        value: "tools.supports.title"
                    },
                    description: {
                        type: "translate",
                        value: "tools.supports.description"
                    },
                    subTitle: {
                        type: "translate",
                        value: "tools.supports.advantages"
                    },
                    extra: [
                        {
                            type: "translate",
                            value: "tools.supports.advantages.early_access"
                        },
                        {
                            type: "translate",
                            value: "tools.supports.advantages.submit_ideas"
                        },
                        {
                            type: "translate",
                            value: "tools.supports.advantages.discord_role"
                        },
                        {
                            type: "translate",
                            value: "tools.supports.advantages.live_voxel"
                        }
                    ],
                    patreon: {
                        text: {
                            type: "translate",
                            value: "tools.supports.become"
                        },
                        link: "https://www.patreon.com/hardel"
                    },
                    tipText: {
                        text: {
                            type: "translate",
                            value: "dialog.footer.donate"
                        },
                        link: "https://streamelements.com/hardoudou/tip"
                    }
                }
            ]
        }
    ]
};
