import { describe, it, expect } from "vitest";
import { checkCondition } from "@/core/engine/condition";
import type { Condition } from "@/core/engine/condition/types";
import { createMockEnchantmentElement } from "@test/template/concept/enchant/VoxelDriven";

describe("Condition System", () => {
    describe("EqualCondition", () => {
        it("should check string equality", () => {
            const element = createMockEnchantmentElement();
            const condition: Condition = {
                condition: "compare_value_to_field_value",
                field: "supportedItems",
                value: "#minecraft:sword"
            };

            expect(checkCondition(condition, element.data)).toBe(true);
        });

        it("should check undefined equality", () => {
            const element = createMockEnchantmentElement();
            const condition: Condition = {
                condition: "if_field_is_undefined",
                field: "exclusiveSet"
            };

            expect(checkCondition(condition, element.data)).toBe(true);
        });
    });

    describe("ContainCondition", () => {
        it("should check string array contains", () => {
            const element = createMockEnchantmentElement();
            const condition: Condition = {
                condition: "contains",
                field: "slots",
                values: ["head"]
            };

            expect(checkCondition(condition, element.data)).toBe(true);
        });

        it("should check tags contains", () => {
            const element = createMockEnchantmentElement();
            const condition: Condition = {
                condition: "contains",
                field: "tags",
                values: ["#minecraft:enchantable/bow"]
            };

            expect(checkCondition(condition, element.data)).toBe(true);
        });
    });

    describe("InvertedCondition", () => {
        it("should invert condition result", () => {
            const element = createMockEnchantmentElement();
            const condition: Condition = {
                condition: "inverted",
                terms: {
                    condition: "compare_value_to_field_value",
                    field: "supportedItems",
                    value: "#minecraft:axe"
                }
            };

            expect(checkCondition(condition, element.data)).toBe(true);
        });
    });

    describe("AllOfCondition", () => {
        it("should check all conditions are true", () => {
            const element = createMockEnchantmentElement();
            const condition: Condition = {
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
            };

            expect(checkCondition(condition, element.data)).toBe(true);
        });

        it("should return false if any condition is false", () => {
            const element = createMockEnchantmentElement();
            const condition: Condition = {
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
                        values: ["#minecraft:enchantable/crossbow"]
                    }
                ]
            };

            expect(checkCondition(condition, element.data)).toBe(false);
        });
    });

    describe("AnyOfCondition", () => {
        it("should check if any condition is true", () => {
            const element = createMockEnchantmentElement();
            const condition: Condition = {
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
                        values: ["#minecraft:enchantable/bow"]
                    }
                ]
            };

            expect(checkCondition(condition, element.data)).toBe(true);
        });

        it("should return false if all conditions are false", () => {
            const element = createMockEnchantmentElement();
            const condition: Condition = {
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
            };

            expect(checkCondition(condition, element.data)).toBe(false);
        });
    });

    describe("Complex conditions", () => {
        it("should handle nested conditions", () => {
            const element = createMockEnchantmentElement();
            const condition: Condition = {
                condition: "all_of",
                terms: [
                    {
                        condition: "any_of",
                        terms: [
                            {
                                condition: "contains",
                                field: "slots",
                                values: ["head"]
                            },
                            {
                                condition: "contains",
                                field: "slots",
                                values: ["chest"]
                            }
                        ]
                    },
                    {
                        condition: "inverted",
                        terms: {
                            condition: "contains",
                            field: "tags",
                            values: ["#minecraft:enchantable/crossbow"]
                        }
                    }
                ]
            };

            expect(checkCondition(condition, element.data)).toBe(true);
        });
    });
});
