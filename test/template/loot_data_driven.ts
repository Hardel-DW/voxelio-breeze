import { downloadZip } from "@voxelio/zip";
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

export const lootTableFiles = {
    "data/test/loot_table/test.json": new TextEncoder().encode(JSON.stringify(completeLootTable, null, 2)),
    "data/test/loot_table/advanced.json": new TextEncoder().encode(JSON.stringify(advancedLootTable, null, 2)),
    "data/test/loot_table/ultimate.json": new TextEncoder().encode(JSON.stringify(ultimateTestLootTable, null, 2)),
    "pack.mcmeta": new TextEncoder().encode(JSON.stringify({ pack: { pack_format: 61, description: "lorem ipsum" } }, null, 2))
};

export const lootTableZipFile = createZipFile(lootTableFiles);
