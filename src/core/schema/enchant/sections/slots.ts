import type { InterfaceConfiguration } from "@/core/schema/primitive";

export const slots: InterfaceConfiguration = {
    id: "enchant.slots",
    section: { type: "translate", value: "tools.enchantments.section.slots" },
    components: [
        {
            type: "Section",
            title: {
                type: "translate",
                value: "tools.enchantments.section.slots.description"
            },
            id: "slots",
            children: [
                {
                    type: "Grid",
                    children: [
                        {
                            type: "Slot",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.slots.mainhand.title"
                            },
                            image: "/images/features/slots/mainhand.webp",
                            action: {
                                type: "set_computed_slot",
                                field: "slots",
                                value: "mainhand"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "slots",
                                    values: ["mainhand", "any", "hand"]
                                }
                            }
                        },
                        {
                            type: "Slot",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.slots.offhand.title"
                            },
                            image: "/images/features/slots/offhand.webp",
                            action: {
                                type: "set_computed_slot",
                                field: "slots",
                                value: "offhand"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "slots",
                                    values: ["offhand", "any", "hand"]
                                }
                            }
                        }
                    ]
                },
                {
                    type: "Grid",
                    children: [
                        {
                            type: "Slot",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.slots.body.title"
                            },
                            image: "/images/features/slots/body.webp",
                            action: {
                                type: "set_computed_slot",
                                field: "slots",
                                value: "body"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "slots",
                                    values: ["body", "any"]
                                }
                            }
                        },
                        {
                            type: "Slot",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.slots.saddle.title"
                            },
                            image: "/images/features/slots/saddle.webp",
                            action: {
                                type: "set_computed_slot",
                                field: "slots",
                                value: "saddle"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "slots",
                                    values: ["saddle", "any"]
                                }
                            }
                        }
                    ]
                },
                {
                    type: "Grid",
                    children: [
                        {
                            type: "Slot",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.slots.head.title"
                            },
                            image: "/images/features/slots/head.webp",
                            action: {
                                type: "set_computed_slot",
                                field: "slots",
                                value: "head"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "slots",
                                    values: ["head", "any", "armor"]
                                }
                            }
                        },
                        {
                            type: "Slot",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.slots.chest.title"
                            },
                            image: "/images/features/slots/chest.webp",
                            action: {
                                type: "set_computed_slot",
                                field: "slots",
                                value: "chest"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "slots",
                                    values: ["chest", "any", "armor"]
                                }
                            }
                        },
                        {
                            type: "Slot",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.slots.legs.title"
                            },
                            image: "/images/features/slots/legs.webp",
                            action: {
                                type: "set_computed_slot",
                                field: "slots",
                                value: "legs"
                            },
                            renderer: {
                                type: "conditionnal",
                                return_condition: true,
                                term: {
                                    condition: "contains",
                                    field: "slots",
                                    values: ["legs", "any", "armor"]
                                }
                            }
                        },
                        {
                            type: "Slot",
                            title: {
                                type: "translate",
                                value: "tools.enchantments.section.slots.feet.title"
                            },
                            image: "/images/features/slots/feet.webp",
                            action: {
                                type: "set_computed_slot",
                                field: "slots",
                                value: "feet"
                            },
                            renderer: {
                                type: "conditionnal",
                                term: {
                                    condition: "contains",
                                    field: "slots",
                                    values: ["feet", "any", "armor"]
                                },
                                return_condition: true
                            }
                        }
                    ]
                },
                {
                    type: "Text",
                    content: [
                        {
                            type: "Paragraph",
                            content: {
                                type: "translate",
                                value: "tools.enchantments.section.slots.explanation.title"
                            }
                        },
                        {
                            type: "UnorderedList",
                            sublist: [
                                {
                                    type: "ListItem",
                                    content: {
                                        type: "translate",
                                        value: "tools.enchantments.section.slots.explanation.list.1"
                                    }
                                },
                                {
                                    type: "ListItem",
                                    content: {
                                        type: "translate",
                                        value: "tools.enchantments.section.slots.explanation.list.2"
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
