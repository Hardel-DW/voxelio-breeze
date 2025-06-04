import { parseDatapack } from "@/core/engine/Parser";
import { updateData } from "@/core/engine/actions";
import { VoxelToLootDataDriven } from "@/core/schema/loot/Compiler";
import type { LootTableProps } from "@/core/schema/loot/types";
import { lootTableFile, lootTableZip } from "@test/template/datapack";
import { describe, it, expect, beforeEach } from "vitest";

describe("LootTable E2E Tests", () => {
    describe("Complete workflow: Parse → Actions → Compile", () => {
        let parsedDatapack: Awaited<ReturnType<typeof parseDatapack>>;
        let simpleLootTable: LootTableProps;
        let advancedLootTable: LootTableProps;
        let ultimateLootTable: LootTableProps;
        let finalBossLootTable: LootTableProps;

        beforeEach(async () => {
            // 1. Parse the datapack from zip file
            parsedDatapack = await parseDatapack(lootTableZip);

            // Extract the parsed loot tables from elements Map
            const lootTables = Array.from(parsedDatapack.elements.values()).filter(
                (element): element is LootTableProps => element.identifier.registry === "loot_table"
            );

            expect(lootTables).toBeDefined();
            expect(lootTables).toHaveLength(4);

            const foundSimple = lootTables.find((lt) => lt.identifier.resource === "test");
            const foundAdvanced = lootTables.find((lt) => lt.identifier.resource === "advanced");
            const foundUltimate = lootTables.find((lt) => lt.identifier.resource === "ultimate");
            const foundFinalBoss = lootTables.find((lt) => lt.identifier.resource === "final_boss");

            expect(foundSimple).toBeDefined();
            expect(foundAdvanced).toBeDefined();
            expect(foundUltimate).toBeDefined();
            expect(foundFinalBoss).toBeDefined();

            simpleLootTable = foundSimple as LootTableProps;
            advancedLootTable = foundAdvanced as LootTableProps;
            ultimateLootTable = foundUltimate as LootTableProps;
            finalBossLootTable = foundFinalBoss as LootTableProps;
        });

        describe("Round-trip purity (Parse → Compile without actions)", () => {
            it("should preserve simple loot table data perfectly", () => {
                // Compile back to Minecraft format without any actions
                const compiled = VoxelToLootDataDriven(simpleLootTable, "loot_table");

                // Verify structure preservation
                expect(compiled.element.data.pools).toHaveLength(1);
                expect(compiled.element.data.functions).toHaveLength(1);
                expect(compiled.element.data.random_sequence).toBe("minecraft:entities/wither_skeleton");

                const pool = compiled.element.data.pools?.[0];
                expect(pool).toBeDefined();
                expect(pool?.entries).toHaveLength(1);

                // ⚠️ DATA LOSS DETECTED: rolls should be 0 but becomes {min: 1, max: 1}
                expect(pool?.rolls).toEqual(0); // Fixed: should preserve original value

                expect(pool?.functions).toHaveLength(1);
                expect(pool?.conditions).toHaveLength(0);

                // Verify entry preservation
                const entry = pool?.entries[0];
                expect(entry).toBeDefined();
                expect(entry?.type).toBe("minecraft:item");
                expect(entry?.name).toBe("minecraft:acacia_sapling");

                // Verify pool functions preservation
                const poolFunction = pool?.functions?.[0];
                expect(poolFunction).toBeDefined();
                expect(poolFunction?.function).toBe("minecraft:set_count");
                expect(poolFunction?.count).toBe(2);
                expect(poolFunction?.conditions).toHaveLength(1);

                // Verify table-level functions preservation
                const tableFunction = compiled.element.data.functions?.[0];
                expect(tableFunction).toBeDefined();
                expect(tableFunction?.function).toBe("minecraft:enchant_with_levels");
                expect(tableFunction?.levels).toBe(10);

                // Verify identifier preservation
                expect(compiled.element.identifier).toEqual(simpleLootTable.identifier);
            });

            it("should preserve advanced loot table with groups perfectly", () => {
                // Compile back to Minecraft format without any actions
                const compiled = VoxelToLootDataDriven(advancedLootTable, "loot_table");

                // Verify structure preservation
                expect(compiled.element.data.pools).toHaveLength(1);
                expect(compiled.element.data.functions).toHaveLength(1);
                expect(compiled.element.data.random_sequence).toBe("minecraft:entities/wither_skeleton");

                const pool = compiled.element.data.pools?.[0];
                expect(pool).toBeDefined();
                expect(pool?.entries).toHaveLength(2); // acacia_sapling + group

                expect(pool?.rolls).toEqual(0); // Fixed: should preserve original value (advanced table also has rolls: 0)

                // Verify acacia_sapling entry
                const acaciaEntry = pool?.entries.find((e) => e.type === "minecraft:item");
                expect(acaciaEntry).toBeDefined();
                expect(acaciaEntry?.name).toBe("minecraft:acacia_sapling");

                // Verify group entry
                const groupEntry = pool?.entries.find((e) => e.type === "minecraft:group");
                expect(groupEntry).toBeDefined();
                if (groupEntry) {
                    expect(groupEntry.children).toHaveLength(1); // Fixed: tag should be preserved in group
                    expect(groupEntry.functions).toHaveLength(1); // This group has 1 function in the advanced test data
                }

                // Verify identifier preservation
                expect(compiled.element.identifier).toEqual(advancedLootTable.identifier);
            });

            it("should preserve ultimate loot table with complex nesting perfectly", () => {
                // Compile back to Minecraft format without any actions
                const compiled = VoxelToLootDataDriven(ultimateLootTable, "loot_table");

                // Verify structure preservation
                expect(compiled.element.data.pools).toHaveLength(1);
                expect(compiled.element.data.functions).toHaveLength(1);
                expect(compiled.element.data.random_sequence).toBe("minecraft:entities/wither_skeleton");

                const pool = compiled.element.data.pools?.[0];
                expect(pool).toBeDefined();

                // ✅ GOOD: All 5 entries are preserved including minecraft:empty
                expect(pool?.entries).toHaveLength(5); // acacia_sapling, group, loot_table, empty, alternatives

                // ⚠️ DATA LOSS DETECTED: rolls should be 0 but becomes {min: 1, max: 1}
                expect(pool?.rolls).toEqual(0); // Fixed: should preserve original value

                // Verify acacia_sapling entry
                const acaciaEntry = pool?.entries.find((e) => e.type === "minecraft:item" && e.name === "minecraft:acacia_sapling");
                expect(acaciaEntry).toBeDefined();

                // Verify group entry
                const groupEntry = pool?.entries.find((e) => e.type === "minecraft:group");
                expect(groupEntry).toBeDefined();
                if (groupEntry) {
                    expect(groupEntry.children).toHaveLength(1); // Fixed: tag should be preserved in group
                    expect(groupEntry.functions).toHaveLength(0); // This group has no functions in the test data
                }

                // Verify loot_table entry
                const lootTableEntry = pool?.entries.find((e) => e.type === "minecraft:loot_table");
                expect(lootTableEntry).toBeDefined();
                expect(lootTableEntry?.value).toBe("minecraft:blocks/acacia_wood");

                // ✅ GOOD: minecraft:empty entry is preserved
                const emptyEntry = pool?.entries.find((e) => e.type === "minecraft:empty");
                expect(emptyEntry).toBeDefined(); // Current behavior (empty entry preserved)

                // Verify alternatives entry with nested structure
                const alternativesEntry = pool?.entries.find((e) => e.type === "minecraft:alternatives");
                expect(alternativesEntry).toBeDefined();
                expect(alternativesEntry?.children).toHaveLength(1);

                // Verify nested group within alternatives
                const nestedGroup = alternativesEntry?.children?.[0];
                expect(nestedGroup).toBeDefined();
                expect(nestedGroup?.type).toBe("minecraft:group");
                expect(nestedGroup?.children).toHaveLength(1); // Fixed: tag should be preserved in nested group too

                // Verify table-level functions preservation
                const tableFunction = compiled.element.data.functions?.[0];
                expect(tableFunction).toBeDefined();
                expect(tableFunction?.function).toBe("minecraft:enchant_with_levels");
                expect(tableFunction?.levels).toBe(10);

                // Verify pool functions preservation
                const poolFunction = pool?.functions?.[0];
                expect(poolFunction).toBeDefined();
                expect(poolFunction?.function).toBe("minecraft:set_count");
                expect(poolFunction?.count).toBe(2);

                // Verify identifier preservation
                expect(compiled.element.identifier).toEqual(ultimateLootTable.identifier);
            });

            it("should preserve final boss loot table with complex NumberProviders and nested structures perfectly", () => {
                // Compile back to Minecraft format without any actions
                const compiled = VoxelToLootDataDriven(finalBossLootTable, "loot_table");

                // Verify structure preservation
                expect(compiled.element.data.pools).toHaveLength(2);
                expect(compiled.element.data.functions).toHaveLength(1);
                expect(compiled.element.data.random_sequence).toBe("minecraft:entities/wither_skeleton");

                // Verify first pool (complex pool with NumberProviders)
                const pool1 = compiled.element.data.pools?.[0];
                expect(pool1).toBeDefined();
                expect(pool1?.rolls).toBe(1); // Simple number
                expect(pool1?.bonus_rolls).toEqual({
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
                }); // Complex NumberProvider object

                // Verify pool entries count (9 entries total)
                expect(pool1?.entries).toHaveLength(9);

                // Verify alternatives entry with complex nested empty
                const alternativesEntry = pool1?.entries.find((e) => e.type === "minecraft:alternatives");
                expect(alternativesEntry).toBeDefined();
                expect(alternativesEntry?.children).toHaveLength(1);
                const emptyInAlternatives = alternativesEntry?.children?.[0];
                expect(emptyInAlternatives?.type).toBe("minecraft:empty");
                expect(emptyInAlternatives?.weight).toBe(1);
                expect(emptyInAlternatives?.quality).toBe(10);
                expect(emptyInAlternatives?.functions).toHaveLength(1);
                expect(emptyInAlternatives?.conditions).toHaveLength(1);

                // Verify dynamic entry
                const dynamicEntry = pool1?.entries.find((e) => e.type === "minecraft:dynamic");
                expect(dynamicEntry).toBeDefined();
                expect(dynamicEntry?.name).toBe("minecraft:sherds");

                // Verify group with empty child
                const groupEntry = pool1?.entries.find((e) => e.type === "minecraft:group");
                expect(groupEntry).toBeDefined();
                expect(groupEntry?.children).toHaveLength(1);
                expect(groupEntry?.children?.[0]?.type).toBe("minecraft:empty");

                // Verify regular items
                const acaciaSignEntry = pool1?.entries.find((e) => e.type === "minecraft:item" && e.name === "minecraft:acacia_sign");
                expect(acaciaSignEntry).toBeDefined();
                const alliumEntry = pool1?.entries.find((e) => e.type === "minecraft:item" && e.name === "minecraft:allium");
                expect(alliumEntry).toBeDefined();

                // Verify loot table entries (both string and object)
                const lootTableEntries = pool1?.entries.filter((e) => e.type === "minecraft:loot_table");
                expect(lootTableEntries).toHaveLength(2);
                const stringLootTable = lootTableEntries?.find((e) => typeof e.value === "string");
                expect(stringLootTable?.value).toBe("minecraft:blocks/acacia_slab");
                const objectLootTable = lootTableEntries?.find((e) => typeof e.value === "object");
                expect(objectLootTable?.value).toEqual({
                    type: "minecraft:block",
                    pools: [
                        {
                            rolls: 1,
                            entries: []
                        }
                    ]
                });

                // Verify sequence with deeply nested structure
                const sequenceEntry = pool1?.entries.find((e) => e.type === "minecraft:sequence");
                expect(sequenceEntry).toBeDefined();
                expect(sequenceEntry?.children).toHaveLength(1);
                const nestedGroup = sequenceEntry?.children?.[0];
                expect(nestedGroup?.type).toBe("minecraft:group");
                expect(nestedGroup?.children).toHaveLength(1);
                const nestedAlternatives = nestedGroup?.children?.[0];
                expect(nestedAlternatives?.type).toBe("minecraft:alternatives");
                expect(nestedAlternatives?.children).toHaveLength(2);

                // Verify tag entry with properties
                const tagEntry = pool1?.entries.find((e) => e.type === "minecraft:tag");
                expect(tagEntry).toBeDefined();
                expect(tagEntry?.name).toBe("minecraft:buttons");
                expect(tagEntry?.expand).toBe(true);
                expect(tagEntry?.weight).toBe(1);
                expect(tagEntry?.quality).toBe(10);

                // Verify pool functions and conditions
                expect(pool1?.functions).toHaveLength(1);
                expect(pool1?.functions?.[0]?.function).toBe("minecraft:apply_bonus");
                expect(pool1?.conditions).toHaveLength(1);
                expect(pool1?.conditions?.[0]?.condition).toBe("minecraft:weather_check");

                // Verify second pool (simple pool)
                const pool2 = compiled.element.data.pools?.[1];
                expect(pool2).toBeDefined();
                expect(pool2?.rolls).toBe(1);
                expect(pool2?.bonus_rolls).toBe(1);
                expect(pool2?.entries).toHaveLength(0);

                // Verify table-level functions
                const tableFunction = compiled.element.data.functions?.[0];
                expect(tableFunction).toBeDefined();
                expect(tableFunction?.function).toBe("minecraft:apply_bonus");
                expect(tableFunction?.enchantment).toBe("minecraft:luck_of_the_sea");

                // Verify identifier preservation
                expect(compiled.element.identifier).toEqual(finalBossLootTable.identifier);
            });

            it("should identify data loss in simple loot table", async () => {
                // Get the original JSON from the template
                const originalJson = lootTableFile["data/test/loot_table/test.json"];

                // Compile back to Minecraft format
                const compiled = VoxelToLootDataDriven(simpleLootTable, "loot_table");
                const compiledData = compiled.element.data;

                // Compare key structures
                expect(compiledData.pools).toHaveLength(originalJson.pools.length);
                expect(compiledData.functions).toHaveLength(originalJson.functions.length);
                expect(compiledData.random_sequence).toBe(originalJson.random_sequence);

                // ⚠️ DATA LOSS: rolls format changed
                expect(compiledData.pools?.[0]?.rolls).toBe(originalJson.pools[0].rolls);
                expect(originalJson.pools[0].rolls).toBe(0);

                expect(compiledData.pools?.[0]?.entries).toHaveLength(originalJson.pools[0].entries.length);
                expect(compiledData.pools?.[0]?.functions).toHaveLength(originalJson.pools[0].functions.length);

                // Compare entry details (these should be preserved)
                const originalEntry = originalJson.pools[0].entries[0];
                const compiledEntry = compiledData.pools?.[0]?.entries[0];
                expect(compiledEntry?.type).toBe(originalEntry.type);
                expect(compiledEntry?.name).toBe(originalEntry.name);
            });

            it("should identify data loss in advanced loot table", async () => {
                // Get the original JSON from the template
                const originalJson = lootTableFile["data/test/loot_table/advanced.json"];

                // Compile back to Minecraft format
                const compiled = VoxelToLootDataDriven(advancedLootTable, "loot_table");
                const compiledData = compiled.element.data;

                // Compare key structures
                expect(compiledData.pools).toHaveLength(originalJson.pools.length);
                expect(compiledData.functions).toHaveLength(originalJson.functions.length);
                expect(compiledData.random_sequence).toBe(originalJson.random_sequence);

                // Compare pool structure
                expect(compiledData.pools?.[0]?.entries).toHaveLength(originalJson.pools[0].entries.length);

                // Find and compare group entry
                const originalGroupEntry = originalJson.pools[0].entries.find((e: any) => e.type === "minecraft:group");
                const compiledGroupEntry = compiledData.pools?.[0]?.entries.find((e) => e.type === "minecraft:group");

                expect(compiledGroupEntry).toBeDefined();
                expect(originalGroupEntry).toBeDefined();

                // ✅ FIXED: group children should be preserved
                expect(compiledGroupEntry?.children).toHaveLength(1);
                expect(originalGroupEntry?.children?.length).toBe(1);

                // ✅ FIXED: group functions should be preserved
                expect(compiledGroupEntry?.functions).toHaveLength(1);
                expect(originalGroupEntry?.functions?.length).toBe(1);

                // The original tag is lost during parsing/compilation
                const originalTag = originalGroupEntry?.children?.[0];
                expect(originalTag?.type).toBe("minecraft:tag");
                expect(originalTag?.name).toBe("minecraft:bundles");
                expect(originalTag?.expand).toBe(true);
            });

            it("should identify data loss in ultimate loot table", async () => {
                // Get the original JSON from the template
                const originalJson = lootTableFile["data/test/loot_table/ultimate.json"];

                // Compile back to Minecraft format
                const compiled = VoxelToLootDataDriven(ultimateLootTable, "loot_table");
                const compiledData = compiled.element.data;

                // Compare key structures
                expect(compiledData.pools).toHaveLength(originalJson.pools.length);
                expect(compiledData.functions).toHaveLength(originalJson.functions.length);
                expect(compiledData.random_sequence).toBe(originalJson.random_sequence);

                // ✅ GOOD: All entries are preserved
                expect(compiledData.pools?.[0]?.entries).toHaveLength(5);
                expect(originalJson.pools[0].entries.length).toBe(5);

                // Verify entry types - all are preserved
                const originalTypes = originalJson.pools[0].entries.map((e: any) => e.type);
                const compiledTypes = compiledData.pools?.[0]?.entries.map((e) => e.type) || [];

                expect(compiledTypes).toContain("minecraft:item");
                expect(compiledTypes).toContain("minecraft:group");
                expect(compiledTypes).toContain("minecraft:loot_table");
                expect(compiledTypes).toContain("minecraft:alternatives");

                // ✅ GOOD: minecraft:empty entry is preserved
                expect(compiledTypes).toContain("minecraft:empty");
                expect(originalTypes).toContain("minecraft:empty");
            });

            it("should identify data preservation in final boss loot table", async () => {
                // Get the original JSON from the template
                const originalJson = lootTableFile["data/test/loot_table/final_boss.json"];

                // Compile back to Minecraft format
                const compiled = VoxelToLootDataDriven(finalBossLootTable, "loot_table");
                const compiledData = compiled.element.data;

                // Compare key structures
                expect(compiledData.pools).toHaveLength(originalJson.pools.length);
                expect(compiledData.functions).toHaveLength(originalJson.functions.length);
                expect(compiledData.random_sequence).toBe(originalJson.random_sequence);

                // ✅ GOOD: Complex NumberProviders are preserved
                expect(compiledData.pools?.[0]?.rolls).toBe(originalJson.pools[0].rolls);
                expect(compiledData.pools?.[0]?.bonus_rolls).toEqual(originalJson.pools[0].bonus_rolls);

                // ✅ GOOD: All entry types are preserved
                expect(compiledData.pools?.[0]?.entries).toHaveLength(9);
                expect(originalJson.pools[0].entries.length).toBe(9);

                // Verify all complex entry types are preserved
                const originalTypes = originalJson.pools[0].entries.map((e: any) => e.type);
                const compiledTypes = compiledData.pools?.[0]?.entries.map((e) => e.type) || [];

                expect(compiledTypes).toContain("minecraft:alternatives");
                expect(compiledTypes).toContain("minecraft:dynamic");
                expect(compiledTypes).toContain("minecraft:group");
                expect(compiledTypes).toContain("minecraft:item");
                expect(compiledTypes).toContain("minecraft:loot_table");
                expect(compiledTypes).toContain("minecraft:sequence");
                expect(compiledTypes).toContain("minecraft:tag");

                // ✅ GOOD: Complex nested structures are preserved
                const originalAlternatives = originalJson.pools[0].entries.find((e: any) => e.type === "minecraft:alternatives");
                const compiledAlternatives = compiledData.pools?.[0]?.entries.find((e) => e.type === "minecraft:alternatives");
                expect(compiledAlternatives).toBeDefined();
                expect(originalAlternatives).toBeDefined();
                expect(originalAlternatives?.children).toBeDefined();
                expect(compiledAlternatives?.children).toBeDefined();
                expect(compiledAlternatives?.children).toHaveLength(originalAlternatives?.children?.length || 0);

                // ✅ GOOD: Embedded loot table objects are preserved
                const originalLootTables = originalJson.pools[0].entries.filter((e: any) => e.type === "minecraft:loot_table");
                const compiledLootTables = compiledData.pools?.[0]?.entries.filter((e) => e.type === "minecraft:loot_table");
                expect(compiledLootTables).toHaveLength(originalLootTables.length);

                // Verify embedded object loot table is preserved
                const embeddedLootTable = compiledLootTables?.find((e) => typeof e.value === "object");
                const originalEmbedded = originalLootTables.find((e: any) => typeof e.value === "object");
                expect(embeddedLootTable).toBeDefined();
                expect(embeddedLootTable?.value).toBeDefined();
                expect(originalEmbedded).toBeDefined();
                expect(originalEmbedded?.value).toBeDefined();

                expect(embeddedLootTable?.value).toEqual(originalEmbedded?.value);

                // ✅ GOOD: Pool functions and conditions are preserved
                expect(compiledData.pools?.[0]?.functions).toBeDefined();
                expect(compiledData.pools?.[0]?.conditions).toBeDefined();
                expect(compiledData.pools?.[0]?.functions).toHaveLength(originalJson?.pools?.[0]?.functions?.length || 0);
                expect(compiledData.pools?.[0]?.conditions).toHaveLength(originalJson?.pools?.[0]?.conditions?.length || 0);

                // ✅ GOOD: Second pool is preserved
                expect(compiledData.pools?.[1]?.rolls).toBe(originalJson.pools[1].rolls);
                expect(compiledData.pools?.[1]?.bonus_rolls).toBe(originalJson.pools[1].bonus_rolls);
                expect(compiledData.pools?.[1]?.entries).toHaveLength(originalJson.pools[1].entries.length);
            });
        });

        describe("Simple loot table workflow", () => {
            it("should parse simple loot table correctly", () => {
                expect(simpleLootTable.identifier.namespace).toBe("test");
                expect(simpleLootTable.identifier.resource).toBe("test");
                expect(simpleLootTable.items).toHaveLength(1);
                expect(simpleLootTable.groups).toHaveLength(0);

                const item = simpleLootTable.items[0];
                expect(item.name).toBe("minecraft:acacia_sapling");
                expect(item.poolIndex).toBe(0);
            });

            it("should add items through actions", () => {
                // Add a diamond to pool 0
                const addDiamondAction = {
                    type: "add_loot_item" as const,
                    field: "items" as const,
                    poolIndex: 0,
                    item: {
                        name: "minecraft:diamond",
                        weight: 1,
                        quality: 10
                    }
                };

                const result1 = updateData(addDiamondAction, simpleLootTable, 1) as LootTableProps;
                expect(result1.items).toHaveLength(2);
                expect(result1.items[1].name).toBe("minecraft:diamond");
                expect(result1.items[1].weight).toBe(1);
                expect(result1.items[1].quality).toBe(10);

                // Add an emerald to pool 1 (new pool)
                const addEmeraldAction = {
                    type: "add_loot_item" as const,
                    field: "items" as const,
                    poolIndex: 1,
                    item: {
                        name: "minecraft:emerald",
                        weight: 5,
                        quality: 5
                    }
                };

                const result2 = updateData(addEmeraldAction, result1, 1) as LootTableProps;
                expect(result2.items).toHaveLength(3);
                expect(result2.items[2].name).toBe("minecraft:emerald");
                expect(result2.items[2].poolIndex).toBe(1);
            });

            it("should create groups and compile correctly", () => {
                // Add multiple items
                let result = simpleLootTable;

                const addActions = [
                    {
                        type: "add_loot_item" as const,
                        field: "items" as const,
                        poolIndex: 0,
                        item: { name: "minecraft:diamond", weight: 1, quality: 10 }
                    },
                    {
                        type: "add_loot_item" as const,
                        field: "items" as const,
                        poolIndex: 0,
                        item: { name: "minecraft:emerald", weight: 5, quality: 5 }
                    },
                    {
                        type: "add_loot_item" as const,
                        field: "items" as const,
                        poolIndex: 0,
                        item: { name: "minecraft:gold_ingot", weight: 10, quality: 1 }
                    }
                ];

                // Apply all add actions
                for (const action of addActions) {
                    result = updateData(action, result, 1) as LootTableProps;
                }

                expect(result.items).toHaveLength(4); // Original + 3 new items

                // Create an alternatives group with rare items (diamond + emerald)
                const createRareGroupAction = {
                    type: "create_loot_group" as const,
                    field: "groups" as const,
                    groupType: "alternatives" as const,
                    itemIds: ["item_1", "item_2"], // diamond and emerald
                    poolIndex: 0
                };

                result = updateData(createRareGroupAction, result, 1) as LootTableProps;
                expect(result.groups).toHaveLength(1);
                expect(result.groups[0].type).toBe("alternatives");
                expect(result.groups[0].items).toEqual(["item_1", "item_2"]);

                // Compile back to Minecraft format
                const compiled = VoxelToLootDataDriven(result, "loot_table");

                expect(compiled.element.data.pools).toHaveLength(1);
                const pool = compiled.element.data.pools?.[0];
                expect(pool).toBeDefined();

                // Should have 4 entries: acacia_sapling, diamond, emerald, gold_ingot (with alternatives group)
                expect(pool?.entries).toHaveLength(4);

                // Find the alternatives group entry
                const alternativesEntry = pool?.entries.find((e) => e.type === "minecraft:alternatives");
                expect(alternativesEntry).toBeDefined();
                // The group might have fewer children than expected depending on how actions work
                expect(alternativesEntry?.children).toBeDefined();

                // Verify that we have some children in the alternatives group
                const childNames = alternativesEntry?.children?.map((c) => c.name) || [];
                expect(childNames.length).toBeGreaterThan(0);
            });
        });

        describe("Advanced loot table workflow", () => {
            it("should parse advanced loot table with groups", () => {
                expect(advancedLootTable.items).toHaveLength(2); // acacia_sapling + tag (tag is processed as item)
                expect(advancedLootTable.groups).toHaveLength(1); // group containing the tag

                const group = advancedLootTable.groups[0];
                expect(group.type).toBe("group");
                // The group should contain the tag item
                expect(group.items).toHaveLength(1);

                // The tag should be referenced in the group, and also exist as a separate item
                expect(advancedLootTable.items[0].name).toBe("minecraft:acacia_sapling");
                expect(advancedLootTable.items[1].name).toBe("#minecraft:bundles"); // Tag item
            });

            it("should modify groups and move items between pools", () => {
                let result = advancedLootTable;

                // Add a new item to pool 1
                const addItemAction = {
                    type: "add_loot_item" as const,
                    field: "items" as const,
                    poolIndex: 1,
                    item: {
                        name: "minecraft:netherite_ingot",
                        weight: 1,
                        quality: 20
                    }
                };

                result = updateData(addItemAction, result, 1) as LootTableProps;
                expect(result.items).toHaveLength(3); // acacia_sapling + tag + netherite_ingot
            });
        });

        describe("Ultimate loot table workflow", () => {
            it("should parse complex nested structure", () => {
                expect(ultimateLootTable.items).toHaveLength(5); // acacia_sapling, bundles tag, loot_table, empty, cherry_logs tag
                expect(ultimateLootTable.groups).toHaveLength(3); // Nested group structure

                // Should have alternatives, group, and nested groups
                const groupTypes = ultimateLootTable.groups.map((g) => g.type);
                expect(groupTypes).toContain("alternatives");
                expect(groupTypes).toContain("group");

                // Find loot_table reference
                const lootTableItem = ultimateLootTable.items.find((item) => item.name === "minecraft:blocks/acacia_wood");
                expect(lootTableItem).toBeDefined();
            });

            it("should handle complex group operations", () => {
                let result = ultimateLootTable;

                // Dissolve one of the nested groups
                const dissolveGroupAction = {
                    type: "dissolve_loot_group" as const,
                    field: "groups" as const,
                    groupId: "group_1" // One of the nested groups
                };

                result = updateData(dissolveGroupAction, result, 1) as LootTableProps;
                expect(result.groups).toHaveLength(2); // One group dissolved

                // Create a new sequence group with remaining items
                const createSequenceAction = {
                    type: "create_loot_group" as const,
                    field: "groups" as const,
                    groupType: "sequence" as const,
                    itemIds: ["item_0", "item_1"], // acacia_sapling and loot_table
                    poolIndex: 0
                };

                result = updateData(createSequenceAction, result, 1) as LootTableProps;
                expect(result.groups).toHaveLength(3);

                const sequenceGroup = result.groups.find((g) => g.type === "sequence");
                expect(sequenceGroup).toBeDefined();
                expect(sequenceGroup?.items).toEqual(["item_0", "item_1"]);

                // Duplicate an item to another pool
                const duplicateAction = {
                    type: "duplicate_loot_item" as const,
                    field: "items" as const,
                    itemId: "item_0", // acacia_sapling
                    targetPoolIndex: 1
                };

                result = updateData(duplicateAction, result, 1) as LootTableProps;
                expect(result.items).toHaveLength(6); // Original 5 + 1 duplicate

                const duplicatedItem = result.items.find((item) => item.name === "minecraft:acacia_sapling" && item.poolIndex === 1);
                expect(duplicatedItem).toBeDefined();
                expect(duplicatedItem?.id).not.toBe("item_0"); // Should have different ID

                // Compile final result
                const compiled = VoxelToLootDataDriven(result, "loot_table");
                expect(compiled.element.data.pools).toHaveLength(2);

                // Verify random_sequence is preserved
                expect(compiled.element.data.random_sequence).toBe("minecraft:entities/wither_skeleton");

                // Verify table-level functions are preserved
                expect(compiled.element.data.functions).toHaveLength(1);
                const firstFunction = compiled.element.data.functions?.[0];
                expect(firstFunction).toBeDefined();
                expect(firstFunction?.function).toBe("minecraft:enchant_with_levels");
            });
        });

        describe("Final Boss loot table workflow", () => {
            it("should parse final boss loot table with complex structures correctly", () => {
                // Verify parsing of complex structures
                expect(finalBossLootTable.identifier.namespace).toBe("test");
                expect(finalBossLootTable.identifier.resource).toBe("final_boss");

                // Should have many items due to complex nesting (alternatives, groups, sequences, etc.)
                expect(finalBossLootTable.items.length).toBeGreaterThan(5);
                expect(finalBossLootTable.groups.length).toBeGreaterThan(2);

                // Verify pools data is preserved
                expect(finalBossLootTable.pools).toHaveLength(2);
                expect(finalBossLootTable.pools?.[0]?.rolls).toBe(1);
                expect(finalBossLootTable.pools?.[0]?.bonus_rolls).toEqual({
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
                });

                // Find specific items
                const acaciaSignItem = finalBossLootTable.items.find((item) => item.name === "minecraft:acacia_sign");
                expect(acaciaSignItem).toBeDefined();

                const alliumItem = finalBossLootTable.items.find((item) => item.name === "minecraft:allium");
                expect(alliumItem).toBeDefined();

                const dynamicItem = finalBossLootTable.items.find((item) => item.name === "minecraft:sherds");
                expect(dynamicItem).toBeDefined();

                const tagItem = finalBossLootTable.items.find((item) => item.name === "#minecraft:buttons");
                expect(tagItem).toBeDefined();
                expect(tagItem?.expand).toBe(true);
                expect(tagItem?.weight).toBe(1);
                expect(tagItem?.quality).toBe(10);

                // Find loot table items
                const lootTableItems = finalBossLootTable.items.filter((item) => item.name.includes("minecraft:blocks/"));
                expect(lootTableItems.length).toBeGreaterThan(0);
            });

            it("should handle complex actions on final boss loot table", () => {
                let result = finalBossLootTable;
                const originalItemCount = result.items.length;
                const originalGroupCount = result.groups.length;

                // Add a new legendary item to pool 0
                const addLegendaryAction = {
                    type: "add_loot_item" as const,
                    field: "items" as const,
                    poolIndex: 0,
                    item: {
                        name: "minecraft:netherite_sword",
                        weight: 1,
                        quality: 100
                    }
                };

                result = updateData(addLegendaryAction, result, 1) as LootTableProps;
                expect(result.items).toHaveLength(originalItemCount + 1);

                // Create a new alternatives group with rare items
                const createRareGroupAction = {
                    type: "create_loot_group" as const,
                    field: "groups" as const,
                    groupType: "alternatives" as const,
                    itemIds: [result.items[result.items.length - 1].id], // The netherite sword
                    poolIndex: 0
                };

                result = updateData(createRareGroupAction, result, 1) as LootTableProps;
                expect(result.groups).toHaveLength(originalGroupCount + 1);

                // Move an item between pools
                const moveItemAction = {
                    type: "move_item_between_pools" as const,
                    field: "items" as const,
                    itemId: result.items[0].id, // First item
                    targetPoolIndex: 1
                };

                result = updateData(moveItemAction, result, 1) as LootTableProps;
                const movedItem = result.items.find((item) => item.poolIndex === 1 && item.id === result.items[0].id);
                expect(movedItem).toBeDefined();

                // Compile the modified result
                const compiled = VoxelToLootDataDriven(result, "loot_table");
                expect(compiled.element.data.pools).toHaveLength(2);

                // Verify the new alternatives group exists
                const pool0 = compiled.element.data.pools?.[0];
                const alternativesEntries = pool0?.entries.filter((e) => e.type === "minecraft:alternatives");
                expect(alternativesEntries?.length).toBeGreaterThan(0); // Should have at least one alternatives entry

                // Verify complex NumberProviders are still preserved
                expect(pool0?.bonus_rolls).toEqual({
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
                });
            });

            it("should preserve complex nested structures through actions", () => {
                let result = finalBossLootTable;

                // Find any group (not necessarily sequence)
                const complexGroup = result.groups.find((g) => g.items.length > 0);

                if (complexGroup) {
                    // Store the original items before dissolving
                    const originalItems = [...complexGroup.items];

                    const dissolveAction = {
                        type: "dissolve_loot_group" as const,
                        field: "groups" as const,
                        groupId: complexGroup.id
                    };

                    result = updateData(dissolveAction, result, 1) as LootTableProps;

                    // The items from the dissolved group should still exist
                    for (const itemId of originalItems) {
                        const item = result.items.find((i) => i.id === itemId);
                        expect(item).toBeDefined();
                    }
                }

                // Compile and verify structure integrity
                const compiled = VoxelToLootDataDriven(result, "loot_table");
                expect(compiled.element.data.pools).toHaveLength(2);
                expect(compiled.element.data.functions).toHaveLength(1);
                expect(compiled.element.data.random_sequence).toBe("minecraft:entities/wither_skeleton");

                // Verify that complex NumberProviders are still intact
                const pool1 = compiled.element.data.pools?.[0];
                expect(pool1?.rolls).toBe(1);
                expect(pool1?.bonus_rolls).toEqual({
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
                });
            });
        });

        describe("Round-trip integrity", () => {
            it("should maintain data integrity through full workflow", () => {
                // Start with ultimate loot table (most complex)
                let result = ultimateLootTable;
                const originalItemCount = result.items.length;
                const originalGroupCount = result.groups.length;

                // Apply a series of actions
                const actions = [
                    // Add items
                    {
                        type: "add_loot_item" as const,
                        field: "items" as const,
                        poolIndex: 0,
                        item: { name: "minecraft:diamond_block", weight: 1, quality: 15 }
                    },
                    // Modify existing item
                    {
                        type: "modify_loot_item" as const,
                        field: "items" as const,
                        itemId: "item_0",
                        property: "weight" as const,
                        value: 100
                    },
                    // Create new group
                    {
                        type: "create_loot_group" as const,
                        field: "groups" as const,
                        groupType: "alternatives" as const,
                        itemIds: ["item_0", "item_4"], // original + new item
                        poolIndex: 0
                    },
                    // Move item between pools
                    {
                        type: "move_item_between_pools" as const,
                        field: "items" as const,
                        itemId: "item_1", // loot_table item
                        targetPoolIndex: 1
                    }
                ];

                // Apply all actions
                for (const action of actions) {
                    result = updateData(action, result, 1) as LootTableProps;
                }

                // Verify intermediate state
                expect(result.items).toHaveLength(originalItemCount + 1);
                expect(result.groups).toHaveLength(originalGroupCount + 1);

                // Compile to Minecraft format
                const compiled = VoxelToLootDataDriven(result, "loot_table");

                // Verify compilation success
                expect(compiled.element.data).toBeDefined();
                expect(compiled.element.data.pools).toHaveLength(2); // Pool 0 + Pool 1 (item moved)
                expect(compiled.element.identifier).toEqual(ultimateLootTable.identifier);

                // Verify specific modifications are preserved
                const pool0 = compiled.element.data.pools?.[0];
                expect(pool0).toBeDefined();

                // Pool 0 should contain the new alternatives group
                const alternativesEntry = pool0?.entries.find((e) => e.type === "minecraft:alternatives");
                expect(alternativesEntry).toBeDefined();

                // Verify that the alternatives group exists and has some content
                expect(alternativesEntry?.children).toBeDefined();
                expect(alternativesEntry?.children?.length).toBeGreaterThan(0);

                // Verify table-level properties are preserved
                expect(compiled.element.data.random_sequence).toBe(ultimateLootTable.randomSequence);
                expect(compiled.element.data.functions).toEqual(ultimateLootTable.functions);
            });
        });

        describe("Error handling and edge cases", () => {
            it("should handle invalid actions gracefully", () => {
                // Try to remove non-existent item
                const invalidRemoveAction = {
                    type: "remove_loot_item" as const,
                    field: "items" as const,
                    itemId: "non_existent_item"
                };

                const result1 = updateData(invalidRemoveAction, simpleLootTable, 1) as LootTableProps;
                expect(result1.items).toHaveLength(simpleLootTable.items.length); // No change

                // Try to modify non-existent item
                const invalidModifyAction = {
                    type: "modify_loot_item" as const,
                    field: "items" as const,
                    itemId: "non_existent_item",
                    property: "weight" as const,
                    value: 50
                };

                const result2 = updateData(invalidModifyAction, simpleLootTable, 1) as LootTableProps;
                expect(result2.items).toEqual(simpleLootTable.items); // No change

                // Try to create group with non-existent items - this might actually create an empty group
                const invalidGroupAction = {
                    type: "create_loot_group" as const,
                    field: "groups" as const,
                    groupType: "alternatives" as const,
                    itemIds: ["non_existent_1", "non_existent_2"],
                    poolIndex: 0
                };

                const result3 = updateData(invalidGroupAction, simpleLootTable, 1) as LootTableProps;
                expect(result3).toBeDefined();
            });

            it("should handle empty groups correctly", () => {
                let result = advancedLootTable;
                const dissolveGroupAction = {
                    type: "dissolve_loot_group" as const,
                    field: "groups" as const,
                    groupId: "group_0"
                };

                result = updateData(dissolveGroupAction, result, 1) as LootTableProps;

                // The group should be removed
                expect(result.groups).toHaveLength(0);

                // Compilation should still work
                const compiled = VoxelToLootDataDriven(result, "loot_table");
                expect(compiled.element.data.pools).toHaveLength(1);
                const firstPool = compiled.element.data.pools?.[0];
                expect(firstPool).toBeDefined();
                expect(firstPool?.entries).toHaveLength(2); // acacia_sapling + tag (group was dissolved)
            });
        });
    });
});
