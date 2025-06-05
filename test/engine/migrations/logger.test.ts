import { describe, it, expect, beforeEach } from "vitest";
import { updateData } from "@/core/engine/actions";
import { Logger } from "@/core/engine/migrations/logger";

describe("Logger System", () => {
    let testLogger: Logger;

    beforeEach(() => {
        testLogger = new Logger();
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
            expect(changes[0].element_id).toBe("test:simple");
            expect(changes[0].element_type).toBe("loot_table");
        });
    });

    describe("sync", () => {
        it("should detect changes between states", () => {
            const beforeState = { name: "test", value: 42, enabled: true };
            const afterState = { name: "test", value: 100, enabled: false };

            testLogger.sync(beforeState, afterState, "test_element", "recipe");

            const changes = testLogger.getChanges();
            expect(changes).toHaveLength(1);
            expect(changes[0].element_id).toBe("test_element");
            expect(changes[0].element_type).toBe("recipe");
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
            expect(changes[0].element_id).toBe("auto_element");
            expect(changes[0].element_type).toBe("test_type");
        });
    });

    describe("export/import", () => {
        it("should export and import JSON", async () => {
            const element = { name: "test", value: 42 };

            await testLogger.trackChanges(element, async (el) => {
                return { ...el, value: 100 };
            });

            const json = testLogger.exportJson();
            expect(typeof json).toBe("string");

            const parsed = JSON.parse(json);
            expect(parsed.voxel_studio_log).toBeDefined();
            expect(parsed.voxel_studio_log.version).toBe("1.0.0");
            expect(parsed.voxel_studio_log.changes).toHaveLength(1);

            const newLogger = new Logger();
            newLogger.importJson(json);

            expect(newLogger.getChanges()).toEqual(testLogger.getChanges());
        });

        it("should handle different JSON formats", () => {
            const changes = [
                {
                    element_id: "test",
                    element_type: "recipe",
                    differences: [{ type: "set", path: "value", value: 100, origin_value: 42 }],
                    timestamp: "2023-01-01T00:00:00.000Z"
                }
            ];

            // Direct changes array
            testLogger.importJson(JSON.stringify(changes));
            expect(testLogger.getChanges()).toHaveLength(1);

            testLogger.clearChanges();

            // Legacy format
            testLogger.importJson(JSON.stringify({ changes }));
            expect(testLogger.getChanges()).toHaveLength(1);
        });
    });

    describe("global logger", () => {
        it("should provide a global instance", () => {
            expect(testLogger).toBeInstanceOf(Logger);
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
            expect(testLogger.getChanges()[0].element_id).toBe("test1");
            expect(testLogger.getChanges()[1].element_id).toBe("test2");
        });
    });
});
