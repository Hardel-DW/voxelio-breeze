import type { Compiler } from "@/core/engine/Compiler";
import { updateData } from "@/core/engine/actions";
import { VoxelToLootDataDriven } from "@/core/schema/loot/Compiler";
import { LootDataDrivenToVoxelFormat } from "@/core/schema/loot/Parser";
import type { LootTableProps, MinecraftLootTable } from "@/core/schema/loot/types";
import { DATA_DRIVEN_TEMPLATE_LOOT_TABLE } from "@test/template/datadriven";
import { VOXEL_TEMPLATE_LOOT_TABLE } from "@test/template/voxel";
import { describe, it, expect, beforeEach } from "vitest";

describe("LootTable Schema", () => {
    describe("Data Driven to Voxel Element", () => {
        const simpleLootTable = DATA_DRIVEN_TEMPLATE_LOOT_TABLE[0];
        const extremeLootTable = DATA_DRIVEN_TEMPLATE_LOOT_TABLE[1];
        const referenceLootTable = DATA_DRIVEN_TEMPLATE_LOOT_TABLE[2];

        describe("Should parse simple loot table", () => {
            let parsed: LootTableProps;

            beforeEach(() => {
                parsed = LootDataDrivenToVoxelFormat({ element: simpleLootTable });
            });

            it("should be defined", () => {
                expect(parsed).toBeDefined();
            });

            it("should have correct type", () => {
                expect(parsed.type).toBe("minecraft:entity");
            });

            it("should have one item", () => {
                expect(parsed.items).toHaveLength(1);
            });

            it("should have no groups", () => {
                expect(parsed.groups).toHaveLength(0);
            });

            it("should parse item correctly", () => {
                const item = parsed.items[0];
                expect(item.name).toBe("minecraft:experience_bottle");
                expect(item.poolIndex).toBe(0);
                expect(item.entryIndex).toBe(0);

                // Check that conditions are stored as complete objects
                expect(item.conditions).toHaveLength(1);
                expect(item.conditions?.[0]).toEqual({
                    condition: "minecraft:random_chance",
                    chance: 0.5
                });

                // Check that functions are stored as complete objects
                expect(item.functions).toHaveLength(1);
                expect(item.functions?.[0]).toEqual({
                    function: "minecraft:set_count",
                    count: {
                        min: 1,
                        max: 3
                    }
                });
            });
        });

        describe("Should parse complex nested groups", () => {
            let parsed: LootTableProps;

            beforeEach(() => {
                parsed = LootDataDrivenToVoxelFormat({ element: extremeLootTable });
            });

            it("should have correct items count", () => {
                expect(parsed.items).toHaveLength(2);
            });

            it("should have correct groups count", () => {
                expect(parsed.groups).toHaveLength(3);
            });

            it("should parse alternatives group", () => {
                const alternativesGroup = parsed.groups.find((g) => g.type === "alternatives");
                expect(alternativesGroup).toBeDefined();
                expect(alternativesGroup?.id).toBe("group_0");
            });

            it("should parse group type", () => {
                const groupType = parsed.groups.find((g) => g.type === "group");
                expect(groupType).toBeDefined();
                expect(groupType?.id).toBe("group_1");
            });

            it("should parse sequence group", () => {
                const sequenceGroup = parsed.groups.find((g) => g.type === "sequence");
                expect(sequenceGroup).toBeDefined();
                expect(sequenceGroup?.id).toBe("group_2");
                expect(sequenceGroup?.items).toContain("item_1");
            });

            it("should have random sequence", () => {
                expect(parsed.randomSequence).toBe("minecraft:entities/wither_skeleton");
            });
        });

        describe("Should parse multi-pool reference table", () => {
            let parsed: LootTableProps;

            beforeEach(() => {
                parsed = LootDataDrivenToVoxelFormat({ element: referenceLootTable });
            });

            it("should have three items in different pools", () => {
                expect(parsed.items).toHaveLength(3);
                expect(parsed.items[0].poolIndex).toBe(0);
                expect(parsed.items[1].poolIndex).toBe(1);
                expect(parsed.items[2].poolIndex).toBe(2);
            });

            it("should parse loot table references", () => {
                expect(parsed.items[0].name).toBe("yggdrasil:generic/equipment/ominous/item/sword");
                expect(parsed.items[1].name).toBe("yggdrasil:generic/equipment/ominous/item/helmet");
                expect(parsed.items[2].name).toBe("yggdrasil:generic/equipment/ominous/item/chestplate");
            });

            it("should have equipment type", () => {
                expect(parsed.type).toBe("minecraft:equipment");
            });
        });
    });

    describe("Voxel Element to Data Driven", () => {
        const simpleVoxelElement = VOXEL_TEMPLATE_LOOT_TABLE[0];
        const extremeVoxelElement = VOXEL_TEMPLATE_LOOT_TABLE[1];
        const referenceVoxelElement = VOXEL_TEMPLATE_LOOT_TABLE[2];

        describe("Should compile simple loot table", () => {
            let compiled: ReturnType<Compiler<LootTableProps, MinecraftLootTable>>;

            beforeEach(() => {
                compiled = VoxelToLootDataDriven(simpleVoxelElement.data, "loot_table");
            });

            it("should compile", () => {
                expect(compiled).toBeDefined();
            });

            it("should have correct type", () => {
                expect(compiled.element.data.type).toBe("minecraft:entity");
            });

            it("should have one pool", () => {
                expect(compiled.element.data.pools).toHaveLength(1);
            });

            it("should have one entry in pool", () => {
                expect(compiled.element.data.pools?.[0].entries).toHaveLength(1);
            });

            it("should have correct item entry", () => {
                const entry = compiled.element.data.pools?.[0].entries[0];
                expect(entry?.type).toBe("minecraft:item");
                expect(entry?.name).toBe("minecraft:experience_bottle");
            });
        });

        describe("Should compile complex nested groups", () => {
            let compiled: ReturnType<Compiler<LootTableProps, MinecraftLootTable>>;

            beforeEach(() => {
                compiled = VoxelToLootDataDriven(extremeVoxelElement.data, "loot_table");
            });

            it("should have correct random sequence", () => {
                expect(compiled.element.data.random_sequence).toBe("minecraft:entities/wither_skeleton");
            });

            it("should have one pool", () => {
                expect(compiled.element.data.pools).toHaveLength(1);
            });

            it("should recreate nested group structure", () => {
                const pool = compiled.element.data.pools?.[0];
                expect(pool?.entries).toHaveLength(1); // Only the top-level alternatives group

                // Check that the alternatives group contains nested structure
                const topLevelEntry = pool?.entries[0];
                expect(topLevelEntry?.type).toBe("minecraft:alternatives");
                expect(topLevelEntry?.children).toHaveLength(2); // dynamic + group
            });
        });

        describe("Should compile multi-pool reference table", () => {
            let compiled: ReturnType<Compiler<LootTableProps, MinecraftLootTable>>;

            beforeEach(() => {
                compiled = VoxelToLootDataDriven(referenceVoxelElement.data, "loot_table");
            });

            it("should have three pools", () => {
                expect(compiled.element.data.pools).toHaveLength(3);
            });

            it("should have loot_table entries", () => {
                const entries = compiled.element.data.pools?.map((p) => p.entries[0]);
                if (entries) {
                    for (const entry of entries) {
                        expect(entry.type).toBe("minecraft:loot_table");
                    }
                }
            });
        });

        describe("Should handle tags correctly", () => {
            it("should return empty tags array", () => {
                const compiled = VoxelToLootDataDriven(simpleVoxelElement.data, "loot_table");
                expect(compiled.tags).toEqual([]);
            });
        });
    });

    describe("Round-trip conversion", () => {
        it("should maintain data integrity for simple table", () => {
            const original = DATA_DRIVEN_TEMPLATE_LOOT_TABLE[0];
            const voxel = LootDataDrivenToVoxelFormat({ element: original });
            const compiled = VoxelToLootDataDriven(voxel, "loot_table", original);

            expect(compiled.element.data.type).toBe(original.data.type);
            expect(compiled.element.data.pools).toHaveLength(original.data.pools?.length || 0);
        });

        it("should maintain data integrity for complex table", () => {
            const original = DATA_DRIVEN_TEMPLATE_LOOT_TABLE[1];
            const voxel = LootDataDrivenToVoxelFormat({ element: original });
            const compiled = VoxelToLootDataDriven(voxel, "loot_table", original);

            expect(compiled.element.data.type).toBe(original.data.type);
            expect(compiled.element.data.random_sequence).toBe(original.data.random_sequence);
        });
    });

    describe("LootTable Actions through updateData", () => {
        let lootTable: LootTableProps;

        beforeEach(() => {
            lootTable = structuredClone(VOXEL_TEMPLATE_LOOT_TABLE[0].data);
        });

        it("should add loot item through updateData", () => {
            const action = {
                type: "add_loot_item" as const,
                field: "items",
                poolIndex: 0,
                item: {
                    name: "minecraft:diamond",
                    weight: 10,
                    quality: 5
                }
            };

            const result = updateData(action, lootTable, 1) as LootTableProps;

            expect(result).toBeDefined();
            expect(result.items).toHaveLength(2); // Original + new item
            expect(result.items[1].name).toBe("minecraft:diamond");
            expect(result.items[1].weight).toBe(10);
            expect(result.items[1].quality).toBe(5);
        });

        it("should remove loot item through updateData", () => {
            const action = {
                type: "remove_loot_item" as const,
                field: "items",
                itemId: "item_0"
            };

            const result = updateData(action, lootTable, 1) as LootTableProps;

            expect(result).toBeDefined();
            expect(result.items).toHaveLength(0);
        });

        it("should create loot group through updateData", () => {
            // First add another item
            const addAction = {
                type: "add_loot_item" as const,
                field: "items",
                poolIndex: 0,
                item: {
                    name: "minecraft:emerald",
                    weight: 5
                }
            };

            let result = updateData(addAction, lootTable, 1) as LootTableProps;

            // Then create a group with both items
            const groupAction = {
                type: "create_loot_group" as const,
                field: "groups",
                groupType: "alternatives" as const,
                itemIds: ["item_0", "item_1"],
                poolIndex: 0
            };

            result = updateData(groupAction, result, 1) as LootTableProps;

            expect(result).toBeDefined();
            expect(result.groups).toHaveLength(1);
            expect(result.groups[0].type).toBe("alternatives");
            expect(result.groups[0].items).toEqual(["item_0", "item_1"]);
        });

        it("should modify loot item through updateData", () => {
            const action = {
                type: "modify_loot_item" as const,
                field: "items",
                itemId: "item_0",
                property: "weight" as const,
                value: 50
            };

            const result = updateData(action, lootTable, 1) as LootTableProps;

            expect(result).toBeDefined();
            expect(result.items[0].weight).toBe(50);
        });

        it("should handle identical items with different properties", () => {
            // Add multiple diamonds with different properties
            const addDiamond1 = {
                type: "add_loot_item" as const,
                field: "items",
                poolIndex: 0,
                item: {
                    name: "minecraft:diamond",
                    weight: 1,
                    quality: 10,
                    conditions: ["minecraft:random_chance"],
                    functions: ["minecraft:set_count"]
                }
            };

            const addDiamond2 = {
                type: "add_loot_item" as const,
                field: "items",
                poolIndex: 0,
                item: {
                    name: "minecraft:diamond",
                    weight: 50,
                    quality: 0,
                    conditions: ["minecraft:killed_by_player"],
                    functions: ["minecraft:enchant_randomly"]
                }
            };

            const addDiamond3 = {
                type: "add_loot_item" as const,
                field: "items",
                poolIndex: 1,
                item: {
                    name: "minecraft:diamond",
                    weight: 25,
                    quality: 5
                    // No conditions/functions
                }
            };

            // Apply actions sequentially
            let result = updateData(addDiamond1, lootTable, 1) as LootTableProps;
            result = updateData(addDiamond2, result, 1) as LootTableProps;
            result = updateData(addDiamond3, result, 1) as LootTableProps;

            // Verify we have 4 items total (original + 3 diamonds)
            expect(result.items).toHaveLength(4);

            // Find all diamond items
            const diamonds = result.items.filter((item) => item.name === "minecraft:diamond");
            expect(diamonds).toHaveLength(3);

            // Verify each diamond has different properties
            const [diamond1, diamond2, diamond3] = diamonds;

            // Diamond 1: Rare treasure (weight 1, high quality)
            expect(diamond1.weight).toBe(1);
            expect(diamond1.quality).toBe(10);
            expect(diamond1.poolIndex).toBe(0);
            expect(diamond1.conditions).toContain("minecraft:random_chance");
            expect(diamond1.functions).toContain("minecraft:set_count");

            // Diamond 2: Common drop (weight 50, no quality)
            expect(diamond2.weight).toBe(50);
            expect(diamond2.quality).toBe(0);
            expect(diamond2.poolIndex).toBe(0);
            expect(diamond2.conditions).toContain("minecraft:killed_by_player");
            expect(diamond2.functions).toContain("minecraft:enchant_randomly");

            // Diamond 3: Different pool (weight 25, medium quality)
            expect(diamond3.weight).toBe(25);
            expect(diamond3.quality).toBe(5);
            expect(diamond3.poolIndex).toBe(1);
            expect(diamond3.conditions).toEqual([]); // Empty array, not undefined
            expect(diamond3.functions).toEqual([]); // Empty array, not undefined

            // Verify each has unique ID
            const diamondIds = diamonds.map((d) => d.id);
            expect(new Set(diamondIds).size).toBe(3); // All unique IDs

            // Create groups with different diamonds
            const createGroup1 = {
                type: "create_loot_group" as const,
                field: "groups",
                groupType: "alternatives" as const,
                itemIds: [diamond1.id, diamond2.id], // Rare vs common in same pool
                poolIndex: 0
            };

            const createGroup2 = {
                type: "create_loot_group" as const,
                field: "groups",
                groupType: "sequence" as const,
                itemIds: [diamond3.id], // Solo diamond in different pool
                poolIndex: 1
            };

            result = updateData(createGroup1, result, 1) as LootTableProps;
            result = updateData(createGroup2, result, 1) as LootTableProps;

            expect(result.groups).toHaveLength(2);

            // Verify groups contain correct diamonds
            const group1 = result.groups.find((g) => g.type === "alternatives");
            const group2 = result.groups.find((g) => g.type === "sequence");

            expect(group1?.items).toEqual([diamond1.id, diamond2.id]);
            expect(group1?.poolIndex).toBe(0);

            expect(group2?.items).toEqual([diamond3.id]);
            expect(group2?.poolIndex).toBe(1);
        });

        it("should compile identical items with different properties correctly", () => {
            // Create a loot table with multiple diamonds
            const lootTableWithDuplicates: LootTableProps = {
                identifier: { namespace: "test", registry: "loot_table", resource: "duplicate_diamonds" },
                type: "minecraft:chest",
                items: [
                    {
                        id: "item_0",
                        name: "minecraft:diamond",
                        weight: 1,
                        quality: 10,
                        poolIndex: 0,
                        entryIndex: 0,
                        conditions: ["minecraft:random_chance"],
                        functions: ["minecraft:set_count"],
                        entryType: "minecraft:item"
                    },
                    {
                        id: "item_1",
                        name: "minecraft:diamond",
                        weight: 50,
                        quality: 0,
                        poolIndex: 0,
                        entryIndex: 1,
                        conditions: ["minecraft:killed_by_player"],
                        functions: ["minecraft:enchant_randomly"],
                        entryType: "minecraft:item"
                    },
                    {
                        id: "item_2",
                        name: "minecraft:diamond",
                        weight: 25,
                        quality: 5,
                        poolIndex: 1,
                        entryIndex: 0,
                        conditions: [],
                        functions: [],
                        entryType: "minecraft:item"
                    }
                ],
                groups: [
                    {
                        id: "group_0",
                        type: "alternatives",
                        items: ["item_0", "item_1"],
                        poolIndex: 0,
                        entryIndex: 2
                    }
                ]
            };

            const compiled = VoxelToLootDataDriven(lootTableWithDuplicates, "loot_table");

            // Should have 2 pools
            expect(compiled.element.data.pools).toHaveLength(2);

            // Pool 0: alternatives group with 2 different diamonds
            const pool0 = compiled.element.data.pools?.[0];
            expect(pool0?.entries).toHaveLength(1); // Just the alternatives group

            const alternativesEntry = pool0?.entries[0];
            expect(alternativesEntry?.type).toBe("minecraft:alternatives");
            expect(alternativesEntry?.children).toHaveLength(2);

            // Check that both diamonds are preserved with their properties
            const child1 = alternativesEntry?.children?.[0];
            const child2 = alternativesEntry?.children?.[1];

            expect(child1?.type).toBe("minecraft:item");
            expect(child1?.name).toBe("minecraft:diamond");
            expect(child1?.weight).toBe(1);
            expect(child1?.quality).toBe(10);

            expect(child2?.type).toBe("minecraft:item");
            expect(child2?.name).toBe("minecraft:diamond");
            expect(child2?.weight).toBe(50);
            expect(child2?.quality).toBe(0);

            // Pool 1: single diamond with different properties
            const pool1 = compiled.element.data.pools?.[1];
            expect(pool1?.entries).toHaveLength(1);

            const soloEntry = pool1?.entries[0];
            expect(soloEntry?.type).toBe("minecraft:item");
            expect(soloEntry?.name).toBe("minecraft:diamond");
            expect(soloEntry?.weight).toBe(25);
            expect(soloEntry?.quality).toBe(5);
        });
    });
});
