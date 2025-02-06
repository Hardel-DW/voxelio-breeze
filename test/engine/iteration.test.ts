import { collectFromPath } from "@/core/engine/renderer/iteration/collectFromPath";
import { createIterations } from "@/core/engine/renderer/iteration/createIterations";
import { resolveIterationValue } from "@/core/engine/renderer/iteration/resolveIterationValue";
import type { IterationValue } from "@/core/engine/renderer/iteration/type";
import { describe, expect, it } from "vitest";

describe("Iteration System", () => {
    describe("createIterations", () => {
        const mockFiles = {
            "pack.mcmeta": new TextEncoder().encode(JSON.stringify({ pack: { pack_format: 61, description: "lorem ipsum" } })),
            "data/minecraft/enchantment/combat/sharpness.json": new TextEncoder().encode(
                JSON.stringify({ id: "minecraft:sharpness", level: 5 })
            ),
            "data/minecraft/enchantment/combat/smite.json": new TextEncoder().encode(JSON.stringify({ id: "minecraft:smite", level: 5 })),
            "data/custom/enchantment/combat/power.json": new TextEncoder().encode(JSON.stringify({ id: "custom:power", level: 3 }))
        };

        it("should handle collect_from_path iteration with full context", () => {
            const valueSet: IterationValue = {
                type: "collect_from_path",
                registry: "enchantment",
                path: "combat",
                exclude_namespace: ["custom"]
            };

            const result = createIterations(valueSet, mockFiles);

            expect(result).toHaveLength(2);
            expect(result[0].key).toBe("minecraft:combat/sharpness");
            expect(result[0].context).toMatchObject({
                filename: "Sharpness",
                resource: "Combat - Sharpness",
                namespace: "minecraft",
                identifier: "minecraft:combat/sharpness"
            });

            expect(result[1].key).toBe("minecraft:combat/smite");
            expect(result[1].context).toMatchObject({
                filename: "Smite",
                resource: "Combat - Smite",
                namespace: "minecraft",
                identifier: "minecraft:combat/smite"
            });
        });

        it("should handle static iteration with full context", () => {
            const valueSet: IterationValue = {
                type: "static",
                values: ["head", "chest", "legs"]
            };

            const result = createIterations(valueSet, mockFiles);

            expect(result).toHaveLength(3);
            result.forEach((item, index) => {
                const expectedValue = ["head", "chest", "legs"][index];
                expect(item.key).toBe(expectedValue);
                expect(item.context).toMatchObject({
                    current_iteration: expectedValue
                });
            });
        });

        it("should handle object iteration with full context", () => {
            const valueSet: IterationValue = {
                type: "object",
                values: [
                    { id: "test1", value: 1, type: "normal" },
                    { id: "test2", value: 2, type: "special" }
                ]
            };

            const result = createIterations(valueSet, mockFiles);

            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({
                key: "object_0",
                context: {
                    object_data: {
                        id: "test1",
                        value: 1,
                        type: "normal"
                    }
                }
            });
            expect(result[1]).toMatchObject({
                key: "object_1",
                context: {
                    object_data: {
                        id: "test2",
                        value: 2,
                        type: "special"
                    }
                }
            });
        });

        it("should handle get_registry_elements iteration with full context", () => {
            const valueSet: IterationValue = {
                type: "get_registry_elements",
                registry: "enchantment"
            };

            const result = createIterations(valueSet, mockFiles);

            expect(result).toHaveLength(3);
            const expectedElements = [
                {
                    key: "minecraft:combat/sharpness",
                    context: {
                        filename: "Sharpness",
                        resource: "Combat - Sharpness",
                        namespace: "minecraft",
                        identifier: "minecraft:combat/sharpness"
                    }
                },
                {
                    key: "minecraft:combat/smite",
                    context: {
                        filename: "Smite",
                        resource: "Combat - Smite",
                        namespace: "minecraft",
                        identifier: "minecraft:combat/smite"
                    }
                },
                {
                    key: "custom:combat/power",
                    context: {
                        filename: "Power",
                        resource: "Combat - Power",
                        namespace: "custom",
                        identifier: "custom:combat/power"
                    }
                }
            ];

            for (const expected of expectedElements) {
                const found = result.find((r) => r.key === expected.key);
                expect(found).toBeDefined();
                expect(found?.context).toMatchObject(expected.context);
            }
        });
    });

    describe("resolveIterationValue", () => {
        it("should resolve current_iteration context", () => {
            const value = {
                type: "get_value_from_context",
                key: "current_iteration"
            };
            const context = { current_iteration: "test_value" };

            expect(resolveIterationValue(value, context)).toBe("test_value");
        });

        it("should resolve filename context", () => {
            const value = { type: "get_value_from_context", key: "filename" };
            const context = {
                filename: "Test",
                resource: "test/path",
                namespace: "minecraft",
                identifier: "minecraft:test"
            };

            expect(resolveIterationValue(value, context)).toBe("Test");
        });

        it("should resolve object_data context", () => {
            const value = { type: "get_value_from_context", key: "value" };
            const context = {
                object_data: {
                    id: "test",
                    value: 42
                }
            };

            expect(resolveIterationValue(value, context)).toBe(42);
        });

        it("should return original value for non-context values", () => {
            const value = "static_value";
            expect(resolveIterationValue(value, undefined)).toBe("static_value");
        });
    });

    describe("collectFromPath", () => {
        const mockFiles = {
            "pack.mcmeta": new TextEncoder().encode(JSON.stringify({ pack: { pack_format: 61, description: "lorem ipsum" } })),
            "data/minecraft/enchantment/combat/sharpness.json": new TextEncoder().encode(JSON.stringify({ id: "minecraft:sharpness" })),
            "data/minecraft/enchantment/protection/fire.json": new TextEncoder().encode(
                JSON.stringify({ id: "minecraft:fire_protection" })
            ),
            "data/custom/enchantment/combat/power.json": new TextEncoder().encode(JSON.stringify({ id: "custom:power" }))
        };

        it("should collect elements from specific path", () => {
            const result = collectFromPath("enchantment", mockFiles, "combat");

            expect(result).toHaveLength(2);
            expect(result.some((r) => r.identifier.resource.includes("sharpness"))).toBe(true);
            expect(result.some((r) => r.identifier.resource.includes("power"))).toBe(true);
        });

        it("should exclude specified namespaces", () => {
            const result = collectFromPath("enchantment", mockFiles, "combat", ["custom"]);

            expect(result).toHaveLength(1);
            expect(result[0].identifier.resource).toContain("sharpness");
        });

        it("should return empty array for non-matching path", () => {
            const result = collectFromPath("enchantment", mockFiles, "invalid/path");

            expect(result).toHaveLength(0);
        });
    });
});
