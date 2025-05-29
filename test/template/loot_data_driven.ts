import { createZipFile } from "./datapack";

const completeLootTable = {
    pools: [
        {
            rolls: 0,
            entries: [
                {
                    type: "minecraft:item",
                    name: "minecraft:acacia_sapling"
                }
            ],
            functions: [
                {
                    function: "minecraft:set_count",
                    count: 2,
                    conditions: [
                        {
                            condition: "minecraft:value_check",
                            value: 1,
                            range: 0
                        }
                    ]
                }
            ],
            conditions: []
        }
    ],
    functions: [
        {
            function: "minecraft:enchant_with_levels",
            levels: 10
        }
    ],
    random_sequence: "minecraft:entities/wither_skeleton"
};

const advancedLootTable = {
    pools: [
        {
            rolls: 0,
            entries: [
                {
                    type: "minecraft:item",
                    name: "minecraft:acacia_sapling"
                },
                {
                    type: "minecraft:group",
                    children: [
                        {
                            type: "minecraft:tag",
                            name: "minecraft:bundles",
                            expand: true
                        }
                    ],
                    functions: [
                        {
                            function: "minecraft:set_attributes",
                            modifiers: [
                                {
                                    attribute: "minecraft:spawn_reinforcements",
                                    id: "0",
                                    amount: 0,
                                    operation: "add_value",
                                    slot: "mainhand"
                                }
                            ],
                            replace: false
                        }
                    ]
                }
            ],
            functions: [
                {
                    function: "minecraft:set_count",
                    count: 2,
                    conditions: [
                        {
                            condition: "minecraft:value_check",
                            value: 1,
                            range: 0
                        }
                    ]
                }
            ],
            conditions: []
        }
    ],
    functions: [
        {
            function: "minecraft:enchant_with_levels",
            levels: 10
        }
    ],
    random_sequence: "minecraft:entities/wither_skeleton"
};

const ultimateTestLootTable = {
    pools: [
        {
            rolls: 0,
            entries: [
                {
                    type: "minecraft:item",
                    name: "minecraft:acacia_sapling"
                },
                {
                    type: "minecraft:group",
                    children: [
                        {
                            type: "minecraft:tag",
                            name: "minecraft:bundles",
                            expand: true
                        }
                    ],
                    functions: []
                },
                {
                    type: "minecraft:loot_table",
                    value: "minecraft:blocks/acacia_wood"
                },
                {
                    type: "minecraft:empty"
                },
                {
                    type: "minecraft:alternatives",
                    children: [
                        {
                            type: "minecraft:group",
                            children: [
                                {
                                    type: "minecraft:tag",
                                    name: "minecraft:cherry_logs",
                                    expand: true,
                                    conditions: [
                                        {
                                            condition: "minecraft:value_check",
                                            value: 0,
                                            range: {}
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            functions: [
                {
                    function: "minecraft:set_count",
                    count: 2,
                    conditions: [
                        {
                            condition: "minecraft:value_check",
                            value: 1,
                            range: 0
                        }
                    ]
                }
            ],
            conditions: []
        }
    ],
    functions: [
        {
            function: "minecraft:enchant_with_levels",
            levels: 10
        }
    ],
    random_sequence: "minecraft:entities/wither_skeleton"
};

const finalBossOfLootTable = {
    pools: [
        {
            rolls: 1,
            bonus_rolls: {
                type: "minecraft:binomial",
                n: 1,
                p: {
                    type: "minecraft:enchantment_level",
                    amount: {
                        type: "minecraft:lookup",
                        values: [1, 1],
                        fallback: 1
                    }
                }
            },
            entries: [
                {
                    type: "minecraft:alternatives",
                    children: [
                        {
                            type: "minecraft:empty",
                            weight: 1,
                            quality: 10,
                            functions: [
                                {
                                    function: "minecraft:copy_name",
                                    source: "this"
                                }
                            ],
                            conditions: [
                                {
                                    condition: "minecraft:weather_check",
                                    raining: true,
                                    thundering: true
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "minecraft:dynamic",
                    name: "minecraft:sherds"
                },
                {
                    type: "minecraft:group",
                    children: [
                        {
                            type: "minecraft:empty"
                        }
                    ]
                },
                {
                    type: "minecraft:item",
                    name: "minecraft:acacia_sign"
                },
                {
                    type: "minecraft:item",
                    name: "minecraft:allium"
                },
                {
                    type: "minecraft:loot_table",
                    value: "minecraft:blocks/acacia_slab"
                },
                {
                    type: "minecraft:loot_table",
                    value: {
                        type: "minecraft:block",
                        pools: [
                            {
                                rolls: 1,
                                entries: []
                            }
                        ]
                    }
                },
                {
                    type: "minecraft:sequence",
                    children: [
                        {
                            type: "minecraft:group",
                            children: [
                                {
                                    type: "minecraft:alternatives",
                                    children: [
                                        {
                                            type: "minecraft:empty"
                                        },
                                        {
                                            type: "minecraft:item",
                                            name: "minecraft:allium"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "minecraft:tag",
                    name: "minecraft:buttons",
                    expand: true,
                    weight: 1,
                    quality: 10
                }
            ],
            functions: [
                {
                    function: "minecraft:apply_bonus",
                    enchantment: "minecraft:looting",
                    formula: "minecraft:ore_drops"
                }
            ],
            conditions: [
                {
                    condition: "minecraft:weather_check",
                    raining: true
                }
            ]
        },
        {
            rolls: 1,
            bonus_rolls: 1,
            entries: []
        }
    ],
    functions: [
        {
            function: "minecraft:apply_bonus",
            enchantment: "minecraft:luck_of_the_sea",
            formula: "minecraft:ore_drops"
        }
    ],
    random_sequence: "minecraft:entities/wither_skeleton"
};

export const lootTableFiles = {
    "data/test/loot_table/test.json": new TextEncoder().encode(JSON.stringify(completeLootTable, null, 2)),
    "data/test/loot_table/advanced.json": new TextEncoder().encode(JSON.stringify(advancedLootTable, null, 2)),
    "data/test/loot_table/ultimate.json": new TextEncoder().encode(JSON.stringify(ultimateTestLootTable, null, 2)),
    "data/test/loot_table/final_boss.json": new TextEncoder().encode(JSON.stringify(finalBossOfLootTable, null, 2)),
    "pack.mcmeta": new TextEncoder().encode(JSON.stringify({ pack: { pack_format: 61, description: "lorem ipsum" } }, null, 2))
};

export const lootTableZipFile = await createZipFile(lootTableFiles);
