import type { ToolRevealElementType } from "@/lib/minecraft/core/schema/primitive/component.ts";

export const dungeon: ToolRevealElementType = {
    id: "enchant.addons.dnt",
    soon: false,
    logo: "/images/addons/logo/dnt.webp",
    image: "/images/addons/hero/dnt.png",
    href: "https://modrinth.com/datapack/dungeons-and-taverns",
    title: {
        type: "translate",
        value: "tools.enchantments.section.addons.dnt.title"
    },
    description: {
        type: "translate",
        value: "tools.enchantments.section.addons.dnt.description"
    },
    children: [
        {
            type: "Category",
            title: {
                type: "translate",
                value: "tools.enchantments.section.addons.dnt.global.title"
            },
            children: [
                {
                    type: "Grid",
                    size: "250px",
                    children: [
                        {
                            type: "Iteration",
                            values: [
                                {
                                    type: "object",
                                    values: [
                                        {
                                            title: "tools.enchantments.section.addons.dnt.overworld.title",
                                            description: "tools.enchantments.section.addons.dnt.overworld.description",
                                            image: "/images/features/structure/overworld.webp",
                                            tag: "#nova_structures:structure/overworld"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.dnt.underwater.title",
                                            description: "tools.enchantments.section.addons.dnt.underwater.description",
                                            image: "/images/features/structure/underwater.webp",
                                            tag: "#nova_structures:structure/underwater"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.dnt.nether.title",
                                            description: "tools.enchantments.section.addons.dnt.nether.description",
                                            image: "/images/features/structure/nether.webp",
                                            tag: "#nova_structures:structure/nether"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.dnt.end.title",
                                            description: "tools.enchantments.section.addons.dnt.end.description",
                                            image: "/images/features/structure/end.webp",
                                            tag: "#nova_structures:structure/end"
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
                                size: 128,
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
                value: "tools.enchantments.section.addons.dnt.structures.title"
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
                                            title: "tools.enchantments.section.addons.dnt.creeping_crypt.title",
                                            description: "tools.enchantments.section.addons.dnt.creeping_crypt.description",
                                            image: "/images/addons/card/dnt/creeping_crypt.webp",
                                            tag: "#nova_structures:structure/creeping_crypt"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.dnt.nether_keep.title",
                                            description: "tools.enchantments.section.addons.dnt.nether_keep.description",
                                            image: "/images/addons/card/dnt/piglin_outstation.webp",
                                            tag: "#nova_structures:structure/nether_keep"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.dnt.illager.title",
                                            description: "tools.enchantments.section.addons.dnt.illager.description",
                                            image: "/images/addons/card/dnt/illager_manor.webp",
                                            tag: "#nova_structures:structure/illager"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.dnt.illager_outpost.title",
                                            description: "tools.enchantments.section.addons.dnt.illager_outpost.description",
                                            image: "/images/addons/card/dnt/illager_hideout.webp",
                                            tag: "#nova_structures:structure/illager_outpost"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.dnt.pale_residence.title",
                                            description: "tools.enchantments.section.addons.dnt.pale_residence.description",
                                            image: "/images/addons/card/dnt/pale_residence.webp",
                                            tag: "#nova_structures:structure/pale_residence"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.dnt.shrine.title",
                                            description: "tools.enchantments.section.addons.dnt.shrine.description",
                                            image: "/images/addons/card/dnt/shrine.webp",
                                            tag: "#nova_structures:structure/shrine"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.dnt.shrine_ominous.title",
                                            description: "tools.enchantments.section.addons.dnt.shrine_ominous.description",
                                            image: "/images/addons/card/dnt/shrine_ominous.webp",
                                            tag: "#nova_structures:structure/shrine_ominous"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.dnt.snowy.title",
                                            description: "tools.enchantments.section.addons.dnt.snowy.description",
                                            image: "/images/addons/card/dnt/stay_fort.webp",
                                            tag: "#nova_structures:structure/snowy"
                                        },
                                        {
                                            title: "tools.enchantments.section.addons.dnt.toxic_lair.title",
                                            description: "tools.enchantments.section.addons.dnt.toxic_lair.description",
                                            image: "/images/addons/card/dnt/toxic_lair.webp",
                                            tag: "#nova_structures:structure/toxic_lair"
                                        }
                                    ]
                                }
                            ],
                            template: {
                                type: "InlineSlot",
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
