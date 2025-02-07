import { ADDONS } from "@/core/schema/enchant/addons";
import type { InterfaceConfiguration } from "@/core/schema/primitive";

export const find: InterfaceConfiguration = {
    id: "enchant.find",
    section: { type: "translate", value: "tools.enchantments.section.find" },
    components: [
        {
            type: "Section",
            title: {
                type: "translate",
                value: "tools.enchantments.section.find"
            },
            id: "behaviour",
            children: [
                {
                    type: "Grid",
                    size: "350px",
                    children: [
                        {
                            type: "Iteration",
                            values: [
                                {
                                    type: "object",
                                    values: [
                                        {
                                            title: "tools.enchantments.section.find.components.enchantingTable.title",
                                            description: "tools.enchantments.section.find.components.enchantingTable.description",
                                            image: "/images/features/block/enchanting_table.webp",
                                            tag: "#minecraft:in_enchanting_table",
                                            lock_value: "#minecraft:non_treasure"
                                        },
                                        {
                                            title: "tools.enchantments.section.find.components.mobEquipment.title",
                                            description: "tools.enchantments.section.find.components.mobEquipment.description",
                                            image: "/images/features/entity/zombie.webp",
                                            tag: "#minecraft:on_mob_spawn_equipment",
                                            lock_value: "#minecraft:non_treasure"
                                        },
                                        {
                                            title: "tools.enchantments.section.find.components.lootInChests.title",
                                            description: "tools.enchantments.section.find.components.lootInChests.description",
                                            image: "/images/features/block/chest.webp",
                                            tag: "#minecraft:on_random_loot",
                                            lock_value: "#minecraft:non_treasure"
                                        },
                                        {
                                            title: "tools.enchantments.section.find.components.tradeable.title",
                                            description: "tools.enchantments.section.find.components.tradeable.description",
                                            image: "/images/features/item/enchanted_book.webp",
                                            tag: "#minecraft:on_traded_equipment",
                                            lock_value: "#minecraft:non_treasure"
                                        },
                                        {
                                            title: "tools.enchantments.section.find.components.tradeableEquipment.title",
                                            description: "tools.enchantments.section.find.components.tradeableEquipment.description",
                                            image: "/images/features/item/enchanted_item.webp",
                                            tag: "#minecraft:tradeable",
                                            lock_value: "#minecraft:non_treasure"
                                        },
                                        {
                                            title: "tools.enchantments.section.find.components.priceDoubled.title",
                                            description: "tools.enchantments.section.find.components.priceDoubled.description",
                                            image: "/images/features/title/doubled.webp",
                                            tag: "#minecraft:double_trade_price",
                                            lock_value: "#minecraft:treasure"
                                        }
                                    ]
                                }
                            ],
                            template: {
                                type: "Slot",
                                title: {
                                    type: "translate",
                                    value: { type: "get_value_from_context", key: "title" }
                                },
                                description: {
                                    type: "translate",
                                    value: { type: "get_value_from_context", key: "description" }
                                },
                                image: { type: "get_value_from_context", key: "image" },
                                action: {
                                    type: "toggle_value_in_list",
                                    field: "tags",
                                    value: { type: "get_value_from_context", key: "tag" }
                                },
                                lock: [
                                    {
                                        text: {
                                            type: "translate",
                                            value: "tools.enchantments.section.technical.components.reason"
                                        },
                                        condition: {
                                            condition: "contains",
                                            field: "tags",
                                            values: [{ type: "get_value_from_context", key: "lock_value" }]
                                        }
                                    },
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
            type: "Section",
            title: {
                type: "translate",
                value: "tools.enchantments.section.addons.description"
            },
            id: "addons",
            children: [
                {
                    type: "Reveal",
                    elements: ADDONS
                }
            ]
        }
    ]
};
