import { describe, it, expect, beforeEach } from "vitest";
import { updateData } from "@/core/engine/actions";
import { Logger } from "@/core/engine/migrations/logger";

describe("Logger System", () => {
    let testLogger: Logger;

    beforeEach(() => {
        testLogger = new Logger();
        // Set datapack info for proper export structure
        testLogger.setDatapackInfo({
            name: "test-datapack",
            description: "Test datapack",
            namespaces: ["test"],
            version: 48,
            isModded: false,
            isMinified: false
        });
    });

    describe("trackChanges", () => {
        it("should track changes when element is modified", async () => {
            const element = { name: "test", value: 42 };

            const result = await testLogger.trackChanges(element, async (el) => {
                return { ...el, value: 100 };
            });

            expect(result).toEqual({ name: "test", value: 100 });
            expect(testLogger.getChanges()).toHaveLength(1);

            const changes = testLogger.getChanges();
            expect(changes[0].differences).toHaveLength(1);
            expect(changes[0].differences[0]).toEqual({
                type: "set",
                path: "value",
                value: 100,
                origin_value: 42
            });
        });

        it("should not track changes when element is unchanged", async () => {
            const element = { name: "test", value: 42 };

            const result = await testLogger.trackChanges(element, async (el) => {
                return { ...el };
            });

            expect(result).toEqual({ name: "test", value: 42 });
            expect(testLogger.getChanges()).toHaveLength(0);
        });

        it("should handle operations that return undefined", async () => {
            const element = { name: "test", value: 42 };

            const result = await testLogger.trackChanges(element, async () => {
                return undefined;
            });

            expect(result).toBeUndefined();
            expect(testLogger.getChanges()).toHaveLength(0);
        });

        it("should track with real actions", async () => {
            const element = {
                identifier: { namespace: "test", registry: "loot_table", resource: "simple" },
                name: "Simple Test",
                value: 42
            };

            const result = await testLogger.trackChanges(element, async (el) => {
                return await updateData({ type: "core.set_value", path: "value", value: 100 }, el, 48);
            });

            expect(result).toBeDefined();
            expect(result?.value).toBe(100);
            expect(testLogger.getChanges()).toHaveLength(1);

            const changes = testLogger.getChanges();
            expect(changes[0].identifier).toBe("test:simple");
            expect(changes[0].registry).toBe("loot_table");
        });
    });

    describe("sync", () => {
        it("should detect changes between states", () => {
            const beforeState = { name: "test", value: 42, enabled: true };
            const afterState = { name: "test", value: 100, enabled: false };

            testLogger.sync(beforeState, afterState, "test_element", "recipe");

            const changes = testLogger.getChanges();
            expect(changes).toHaveLength(1);
            expect(changes[0].identifier).toBe("test_element");
            expect(changes[0].registry).toBe("recipe");
            expect(changes[0].differences).toHaveLength(2);
        });

        it("should not create changes when states are identical", () => {
            const state = { name: "test", value: 42 };

            testLogger.sync(state, state);
            expect(testLogger.getChanges()).toHaveLength(0);
        });

        it("should auto-extract element info when not provided", () => {
            const before = { id: "auto_element", value: 42 };
            const after = { id: "auto_element", value: 100, type: "test_type" };

            testLogger.sync(before, after);

            const changes = testLogger.getChanges();
            expect(changes[0].identifier).toBe("auto_element");
            expect(changes[0].registry).toBe("test_type");
        });
    });

    describe("export/import", () => {
        it("should export new JSON format with datapack info", async () => {
            const element = { name: "test", value: 42 };

            await testLogger.trackChanges(element, async (el) => {
                return { ...el, value: 100 };
            });

            const json = testLogger.exportJson();
            expect(typeof json).toBe("string");

            const parsed = JSON.parse(json);
            expect(parsed.id).toBeDefined();
            expect(parsed.generated_at).toBeDefined();
            expect(parsed.version).toBe(48);
            expect(parsed.isModded).toBe(false);
            expect(parsed.engine).toBe(2);
            expect(parsed.isMinified).toBe(false);
            expect(parsed.datapack).toEqual({
                name: "test-datapack",
                description: "Test datapack",
                namespaces: ["test"]
            });
            expect(parsed.logs).toHaveLength(1);
        });

        it("should preserve ID when importing existing logs", () => {
            const existingLogs = {
                id: "existing-id-123",
                generated_at: "2023-01-01T00:00:00.000Z",
                version: 48,
                isModded: true,
                engine: 2,
                isMinified: false,
                datapack: {
                    name: "imported-datapack",
                    namespaces: ["imported"]
                },
                logs: [
                    {
                        identifier: "test:item",
                        registry: "recipe",
                        differences: [{ type: "set", path: "value", value: 100, origin_value: 42 }],
                        timestamp: "2023-01-01T00:00:00.000Z"
                    }
                ]
            };

            const newLogger = new Logger(JSON.stringify(existingLogs));

            expect(newLogger.getChanges()).toHaveLength(1);
            expect(newLogger.getChanges()[0].identifier).toBe("test:item");
            expect(newLogger.getChanges()[0].registry).toBe("recipe");

            const exportedJson = newLogger.exportJson();
            const parsed = JSON.parse(exportedJson);
            expect(parsed.id).toBe("existing-id-123");
            expect(parsed.version).toBe(48);
            expect(parsed.isModded).toBe(true);
            expect(parsed.datapack.name).toBe("imported-datapack");
        });

        it("should generate new ID when no logs provided", () => {
            const logger1 = new Logger();
            const logger2 = new Logger();

            const json1 = logger1.exportJson();
            const json2 = logger2.exportJson();

            const parsed1 = JSON.parse(json1);
            const parsed2 = JSON.parse(json2);

            expect(parsed1.id).toBeDefined();
            expect(parsed2.id).toBeDefined();
            expect(parsed1.id).not.toBe(parsed2.id);
        });
    });

    describe("datapack info", () => {
        it("should store and export datapack information", () => {
            const datapackInfo = {
                name: "my-datapack",
                description: "My custom datapack",
                namespaces: ["custom", "mod"],
                version: 71,
                isModded: true,
                isMinified: true
            };

            testLogger.setDatapackInfo(datapackInfo);

            const json = testLogger.exportJson();
            const parsed = JSON.parse(json);

            expect(parsed.version).toBe(71);
            expect(parsed.isModded).toBe(true);
            expect(parsed.isMinified).toBe(true);
            expect(parsed.datapack).toEqual({
                name: "my-datapack",
                description: "My custom datapack",
                namespaces: ["custom", "mod"]
            });
        });
    });

    describe("mixed operations", () => {
        it("should handle both track and sync operations", async () => {
            // Tool operation
            await testLogger.trackChanges({ id: "test1", value: 42 }, async (el) => {
                return { ...el, value: 100 };
            });

            // Manual sync
            testLogger.sync({ id: "test2", value: 10 }, { id: "test2", value: 20 });

            expect(testLogger.getChanges()).toHaveLength(2);
            expect(testLogger.getChanges()[0].identifier).toBe("test1");
            expect(testLogger.getChanges()[1].identifier).toBe("test2");
        });
    });
});
