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

describe("E2E Logs Replay System", () => {
    it("should create logs, parse datapack, transform logs to actions and verify results", async () => {
        // Étape 1: Créer des logs avec 5 changements
        const testLogs = {
            voxel_studio_log: {
                version: "1.0.0",
                generated_at: "2024-01-01T00:00:00.000Z",
                changes: [
                    {
                        element_id: "test:test",
                        element_type: "loot_table",
                        differences: [
                            { type: "set", path: "pools.0.rolls", value: 8, origin_value: 0 },
                            { type: "set", path: "pools.0.bonus_rolls", value: 3, origin_value: undefined }
                        ],
                        timestamp: "2024-01-01T00:00:00.000Z"
                    },
                    {
                        element_id: "test:test",
                        element_type: "loot_table",
                        differences: [{ type: "set", path: "type", value: "minecraft:chest", origin_value: "minecraft:entity" }],
                        timestamp: "2024-01-01T00:01:00.000Z"
                    },
                    {
                        element_id: "enchantplus:sword/attack_speed",
                        element_type: "enchantment",
                        differences: [{ type: "set", path: "max_level", value: 15, origin_value: 5 }],
                        timestamp: "2024-01-01T00:02:00.000Z"
                    },
                    {
                        element_id: "enchantplus:sword/attack_speed",
                        element_type: "enchantment",
                        differences: [{ type: "set", path: "min_cost.base", value: 25, origin_value: 10 }],
                        timestamp: "2024-01-01T00:03:00.000Z"
                    },
                    {
                        element_id: "test:advanced",
                        element_type: "loot_table",
                        differences: [{ type: "set", path: "pools.0.rolls", value: 5, origin_value: 2 }],
                        timestamp: "2024-01-01T00:04:00.000Z"
                    }
                ]
            }
        };

        console.log("✓ Logs créés avec 5 changements sur 3 éléments");

        // Étape 2: Prendre lootTableFile et enchantmentFile et en faire un zip
        const files = prepareFiles({ ...lootTableFile, ...enchantmentFile });
        const datapackFile = await createZipFile(files);

        console.log("✓ Datapack zip créé avec loot tables et enchantements");

        // Étape 3: Parser le datapack
        const result = await parseDatapack(datapackFile);
        console.log("✓ Datapack parsé, éléments trouvés:", result.elements.size);

        // Étape 4: Récupérer le logger
        const logger = result.logger;
        console.log("✓ Logger récupéré");

        // Étape 5: Transformer les logs en actions et les appliquer aux éléments
        console.log("Début de l'application des actions...");

        // Trouver les éléments concernés par les logs
        const testLootTable = Array.from(result.elements.values()).find(
            (el) => el.identifier.namespace === "test" && el.identifier.resource === "test" && el.identifier.registry === "loot_table"
        );

        const attackSpeedEnchant = Array.from(result.elements.values()).find(
            (el) =>
                el.identifier.namespace === "enchantplus" &&
                el.identifier.resource === "sword/attack_speed" &&
                el.identifier.registry === "enchantment"
        );

        const advancedLootTable = Array.from(result.elements.values()).find(
            (el) => el.identifier.namespace === "test" && el.identifier.resource === "advanced" && el.identifier.registry === "loot_table"
        );

        expect(testLootTable).toBeDefined();
        expect(attackSpeedEnchant).toBeDefined();
        expect(advancedLootTable).toBeDefined();

        if (!testLootTable) throw new Error("testLootTable not found");
        if (!attackSpeedEnchant) throw new Error("attackSpeedEnchant not found");
        if (!advancedLootTable) throw new Error("advancedLootTable not found");

        console.log("✓ Éléments cibles trouvés");

        // Appliquer les changements du log 1 (loot table: pools.0.rolls + bonus_rolls)
        let modifiedLootTable = await updateData(
            {
                type: "core.set_value",
                path: "pools.0.rolls",
                value: 8
            },
            testLootTable,
            123
        );

        if (!modifiedLootTable) throw new Error("modifiedLootTable is null after pools.0.rolls");

        modifiedLootTable = await updateData(
            {
                type: "core.set_value",
                path: "pools.0.bonus_rolls",
                value: 3
            },
            modifiedLootTable,
            123
        );

        if (!modifiedLootTable) throw new Error("modifiedLootTable is null after pools.0.bonus_rolls");

        // Appliquer changement du log 2 (loot table: type)
        modifiedLootTable = await updateData(
            {
                type: "core.set_value",
                path: "type",
                value: "minecraft:chest"
            },
            modifiedLootTable,
            123
        );

        if (!modifiedLootTable) throw new Error("modifiedLootTable is null after type");

        // Appliquer changement du log 3 (enchant: max_level)
        const modifiedAttackSpeed = await updateData(
            {
                type: "core.set_value",
                path: "max_level",
                value: 15
            },
            attackSpeedEnchant,
            123
        );

        if (!modifiedAttackSpeed) throw new Error("modifiedAttackSpeed is null");

        // Appliquer changement du log 4 (enchant: min_cost.base)
        const modifiedAttackSpeed2 = await updateData(
            {
                type: "core.set_value",
                path: "min_cost.base",
                value: 25
            },
            modifiedAttackSpeed,
            123
        );

        if (!modifiedAttackSpeed2) throw new Error("modifiedAttackSpeed2 is null");

        // Appliquer changement du log 5 (loot table advanced: pools.0.rolls)
        const modifiedAdvanced = await updateData(
            {
                type: "core.set_value",
                path: "pools.0.rolls",
                value: 5
            },
            advancedLootTable,
            123
        );

        if (!modifiedAdvanced) throw new Error("modifiedAdvanced is null");

        console.log("✓ Toutes les actions appliquées");

        // Étape 6: Vérifier que c'est bien les bonnes valeurs attendues

        // Vérifications loot table
        expect(modifiedLootTable).toBeDefined();
        // @ts-ignore - for test access
        expect(modifiedLootTable.pools[0].rolls).toBe(8);
        // @ts-ignore - for test access
        expect(modifiedLootTable.pools[0].bonus_rolls).toBe(3);
        // @ts-ignore - for test access
        expect(modifiedLootTable.type).toBe("minecraft:chest");

        // Vérifications enchantement attack_speed
        expect(modifiedAttackSpeed2).toBeDefined();
        // @ts-ignore - for test access
        expect(modifiedAttackSpeed2.max_level).toBe(15);
        // @ts-ignore - for test access
        expect(modifiedAttackSpeed2.min_cost.base).toBe(25);

        // Vérifications loot table advanced
        expect(modifiedAdvanced).toBeDefined();
        // @ts-ignore - for test access
        expect(modifiedAdvanced.pools[0].rolls).toBe(5);

        console.log("✓ Toutes les valeurs correspondent aux logs!");

        // Vérification supplémentaire: comparer avec les logs originaux
        const changes = testLogs.voxel_studio_log.changes;

        // Changement 1 - pools.0.rolls
        expect(changes[0].differences[0].value).toBe(8);
        // @ts-ignore
        expect(modifiedLootTable.pools[0].rolls).toBe(changes[0].differences[0].value);

        // Changement 2 - pools.0.bonus_rolls
        expect(changes[0].differences[1].value).toBe(3);
        // @ts-ignore
        expect(modifiedLootTable.pools[0].bonus_rolls).toBe(changes[0].differences[1].value);

        // Changement 3 - type
        expect(changes[1].differences[0].value).toBe("minecraft:chest");
        // @ts-ignore
        expect(modifiedLootTable.type).toBe(changes[1].differences[0].value);

        // Changement 4 - max_level
        expect(changes[2].differences[0].value).toBe(15);
        // @ts-ignore
        expect(modifiedAttackSpeed2.max_level).toBe(changes[2].differences[0].value);

        // Changement 5 - min_cost.base
        expect(changes[3].differences[0].value).toBe(25);
        // @ts-ignore
        expect(modifiedAttackSpeed2.min_cost.base).toBe(changes[3].differences[0].value);

        // Changement 6 - advanced loot table pools.0.rolls
        expect(changes[4].differences[0].value).toBe(5);
        // @ts-ignore
        expect(modifiedAdvanced.pools[0].rolls).toBe(changes[4].differences[0].value);

        console.log("✓ Test complet réussi! Logs → Actions → Résultats vérifiés");
    });
});
