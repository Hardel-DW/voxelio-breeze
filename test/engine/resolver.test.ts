import { describe, it, expect } from "vitest";
import { resolveField } from "@/core/engine/renderer/resolve";
import type { ToggleSectionMap } from "@/core/schema/primitive/toggle";

describe("Field Resolver", () => {
    const context: ToggleSectionMap = {
        effects: {
            field: "minecraft:strength",
            name: "Strength",
            title: {
                type: "translate",
                value: "toggle.minecraft.strength"
            },
            description: {
                type: "translate",
                value: "toggle.minecraft.strength.description"
            }
        },
        damage: {
            field: "minecraft:damage",
            name: "Damage",
            title: {
                type: "translate",
                value: "toggle.minecraft.damage"
            },
            description: {
                type: "translate",
                value: "toggle.minecraft.damage.description"
            }
        }
    };

    describe("Basic resolution", () => {
        it("should pass through primitive values", () => {
            expect(resolveField(42, context)).toBe(42);
            expect(resolveField("test", context)).toBe("test");
            expect(resolveField(true, context)).toBe(true);
            expect(resolveField(null, context)).toBe(null);
            expect(resolveField(undefined, context)).toBe(undefined);
            expect(resolveField({ a: 1, b: 2 }, context)).toEqual({ a: 1, b: 2 });
        });

        it("should handle arrays", () => {
            const input = ["test", 42, true];
            expect(resolveField(input, context)).toEqual(input);
        });

        it("should handle nested objects", () => {
            const input = {
                a: 1,
                b: "test",
                c: { d: true }
            };
            expect(resolveField(input, context)).toEqual(input);
        });
    });

    describe("Toggle field resolution", () => {
        it("should resolve toggle field", () => {
            const input = "$resolver.field$:effects";
            expect(resolveField(input, context)).toBe("minecraft:strength");
        });

        it("should resolve toggle name", () => {
            const input = "$resolver.name$:effects";
            expect(resolveField(input, context)).toBe("Strength");
        });

        it("should throw error for missing toggle section", () => {
            const input = "$resolver.field$:effects";
            expect(() => resolveField(input, {})).toThrow("no toggle section provided");
        });

        it("should throw error for unknown toggle group", () => {
            const input = "$resolver.field$:unknown";
            expect(() => resolveField(input, context)).toThrow("Toggle field not found for group: unknown");
        });
    });

    describe("Complex object resolution", () => {
        it("should resolve nested toggle fields", () => {
            const input = {
                name: "Test",
                effect: "$resolver.field$:effects",
                display: "$resolver.name$:effects",
                values: ["$resolver.field$:damage"]
            };

            const expected = {
                name: "Test",
                effect: "minecraft:strength",
                display: "Strength",
                values: ["minecraft:damage"]
            };

            expect(resolveField(input, context)).toEqual(expected);
        });

        it("should handle mixed content arrays", () => {
            const input = {
                effects: ["$resolver.field$:effects", "static_value", 42, "$resolver.name$:damage"]
            };

            const expected = {
                effects: ["minecraft:strength", "static_value", 42, "Damage"]
            };

            expect(resolveField(input, context)).toEqual(expected);
        });

        it("should preserve object type for non-toggle fields", () => {
            const input = {
                type: "regular_type",
                value: 42,
                nested: {
                    type: "another_type",
                    field: "test"
                }
            };

            expect(resolveField(input, context)).toEqual(input);
        });
    });
});
