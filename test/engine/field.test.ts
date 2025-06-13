import { Condition } from "@/core/engine/Condition";
import { ValueSelector } from "@/core/engine/ValueSelector";
import { describe, expect, it } from "vitest";
import { createMockEnchantmentElement } from "@test/template/concept/enchant/VoxelDriven";

describe("getConditionFields", () => {
    it("should return empty array for unused condition", () => {
        const element = createMockEnchantmentElement();
        const condition = new Condition(element.data);
        expect(condition.getFields()).toEqual([]);
    });

    it("should return field for basic condition", () => {
        const element = createMockEnchantmentElement();
        const condition = new Condition(element.data).equals("test_field", "test_value");
        expect(condition.getFields()).toEqual(["test_field"]);
    });

    it("should return field for contains condition", () => {
        const element = createMockEnchantmentElement();
        const condition = new Condition(element.data).contains("array_field", ["value1", "value2"]);
        expect(condition.getFields()).toEqual(["array_field"]);
    });

    it("should return field for isUndefined condition", () => {
        const element = createMockEnchantmentElement();
        const condition = new Condition(element.data).isUndefined("test_field");
        expect(condition.getFields()).toEqual(["test_field"]);
    });

    it("should return field for equalsFieldValue condition", () => {
        const element = createMockEnchantmentElement();
        const condition = new Condition(element.data).equalsFieldValue("test_field", "test_value");
        expect(condition.getFields()).toEqual(["test_field"]);
    });

    it("should return field for object condition", () => {
        const element = createMockEnchantmentElement();
        const condition = new Condition(element.data).object("parent_field", (c) => c.equals("nested_field", "test_value").result());
        expect(condition.getFields()).toEqual(["parent_field"]);
    });

    it("should combine fields from multiple conditions", () => {
        const element = createMockEnchantmentElement();
        const condition = new Condition(element.data).equals("field1", "value1").contains("field2", ["value2"]).isUndefined("field3");
        expect(condition.getFields()).toEqual(["field1", "field2", "field3"]);
    });

    it("should handle allOf conditions", () => {
        const element = createMockEnchantmentElement();
        const condition = new Condition(element.data).equals("field1", "value1").allOf((c) => c.equals("field2", "value2"));
        expect(condition.getFields()).toEqual(["field1"]);
    });

    it("should handle anyOf conditions", () => {
        const element = createMockEnchantmentElement();
        const condition = new Condition(element.data).equals("field1", "value1").anyOf((c) => c.equals("field2", "value2"));
        expect(condition.getFields()).toEqual(["field1"]);
    });

    it("should handle not conditions", () => {
        const element = createMockEnchantmentElement();
        const condition = new Condition(element.data).not((c) => c.equals("field1", "value1").result());
        expect(condition.getFields()).toEqual([]);
    });

    it("should handle custom conditions", () => {
        const element = createMockEnchantmentElement();
        const condition = new Condition(element.data).equals("field1", "value1").custom((el) => el.field2 === "value2");
        expect(condition.getFields()).toEqual(["field1"]);
    });
});

describe("getSelectorFields", () => {
    it("should return field from field selector", () => {
        const selector = new ValueSelector().if(() => true).field("test_field");
        expect(selector.getFields()).toEqual(["test_field"]);
    });

    it("should return empty array for value selector", () => {
        const selector = new ValueSelector().if(() => true).value("test_value");
        expect(selector.getFields()).toEqual([]);
    });

    it("should combine fields from multiple selectors", () => {
        const selector = new ValueSelector()
            .if(() => false)
            .field("field1")
            .elseIf(() => false)
            .field("field2")
            .else()
            .field("field3");
        expect(selector.getFields()).toEqual(["field1", "field2", "field3"]);
    });

    it("should handle mixed field and value selectors", () => {
        const selector = new ValueSelector()
            .if(() => false)
            .field("field1")
            .elseIf(() => false)
            .value("hardcoded")
            .else()
            .field("field2");
        expect(selector.getFields()).toEqual(["field1", "field2"]);
    });

    it("should handle selector with only values", () => {
        const selector = new ValueSelector()
            .if(() => false)
            .value("value1")
            .else()
            .value("value2");
        expect(selector.getFields()).toEqual([]);
    });

    it("should handle selector with single field", () => {
        const selector = new ValueSelector().if(() => true).field("single_field");
        expect(selector.getFields()).toEqual(["single_field"]);
    });

    it("should handle complex selector chains", () => {
        const selector = new ValueSelector()
            .if(() => false)
            .field("condition_field")
            .elseIf(() => false)
            .field("true_field")
            .elseIf(() => false)
            .value("hardcoded")
            .else()
            .field("false_field");
        expect(selector.getFields()).toEqual(["condition_field", "true_field", "false_field"]);
    });

    it("should not duplicate field names", () => {
        const selector = new ValueSelector()
            .if(() => false)
            .field("same_field")
            .elseIf(() => false)
            .field("same_field")
            .else()
            .field("different_field");
        expect(selector.getFields()).toEqual(["same_field", "different_field"]);
    });
});
