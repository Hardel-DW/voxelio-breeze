import { describe, it, expect } from "vitest";
import { getValue, type ValueRenderer } from "@/core/engine/renderer/value";
import type { VoxelRegistryElement } from "@/core/Element";
import type { EnchantmentProps } from "@/core/schema/EnchantmentProps";

const createMockElement = (data: Partial<EnchantmentProps> = {}): VoxelRegistryElement<EnchantmentProps> => ({
    identifier: "foo",
    data: {
        identifier: { namespace: "namespace", resource: "enchantment", registry: "foo" },
        description: { translate: "enchantment.test.foo" },
        exclusiveSet: undefined,
        supportedItems: "#minecraft:sword",
        primaryItems: undefined,
        maxLevel: 1,
        weight: 1,
        anvilCost: 1,
        minCostBase: 1,
        minCostPerLevelAboveFirst: 1,
        maxCostBase: 10,
        maxCostPerLevelAboveFirst: 10,
        effects: undefined,
        mode: "normal",
        slots: ["head", "chest"],
        tags: ["#minecraft:enchantable/bow", "#minecraft:enchantable/armor"],
        disabledEffects: [],
        ...data
    }
});

describe("Value System", () => {
    describe("Simple Value", () => {
        it("should return hardcoded value", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "hardcoded",
                value: 42
            };

            expect(getValue(renderer, element.data)).toBe(42);
        });

        it("should return value from field", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "from_field",
                field: "maxLevel"
            };

            expect(getValue(renderer, element.data)).toBe(1);
        });

        it("should return null when condition is false", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "conditionnal",
                term: {
                    condition: "contains",
                    field: "slots",
                    values: ["invalid_slot"]
                }
            };

            expect(() => getValue(renderer, element.data)).toThrow("Conditionnal renderer has no fallback");
        });
    });

    describe("Conditional Rendering", () => {
        it("should return true when condition is met", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "conditionnal",
                term: {
                    condition: "contains",
                    field: "slots",
                    values: ["head"]
                },
                return_condition: true
            };

            expect(getValue(renderer, element.data)).toBe(true);
        });

        it("should return false when condition is not met", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "conditionnal",
                term: {
                    condition: "contains",
                    field: "slots",
                    values: ["invalid_slot"]
                },
                return_condition: true
            };

            expect(getValue(renderer, element.data)).toBe(false);
        });

        it("should return value from on_true when condition is true", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "conditionnal",
                term: {
                    condition: "contains",
                    field: "slots",
                    values: ["head"]
                },
                on_true: {
                    type: "hardcoded",
                    value: 42
                }
            };

            expect(getValue(renderer, element.data)).toBe(42);
        });

        it("should return value from on_false when condition is false", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "conditionnal",
                term: {
                    condition: "contains",
                    field: "slots",
                    values: ["invalid_slot"]
                },
                on_false: {
                    type: "hardcoded",
                    value: 42
                }
            };

            expect(getValue(renderer, element.data)).toBe(42);
        });

        it("should throw error when no fallback is provided", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "conditionnal",
                term: {
                    condition: "contains",
                    field: "slots",
                    values: ["invalid_slot"]
                }
            };

            expect(() => getValue(renderer, element.data)).toThrow("Conditionnal renderer has no fallback");
        });
    });

    describe("Complex Conditions", () => {
        it("should handle all_of conditions", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "conditionnal",
                term: {
                    condition: "all_of",
                    terms: [
                        {
                            condition: "contains",
                            field: "slots",
                            values: ["head"]
                        },
                        {
                            condition: "contains",
                            field: "tags",
                            values: ["#minecraft:enchantable/bow"]
                        }
                    ]
                },
                on_true: {
                    type: "hardcoded",
                    value: 42
                }
            };

            expect(getValue(renderer, element.data)).toBe(42);
        });

        it("should handle any_of conditions", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "conditionnal",
                term: {
                    condition: "any_of",
                    terms: [
                        {
                            condition: "contains",
                            field: "slots",
                            values: ["invalid_slot"]
                        },
                        {
                            condition: "contains",
                            field: "tags",
                            values: ["#minecraft:enchantable/crossbow"]
                        }
                    ]
                },
                on_true: {
                    type: "hardcoded",
                    value: 42
                }
            };

            expect(() => getValue(renderer, element.data)).toThrow("Conditionnal renderer has no fallback");
        });
    });

    describe("Different Value Types", () => {
        it("should handle number values", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "hardcoded",
                value: 42
            };

            expect(getValue(renderer, element.data)).toBe(42);
        });

        it("should handle string values", () => {
            const element = createMockElement();
            const renderer: ValueRenderer = {
                type: "hardcoded",
                value: "test"
            };

            expect(getValue(renderer, element.data)).toBe("test");
        });
    });
});
