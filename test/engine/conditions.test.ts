import { describe, it, expect } from "vitest";
import { Condition } from "@/core/engine/Condition";
import { createMockEnchantmentElement } from "@test/template/concept/enchant/VoxelDriven";

describe("Condition System", () => {
    describe("EqualCondition", () => {
        it("should check equals with string", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).equals("supportedItems", "#minecraft:sword");

            expect(condition.result()).toBe(true);
        });

        it("should check equals with number", () => {
            const element = createMockEnchantmentElement({ weight: 10 });
            const condition = new Condition(element.data).equals("weight", 10);

            expect(condition.result()).toBe(true);
        });

        it("should check equals with mode", () => {
            const element = createMockEnchantmentElement({ mode: "only_creative" });
            const condition = new Condition(element.data).equals("mode", "only_creative");

            expect(condition.result()).toBe(true);
        });

        it("should check string equality with equalsFieldValue", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).equalsFieldValue("supportedItems", "#minecraft:sword");

            expect(condition.result()).toBe(true);
        });

        it("should check undefined equality", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).isUndefined("exclusiveSet");

            expect(condition.result()).toBe(true);
        });
    });

    describe("ContainCondition", () => {
        it("should check string array contains", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).contains("slots", ["head"]);

            expect(condition.result()).toBe(true);
        });

        it("should check tags contains", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).contains("tags", ["#minecraft:enchantable/bow"]);

            expect(condition.result()).toBe(true);
        });

        it("should return false when array doesn't contain value", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).contains("slots", ["invalid_slot"]);

            expect(condition.result()).toBe(false);
        });
    });

    describe("NotCondition", () => {
        it("should invert condition result", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).not((c) => c.equals("supportedItems", "#minecraft:axe").result());

            expect(condition.result()).toBe(true);
        });

        it("should invert false to true", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).not((c) => c.contains("slots", ["invalid_slot"]).result());

            expect(condition.result()).toBe(true);
        });
    });

    describe("AllOfCondition", () => {
        it("should check all conditions are true", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data)
                .contains("slots", ["head"])
                .allOf((c) => c.contains("tags", ["#minecraft:enchantable/bow"]));

            expect(condition.result()).toBe(true);
        });

        it("should return false if any condition is false", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data)
                .contains("slots", ["head"])
                .allOf((c) => c.contains("tags", ["#minecraft:enchantable/crossbow"]));

            expect(condition.result()).toBe(false);
        });

        it("should handle multiple allOf conditions", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data)
                .contains("slots", ["head"])
                .allOf((c) => c.contains("tags", ["#minecraft:enchantable/bow"]))
                .allOf((c) => c.equals("maxLevel", 1));

            expect(condition.result()).toBe(true);
        });
    });

    describe("AnyOfCondition", () => {
        it("should check if any condition is true", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data)
                .contains("slots", ["invalid_slot"])
                .anyOf((c) => c.contains("tags", ["#minecraft:enchantable/bow"]));

            expect(condition.result()).toBe(true);
        });

        it("should return false if all conditions are false", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data)
                .contains("slots", ["invalid_slot"])
                .anyOf((c) => c.contains("tags", ["#minecraft:enchantable/crossbow"]));

            expect(condition.result()).toBe(false);
        });

        it("should handle multiple anyOf conditions", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data)
                .contains("slots", ["invalid_slot"])
                .anyOf((c) => c.contains("tags", ["#minecraft:enchantable/crossbow"]))
                .anyOf((c) => c.equals("maxLevel", 1));

            expect(condition.result()).toBe(true);
        });
    });

    describe("ObjectCondition", () => {
        it("should handle object field conditions", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).object("identifier", (c) => c.equals("namespace", "namespace").result());

            expect(condition.result()).toBe(true);
        });

        it("should return false for non-object fields", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).object("maxLevel", (c) => c.equals("someField", "value").result());

            expect(condition.result()).toBe(false);
        });

        it("should return false for undefined object fields", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).object("nonExistentField", (c) => c.equals("someField", "value").result());

            expect(condition.result()).toBe(false);
        });
    });

    describe("CustomCondition", () => {
        it("should handle custom logic", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).custom((el) => el.maxLevel === 1 && el.weight === 1);

            expect(condition.result()).toBe(true);
        });

        it("should handle complex custom logic", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).custom((el) => Array.isArray(el.slots) && el.slots.length > 0);

            expect(condition.result()).toBe(true);
        });
    });

    describe("Complex conditions", () => {
        it("should handle chained conditions", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data)
                .contains("slots", ["head"])
                .equals("maxLevel", 1)
                .contains("tags", ["#minecraft:enchantable/bow"]);

            expect(condition.result()).toBe(true);
        });

        it("should handle mixed condition types", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data)
                .contains("slots", ["head"])
                .allOf((c) => c.equals("maxLevel", 1))
                .not((c) => c.contains("tags", ["#minecraft:enchantable/crossbow"]).result());

            expect(condition.result()).toBe(true);
        });

        it("should short-circuit on false", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data)
                .contains("slots", ["invalid_slot"])
                .equals("maxLevel", 1) // This should not be evaluated
                .contains("tags", ["#minecraft:enchantable/bow"]); // This should not be evaluated

            expect(condition.result()).toBe(false);
        });

        it("should handle complex nested logic", () => {
            const element = createMockEnchantmentElement();
            const condition = new Condition(element.data).allOf((c) =>
                c
                    .anyOf((cc) => cc.contains("slots", ["head"]))
                    .not((cc) => cc.contains("tags", ["#minecraft:enchantable/crossbow"]).result())
            );

            expect(condition.result()).toBe(true);
        });
    });
});
