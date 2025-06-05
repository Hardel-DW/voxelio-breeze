import { describe, it, expect } from "vitest";
import { deepDiff, captureState } from "@/core/engine/migrations/differ";

describe("Differ System", () => {
    describe("captureState", () => {
        it("should normalize basic values", () => {
            const element = {
                name: "test",
                value: 42,
                enabled: true,
                nullable: null,
                undef: undefined
            };

            const state = captureState(element);

            expect(state.name).toBe("test");
            expect(state.value).toBe(42);
            expect(state.enabled).toBe(true);
            expect(state.nullable).toBe(null);
            expect(state.undef).toBe(undefined);
        });

        it("should normalize nested objects", () => {
            const element = {
                config: {
                    settings: {
                        debug: true,
                        level: 5
                    }
                }
            };

            const state = captureState(element);

            expect(state.config).toEqual({
                settings: {
                    debug: true,
                    level: 5
                }
            });
        });

        it("should normalize arrays", () => {
            const element = {
                items: ["a", "b", "c"],
                numbers: [1, 2, 3],
                nested: [{ id: 1 }, { id: 2 }]
            };

            const state = captureState(element);

            expect(state.items).toEqual(["a", "b", "c"]);
            expect(state.numbers).toEqual([1, 2, 3]);
            expect(state.nested).toEqual([{ id: 1 }, { id: 2 }]);
        });
    });

    describe("deepDiff", () => {
        it("should detect no changes when objects are identical", () => {
            const before = { name: "test", value: 42 };
            const after = { name: "test", value: 42 };

            const differences = deepDiff(before, after);

            expect(differences).toHaveLength(0);
        });

        it("should detect value changes", () => {
            const before = { name: "test", value: 42 };
            const after = { name: "test", value: 100 };

            const differences = deepDiff(before, after);

            expect(differences).toHaveLength(1);
            expect(differences[0]).toEqual({
                type: "set",
                path: "value",
                value: 100,
                origin_value: 42
            });
        });

        it("should detect added properties", () => {
            const before = { name: "test" };
            const after = { name: "test", value: 42 };

            const differences = deepDiff(before, after);

            expect(differences).toHaveLength(1);
            expect(differences[0]).toEqual({
                type: "add",
                path: "value",
                value: 42
            });
        });

        it("should detect removed properties", () => {
            const before = { name: "test", value: 42 };
            const after = { name: "test" };

            const differences = deepDiff(before, after);

            expect(differences).toHaveLength(1);
            expect(differences[0]).toEqual({
                type: "remove",
                path: "value",
                origin_value: 42
            });
        });

        it("should detect nested changes", () => {
            const before = {
                config: {
                    settings: {
                        debug: true,
                        level: 5
                    }
                }
            };
            const after = {
                config: {
                    settings: {
                        debug: false,
                        level: 5
                    }
                }
            };

            const differences = deepDiff(before, after);

            expect(differences).toHaveLength(1);
            expect(differences[0]).toEqual({
                type: "set",
                path: "config.settings.debug",
                value: false,
                origin_value: true
            });
        });

        it("should detect array changes", () => {
            const before = { items: ["a", "b"] };
            const after = { items: ["a", "b", "c"] };

            const differences = deepDiff(before, after);

            expect(differences).toHaveLength(1);
            expect(differences[0]).toEqual({
                type: "add",
                path: "items.2",
                value: "c"
            });
        });

        it("should detect array item removal", () => {
            const before = { items: ["a", "b", "c"] };
            const after = { items: ["a", "b"] };

            const differences = deepDiff(before, after);

            expect(differences).toHaveLength(1);
            expect(differences[0]).toEqual({
                type: "remove",
                path: "items.2",
                origin_value: "c"
            });
        });

        it("should detect array item changes", () => {
            const before = { items: ["a", "b", "c"] };
            const after = { items: ["a", "X", "c"] };

            const differences = deepDiff(before, after);

            expect(differences).toHaveLength(1);
            expect(differences[0]).toEqual({
                type: "set",
                path: "items.1",
                value: "X",
                origin_value: "b"
            });
        });

        it("should handle complex nested array changes", () => {
            const before = {
                pools: [
                    { rolls: 1, entries: [{ name: "diamond" }] },
                    { rolls: 2, entries: [{ name: "gold" }] }
                ]
            };
            const after = {
                pools: [
                    { rolls: 1, entries: [{ name: "diamond" }, { name: "emerald" }] },
                    { rolls: 3, entries: [{ name: "gold" }] }
                ]
            };

            const differences = deepDiff(before, after);

            expect(differences).toHaveLength(2);

            // Should detect new entry added to first pool
            const addDiff = differences.find((d) => d.type === "add");
            expect(addDiff).toEqual({
                type: "add",
                path: "pools.0.entries.1",
                value: { name: "emerald" }
            });

            // Should detect rolls change in second pool
            const setDiff = differences.find((d) => d.type === "set");
            expect(setDiff).toEqual({
                type: "set",
                path: "pools.1.rolls",
                value: 3,
                origin_value: 2
            });
        });

        it("should respect ignorePaths option", () => {
            const before = { name: "test", timestamp: "2023-01-01", value: 42 };
            const after = { name: "test", timestamp: "2023-01-02", value: 100 };

            const differences = deepDiff(before, after, {
                ignorePaths: ["timestamp"]
            });

            expect(differences).toHaveLength(1);
            expect(differences[0].path).toBe("value");
        });

        it("should respect maxDepth option", () => {
            const before = {
                level1: {
                    level2: {
                        level3: {
                            value: "deep"
                        }
                    }
                }
            };
            const after = {
                level1: {
                    level2: {
                        level3: {
                            value: "changed"
                        }
                    }
                }
            };

            const differences = deepDiff(before, after, {
                maxDepth: 2
            });

            // Should not detect changes deeper than level 2
            expect(differences).toHaveLength(0);
        });

        it("should handle type changes", () => {
            const before = { value: "string" };
            const after = { value: 42 };

            const differences = deepDiff(before, after);

            expect(differences).toHaveLength(1);
            expect(differences[0]).toEqual({
                type: "set",
                path: "value",
                value: 42,
                origin_value: "string"
            });
        });

        it("should handle object to array changes", () => {
            const before = { data: { a: 1, b: 2 } };
            const after = { data: [1, 2] };

            const differences = deepDiff(before, after);

            expect(differences).toHaveLength(1);
            expect(differences[0]).toEqual({
                type: "set",
                path: "data",
                value: [1, 2],
                origin_value: { a: 1, b: 2 }
            });
        });
    });
});
