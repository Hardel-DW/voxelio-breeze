import { describe, it, expect } from "vitest";
import { ValueSelector } from "@/core/engine/ValueSelector";
import { Condition } from "@/core/engine/Condition";
import { createMockEnchantmentElement } from "@test/template/concept/enchant/VoxelDriven";

describe("Value System", () => {
    describe("Simple Value", () => {
        it("should return hardcoded value", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector().if(() => true).value(42);

            expect(selector.get(element.data)).toBe(42);
        });

        it("should return value from field", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector().if(() => true).field("maxLevel");

            expect(selector.get(element.data)).toBe(1);
        });

        it("should throw error when no matching case", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector().if((el) => new Condition(el).contains("slots", ["invalid_slot"]).result()).value(42);

            expect(() => selector.get(element.data)).toThrow("No matching case in ValueSelector");
        });
    });

    describe("Conditional Selection", () => {
        it("should return value when condition is met", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector()
                .if((el) => new Condition(el).contains("slots", ["head"]).result())
                .value(42)
                .else()
                .value(0);

            expect(selector.get(element.data)).toBe(42);
        });

        it("should return else value when condition is not met", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector()
                .if((el) => new Condition(el).contains("slots", ["invalid_slot"]).result())
                .value(42)
                .else()
                .value(0);

            expect(selector.get(element.data)).toBe(0);
        });

        it("should return field value when condition is true", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector()
                .if((el) => new Condition(el).contains("slots", ["head"]).result())
                .field("maxLevel")
                .else()
                .value(0);

            expect(selector.get(element.data)).toBe(1);
        });

        it("should return else field when condition is false", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector()
                .if((el) => new Condition(el).contains("slots", ["invalid_slot"]).result())
                .field("maxLevel")
                .else()
                .field("weight");

            expect(selector.get(element.data)).toBe(1); // weight default value
        });

        it("should handle multiple elseIf conditions", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector()
                .if((el) => new Condition(el).contains("slots", ["invalid_slot"]).result())
                .value(1)
                .elseIf((el) => new Condition(el).contains("tags", ["#minecraft:enchantable/bow"]).result())
                .value(2)
                .else()
                .value(3);

            expect(selector.get(element.data)).toBe(2);
        });
    });

    describe("Complex Conditions", () => {
        it("should handle allOf conditions", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector()
                .if((el) =>
                    new Condition(el)
                        .contains("slots", ["head"])
                        .allOf((c) => c.contains("tags", ["#minecraft:enchantable/bow"]))
                        .result()
                )
                .value(42)
                .else()
                .value(0);

            expect(selector.get(element.data)).toBe(42);
        });

        it("should handle anyOf conditions", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector()
                .if((el) =>
                    new Condition(el)
                        .contains("slots", ["invalid_slot"])
                        .anyOf((c) => c.contains("tags", ["#minecraft:enchantable/bow"]))
                        .result()
                )
                .value(42)
                .else()
                .value(0);

            expect(selector.get(element.data)).toBe(42);
        });

        it("should handle not conditions", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector()
                .if((el) => new Condition(el).not((c) => c.contains("slots", ["invalid_slot"]).result()).result())
                .value(42)
                .else()
                .value(0);

            expect(selector.get(element.data)).toBe(42);
        });
    });

    describe("Different Value Types", () => {
        it("should handle number values", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector().if(() => true).value(42);

            expect(selector.get(element.data)).toBe(42);
        });

        it("should handle string values", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector().if(() => true).value("test");

            expect(selector.get(element.data)).toBe("test");
        });

        it("should handle boolean values", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector().if(() => true).value(true);

            expect(selector.get(element.data)).toBe(true);
        });

        it("should handle undefined values", () => {
            const element = createMockEnchantmentElement();
            const selector = new ValueSelector()
                .if(() => false)
                .value(42)
                .else();

            expect(selector.get(element.data)).toBeUndefined();
        });
    });
});
