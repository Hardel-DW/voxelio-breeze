import { bench, describe } from "vitest";
import { VoxelToLootDataDriven } from "@/core/schema/loot/Compiler";
import { LootDataDrivenToVoxelFormat } from "@/core/schema/loot/Parser";
import type { MinecraftLootTable } from "@/core/schema/loot/types";
import type { DataDrivenRegistryElement } from "@/core/Element";
import { DATA_DRIVEN_TEMPLATE_LOOT_TABLE } from "@test/template/datadriven";
import { VOXEL_TEMPLATE_LOOT_TABLE } from "@test/template/voxel";

describe("LootTable Performance", () => {
    const simpleLootTable = DATA_DRIVEN_TEMPLATE_LOOT_TABLE[0];
    const complexLootTable = DATA_DRIVEN_TEMPLATE_LOOT_TABLE[1];
    const multiPoolLootTable = DATA_DRIVEN_TEMPLATE_LOOT_TABLE[2];

    const simpleVoxel = VOXEL_TEMPLATE_LOOT_TABLE[0].data;
    const complexVoxel = VOXEL_TEMPLATE_LOOT_TABLE[1].data;
    const multiPoolVoxel = VOXEL_TEMPLATE_LOOT_TABLE[2].data;

    // Create a large loot table for stress testing
    const largeLootTable: DataDrivenRegistryElement<MinecraftLootTable> = {
        identifier: { namespace: "test", registry: "loot_table", resource: "large_test" },
        data: {
            type: "minecraft:chest",
            pools: Array.from({ length: 10 }, (_, poolIndex) => ({
                rolls: { min: 1, max: 5 },
                bonus_rolls: { min: 0, max: 2 },
                entries: Array.from({ length: 20 }, (_, entryIndex) => ({
                    type: "minecraft:item",
                    name: `minecraft:item_${poolIndex}_${entryIndex}`,
                    weight: Math.floor(Math.random() * 100) + 1,
                    quality: Math.floor(Math.random() * 10),
                    functions: [
                        {
                            function: "minecraft:set_count",
                            count: { min: 1, max: 3 }
                        },
                        {
                            function: "minecraft:enchant_randomly"
                        }
                    ],
                    conditions: [
                        {
                            condition: "minecraft:random_chance",
                            chance: 0.5
                        }
                    ]
                }))
            }))
        }
    };

    // Create nested group structure for complexity testing
    const nestedGroupLootTable: DataDrivenRegistryElement<MinecraftLootTable> = {
        identifier: { namespace: "test", registry: "loot_table", resource: "nested_test" },
        data: {
            type: "minecraft:entity",
            pools: [
                {
                    rolls: 1,
                    entries: [
                        {
                            type: "minecraft:alternatives",
                            children: Array.from({ length: 5 }, (_, i) => ({
                                type: "minecraft:group",
                                children: Array.from({ length: 10 }, (_, j) => ({
                                    type: "minecraft:alternatives",
                                    children: Array.from({ length: 3 }, (_, k) => ({
                                        type: "minecraft:item",
                                        name: `minecraft:nested_item_${i}_${j}_${k}`,
                                        weight: 10
                                    }))
                                }))
                            }))
                        }
                    ]
                }
            ]
        }
    };

    describe("Parsing Performance", () => {
        bench("Parse simple loot table", () => {
            LootDataDrivenToVoxelFormat({ element: simpleLootTable });
        });

        bench("Parse complex loot table", () => {
            LootDataDrivenToVoxelFormat({ element: complexLootTable });
        });

        bench("Parse multi-pool loot table", () => {
            LootDataDrivenToVoxelFormat({ element: multiPoolLootTable });
        });

        bench("Parse large loot table (10 pools, 200 items)", () => {
            LootDataDrivenToVoxelFormat({ element: largeLootTable });
        });

        bench("Parse deeply nested groups", () => {
            LootDataDrivenToVoxelFormat({ element: nestedGroupLootTable });
        });
    });

    describe("Compilation Performance", () => {
        bench("Compile simple loot table", () => {
            VoxelToLootDataDriven(simpleVoxel, "loot_table");
        });

        bench("Compile complex loot table", () => {
            VoxelToLootDataDriven(complexVoxel, "loot_table");
        });

        bench("Compile multi-pool loot table", () => {
            VoxelToLootDataDriven(multiPoolVoxel, "loot_table");
        });

        bench("Compile large loot table", () => {
            const largeVoxel = LootDataDrivenToVoxelFormat({ element: largeLootTable });
            VoxelToLootDataDriven(largeVoxel, "loot_table", largeLootTable.data);
        });

        bench("Compile deeply nested groups", () => {
            const nestedVoxel = LootDataDrivenToVoxelFormat({ element: nestedGroupLootTable });
            VoxelToLootDataDriven(nestedVoxel, "loot_table", nestedGroupLootTable.data);
        });
    });

    describe("Round-trip Performance", () => {
        bench("Round-trip simple loot table", () => {
            const voxel = LootDataDrivenToVoxelFormat({ element: simpleLootTable });
            VoxelToLootDataDriven(voxel, "loot_table", simpleLootTable.data);
        });

        bench("Round-trip complex loot table", () => {
            const voxel = LootDataDrivenToVoxelFormat({ element: complexLootTable });
            VoxelToLootDataDriven(voxel, "loot_table", complexLootTable.data);
        });

        bench("Round-trip large loot table", () => {
            const voxel = LootDataDrivenToVoxelFormat({ element: largeLootTable });
            VoxelToLootDataDriven(voxel, "loot_table", largeLootTable.data);
        });
    });

    describe("Memory Usage Simulation", () => {
        bench("Parse 100 simple loot tables", () => {
            for (let i = 0; i < 100; i++) {
                LootDataDrivenToVoxelFormat({ element: simpleLootTable });
            }
        });

        bench("Parse 50 complex loot tables", () => {
            for (let i = 0; i < 50; i++) {
                LootDataDrivenToVoxelFormat({ element: complexLootTable });
            }
        });

        bench("Parse 10 large loot tables", () => {
            for (let i = 0; i < 10; i++) {
                LootDataDrivenToVoxelFormat({ element: largeLootTable });
            }
        });
    });

    describe("Mod Compatibility Performance", () => {
        const modLootTable: DataDrivenRegistryElement<MinecraftLootTable> = {
            identifier: { namespace: "test", registry: "loot_table", resource: "mod_perf_test" },
            data: {
                type: "minecraft:chest",
                mod_table_field: "value",
                mod_complex_field: { nested: { data: [1, 2, 3] } },
                pools: [
                    {
                        rolls: 1,
                        mod_pool_field: true,
                        entries: Array.from({ length: 50 }, (_, i) => ({
                            type: `mod_${i % 5}:custom_entry`,
                            name: `mod:item_${i}`,
                            weight: 10,
                            mod_entry_field_1: `value_${i}`,
                            mod_entry_field_2: { complex: true, id: i },
                            mod_entry_field_3: Array.from({ length: 5 }, (_, j) => `array_${j}`)
                        }))
                    }
                ]
            }
        };

        bench("Parse loot table with mod fields", () => {
            LootDataDrivenToVoxelFormat({ element: modLootTable });
        });

        bench("Round-trip loot table with mod fields", () => {
            const voxel = LootDataDrivenToVoxelFormat({ element: modLootTable });
            VoxelToLootDataDriven(voxel, "loot_table", modLootTable.data);
        });
    });
});
