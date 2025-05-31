import { describe, it, expect } from "vitest";
import { getValue, type ValueRenderer } from "@/core/engine/renderer/value";
import { createMockEnchantmentElement } from "@test/template/concept/enchant/VoxelDriven";

describe("Value System", () => {
    describe("Simple Value", () => {
        it("should return hardcoded value", () => {
            const element = createMockEnchantmentElement();
            const renderer: ValueRenderer = {
                type: "hardcoded",
                value: 42
            };

            expect(getValue(renderer, element.data)).toBe(42);
        });

        it("should return value from field", () => {
            const element = createMockEnchantmentElement();
            const renderer: ValueRenderer = {
                type: "from_field",
                field: "maxLevel"
            };

            expect(getValue(renderer, element.data)).toBe(1);
        });

        it("should return null when condition is false", () => {
            const element = createMockEnchantmentElement();
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
            const element = createMockEnchantmentElement();
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
            const element = createMockEnchantmentElement();
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
            const element = createMockEnchantmentElement();
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
            const element = createMockEnchantmentElement();
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
            const element = createMockEnchantmentElement();
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
            const element = createMockEnchantmentElement();
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
            const element = createMockEnchantmentElement();
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
            const element = createMockEnchantmentElement();
            const renderer: ValueRenderer = {
                type: "hardcoded",
                value: 42
            };

            expect(getValue(renderer, element.data)).toBe(42);
        });

        it("should handle string values", () => {
            const element = createMockEnchantmentElement();
            const renderer: ValueRenderer = {
                type: "hardcoded",
                value: "test"
            };

            expect(getValue(renderer, element.data)).toBe("test");
        });
    });
});
