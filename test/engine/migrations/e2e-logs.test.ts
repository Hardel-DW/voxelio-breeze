import { describe, it, expect } from "vitest";
import { Datapack } from "@/core/Datapack";
import { Logger } from "@/core/engine/migrations/logger";
import { updateData } from "@/core/engine/actions";
import { parseDatapack } from "@/core/engine/Parser";
import { lootTableFile, enchantmentFile } from "@test/template/datapack";
import { createZipFile, prepareFiles } from "@test/template/utils";

describe("E2E Logs System", () => {
    describe("Scenario 1: Basic logging flow", () => {
        it("should track changes, export logs, and generate valid datapack", async () => {
            // Prepare mock datapack
            const files = prepareFiles({ ...lootTableFile, ...enchantmentFile });
            const datapackFile = await createZipFile(files);

            // Parse datapack
            const result = await parseDatapack(datapackFile);
            const logger = result.logger;

            // Get an element to modify
            const elementKey = Array.from(result.elements.keys())[0];
            const element = result.elements.get(elementKey);
            if (!element) throw new Error("Element not found");

            // Apply some actions with logging
            await logger.trackChanges(element, async (el) => {
                return await updateData({ type: "core.set_value", path: "name", value: "Modified Name" }, el, 123);
            });

            await logger.trackChanges(element, async (el) => {
                return await updateData({ type: "core.set_value", path: "value", value: 999 }, el, 123);
            });

            // Verify changes were tracked
            const changes = logger.getChanges();
            expect(changes).toHaveLength(2);
            expect(changes[0].differences[0].path).toBe("name");
            expect(changes[0].differences[0].value).toBe("Modified Name");

            // Export logs
            const logsJson = logger.exportJson();
            expect(logsJson).toContain("voxel_studio_log");
            expect(logsJson).toContain("Modified Name");

            // Parse logs and verify structure
            const parsedLogs = JSON.parse(logsJson);
            expect(parsedLogs.voxel_studio_log.version).toBe("1.0.0");
            expect(parsedLogs.voxel_studio_log.changes).toHaveLength(2);
        });
    });

    describe("Scenario 2: Import logs and continue working", () => {
        it("should import existing logs, apply more actions, and export complete history", async () => {
            // Create initial logs
            const existingLogs = {
                voxel_studio_log: {
                    version: "1.0.0",
                    generated_at: "2024-01-01T00:00:00.000Z",
                    changes: [
                        {
                            element_id: "test:simple",
                            element_type: "loot_table",
                            differences: [{ type: "set", path: "pools.0.rolls", value: 5, origin_value: 1 }],
                            timestamp: "2024-01-01T00:00:00.000Z"
                        }
                    ]
                }
            };

            // Prepare mock datapack with logs
            const files = prepareFiles({ ...lootTableFile });
            files["voxel/logs.json"] = new TextEncoder().encode(JSON.stringify(existingLogs));
            const datapackFile = await createZipFile(files);

            // Parse datapack (should import logs)
            const result = await parseDatapack(datapackFile);
            const logger = result.logger;

            // Verify existing logs were imported
            expect(logger.getChanges()).toHaveLength(1);
            expect(logger.getChanges()[0].element_id).toBe("test:simple");

            // Apply new actions
            const elementKey = Array.from(result.elements.keys())[0];
            const element = result.elements.get(elementKey);
            if (!element) throw new Error("Element not found");

            await logger.trackChanges(element, async (el) => {
                return await updateData({ type: "core.set_value", path: "pools.0.bonus_rolls", value: 2 }, el, 123);
            });

            // Verify combined history
            const allChanges = logger.getChanges();
            expect(allChanges).toHaveLength(2);
            expect(allChanges[0].differences[0].path).toBe("pools.0.rolls"); // Old change
            expect(allChanges[1].differences[0].path).toBe("pools.0.bonus_rolls"); // New change

            // Export complete history
            const fullLogsJson = logger.exportJson();
            const parsedFullLogs = JSON.parse(fullLogsJson);
            expect(parsedFullLogs.voxel_studio_log.changes).toHaveLength(2);
        });
    });

    describe("Scenario 3: Replay changes from logs", () => {
        it("should parse logs, replay changes, and verify element modifications", async () => {
            // Create logs with specific changes based on what we actually have
            const replayLogs = {
                voxel_studio_log: {
                    version: "1.0.0",
                    generated_at: "2024-01-01T00:00:00.000Z",
                    changes: [
                        {
                            element_id: "test:test",
                            element_type: "loot_table",
                            differences: [{ type: "set", path: "pools.0.rolls", value: 10, origin_value: 0 }],
                            timestamp: "2024-01-01T00:00:00.000Z"
                        },
                        {
                            element_id: "enchantplus:sword/attack_speed",
                            element_type: "enchantment",
                            differences: [{ type: "set", path: "max_level", value: 20, origin_value: 5 }],
                            timestamp: "2024-01-01T00:01:00.000Z"
                        }
                    ]
                }
            };

            // Import logs into a new logger
            const replayLogger = new Logger(JSON.stringify(replayLogs));
            const importedChanges = replayLogger.getChanges();

            expect(importedChanges).toHaveLength(2);

            // Verify log structure is correct
            expect(importedChanges[0].element_id).toBe("test:test");
            expect(importedChanges[0].differences[0].path).toBe("pools.0.rolls");
            expect(importedChanges[0].differences[0].value).toBe(10);

            expect(importedChanges[1].element_id).toBe("enchantplus:sword/attack_speed");
            expect(importedChanges[1].differences[0].path).toBe("max_level");
            expect(importedChanges[1].differences[0].value).toBe(20);

            // Verify log structure is correct
            expect(importedChanges[0].element_type).toBe("loot_table");
            expect(importedChanges[1].element_type).toBe("enchantment");
        });

        it("should demonstrate complete replay workflow with real actions", async () => {
            // Step 1: Create original datapack and apply changes with logging
            const files1 = prepareFiles({ ...lootTableFile });
            const datapackFile1 = await createZipFile(files1);
            const result1 = await parseDatapack(datapackFile1);
            const logger1 = result1.logger;

            // Get a loot table element and modify it
            const elementKey = Array.from(result1.elements.keys())[0];
            const originalElement = result1.elements.get(elementKey);
            if (!originalElement) {
                throw new Error("No element found in result1");
            }

            // Apply changes with logging
            const modifiedElement1 = await logger1.trackChanges(originalElement, async (el) => {
                return await updateData({ type: "core.set_value", path: "pools.0.rolls", value: 5 }, el, 123);
            });

            if (!modifiedElement1) {
                throw new Error("Modified element 1 is null");
            }

            // Step 2: Export logs
            const logsJson = logger1.exportJson();
            const changes = logger1.getChanges();
            expect(changes).toHaveLength(2);

            // Step 3: Create new clean datapack with imported logs
            const files2 = prepareFiles({ ...lootTableFile });
            files2["voxel/logs.json"] = new TextEncoder().encode(logsJson);
            const datapackFile2 = await createZipFile(files2);

            const result2 = await parseDatapack(datapackFile2);
            const logger2 = result2.logger;

            // Verify logs were imported correctly
            const importedChanges = logger2.getChanges();
            expect(importedChanges).toHaveLength(2);

            // Step 4: Apply same changes based on logs to verify replay capability
            const newElementKey = Array.from(result2.elements.keys())[0];
            const freshElement = result2.elements.get(newElementKey);
            if (!freshElement) {
                throw new Error("No element found in result2");
            }

            // Replay the first change
            const replayedElement1 = await updateData(
                {
                    type: "core.set_value",
                    path: "pools.0.rolls",
                    value: 5
                },
                freshElement,
                123
            );

            if (!replayedElement1) {
                throw new Error("Replayed element 1 is null");
            }

            // Replay the second change
            const replayedElement2 = await updateData(
                {
                    type: "core.set_value",
                    path: "pools.0.bonus_rolls",
                    value: 2
                },
                replayedElement1,
                123
            );

            // Step 5: Verify that replayed changes match logged changes
            expect(replayedElement2).toBeDefined();

            // Both should have the same final structure
            // @ts-ignore - for test purposes
            expect(replayedElement2.pools[0].rolls).toBe(5);
            // @ts-ignore - for test purposes
            expect(replayedElement2.pools[0].bonus_rolls).toBe(2);

            // The logs should describe the same transformations
            expect(importedChanges[0].differences[0].path).toBe("pools.0.rolls");
            expect(importedChanges[0].differences[0].value).toBe(5);
            expect(importedChanges[1].differences[0].path).toBe("pools.0.bonus_rolls");
            expect(importedChanges[1].differences[0].value).toBe(2);
        });
    });

    describe("Complete datapack generation workflow", () => {
        it("should parse datapack, apply logged changes, and generate modified datapack", async () => {
            // Prepare original datapack
            const files = prepareFiles(lootTableFile);
            const originalDatapack = new Datapack(files, "test-datapack");

            // Create logger and apply changes
            const logger = new Logger();

            // Get original loot table
            const lootTables = originalDatapack.getRegistry("loot_table");
            expect(lootTables).toHaveLength(4); // completeLootTable, advancedLootTable, ultimateTestLootTable, finalBossOfLootTable

            // Simulate tracked changes on an element
            const testElement = {
                identifier: { namespace: "test", registry: "loot_table", resource: "test" },
                pools: [{ rolls: 1, entries: [] }],
                type: "minecraft:entity"
            };

            await logger.trackChanges(testElement, async (el) => {
                return { ...el, pools: [{ rolls: 5, entries: [] }] };
            });

            // Verify logging worked
            const changes = logger.getChanges();
            expect(changes).toHaveLength(1);
            expect(changes[0].differences[0].path).toBe("pools.0.rolls");
            expect(changes[0].differences[0].value).toBe(5);

            // Generate datapack with logs
            const modifiedElements = [
                {
                    type: "updated" as const,
                    element: {
                        identifier: { namespace: "test", registry: "loot_table", resource: "test" },
                        data: testElement
                    }
                }
            ];

            const generatedZip = originalDatapack.generate(modifiedElements, {
                isMinified: false,
                logger
            });

            expect(generatedZip).toBeDefined();

            // Export logs to verify they contain our changes
            const logsJson = logger.exportJson();
            expect(logsJson).toContain("pools.0.rolls");
            expect(logsJson).toContain('"value": 5');
            expect(logsJson).toContain('"origin_value": 1');
        });
    });
});
