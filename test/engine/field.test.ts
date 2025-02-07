import { getConditionFields, getLockFields, getRendererFields } from "@/core/engine/utils/field";
import type { Condition } from "@/core/engine/condition/types";
import type { Lock } from "@/core/schema/primitive/component";
import { describe, expect, it } from "vitest";
import type { ValueRenderer } from "@/core/engine/renderer/value";

describe("getConditionFields", () => {
    it("should return empty array for undefined condition", () => {
        expect(getConditionFields(undefined)).toEqual([]);
    });

    it("should return field for basic condition", () => {
        const condition: Condition = {
            condition: "compare_value_to_field_value",
            field: "test_field",
            value: "test_value"
        };
        expect(getConditionFields(condition)).toEqual(["test_field"]);
    });

    it("should return empty array for compare_to_value condition", () => {
        const condition: Condition = {
            condition: "compare_to_value",
            compare: "test",
            value: "test"
        };
        expect(getConditionFields(condition)).toEqual([]);
    });

    it("should combine fields from all_of condition", () => {
        const condition: Condition = {
            condition: "all_of",
            terms: [
                {
                    condition: "compare_value_to_field_value",
                    field: "field1",
                    value: "value1"
                },
                {
                    condition: "compare_value_to_field_value",
                    field: "field2",
                    value: "value2"
                }
            ]
        };
        expect(getConditionFields(condition)).toEqual(["field1", "field2"]);
    });

    it("should combine fields from any_of condition", () => {
        const condition: Condition = {
            condition: "any_of",
            terms: [
                {
                    condition: "compare_value_to_field_value",
                    field: "field1",
                    value: "value1"
                },
                {
                    condition: "compare_value_to_field_value",
                    field: "field2",
                    value: "value2"
                }
            ]
        };
        expect(getConditionFields(condition)).toEqual(["field1", "field2"]);
    });

    it("should get fields from inverted condition", () => {
        const condition: Condition = {
            condition: "inverted",
            terms: {
                condition: "compare_value_to_field_value",
                field: "test_field",
                value: "test_value"
            }
        };
        expect(getConditionFields(condition)).toEqual(["test_field"]);
    });

    it("should get fields from object condition", () => {
        const condition: Condition = {
            condition: "object",
            field: "parent_field",
            terms: {
                condition: "compare_value_to_field_value",
                field: "nested_field",
                value: "test_value"
            }
        };
        expect(getConditionFields(condition)).toEqual(["parent_field"]);
    });

    it("should get fields from contains condition", () => {
        const condition: Condition = {
            condition: "contains",
            field: "array_field",
            values: ["value1", "value2"]
        };
        expect(getConditionFields(condition)).toEqual(["array_field"]);
    });

    it("should handle complex nested conditions", () => {
        const condition: Condition = {
            condition: "all_of",
            terms: [
                {
                    condition: "any_of",
                    terms: [
                        {
                            condition: "compare_value_to_field_value",
                            field: "field1",
                            value: "value1"
                        },
                        {
                            condition: "compare_value_to_field_value",
                            field: "field2",
                            value: "value2"
                        }
                    ]
                },
                {
                    condition: "inverted",
                    terms: {
                        condition: "compare_value_to_field_value",
                        field: "field3",
                        value: "value3"
                    }
                }
            ]
        };
        expect(getConditionFields(condition)).toEqual(["field1", "field2", "field3"]);
    });
});

describe("getRendererFields", () => {
    it("should return field from from_field renderer", () => {
        const renderer: ValueRenderer = {
            type: "from_field",
            field: "test_field"
        };
        expect(getRendererFields(renderer)).toEqual(["test_field"]);
    });

    it("should return empty array for hardcoded renderer", () => {
        const renderer: ValueRenderer = {
            type: "hardcoded",
            value: "test_value"
        };
        expect(getRendererFields(renderer)).toEqual([]);
    });

    it("should return condition fields for conditional renderer with return_condition", () => {
        const renderer: ValueRenderer = {
            type: "conditionnal",
            term: {
                condition: "compare_value_to_field_value",
                field: "condition_field",
                value: "test"
            },
            return_condition: true
        };
        expect(getRendererFields(renderer)).toEqual(["condition_field"]);
    });

    it("should combine fields from condition and on_true/on_false renderers", () => {
        const renderer: ValueRenderer = {
            type: "conditionnal",
            term: {
                condition: "compare_value_to_field_value",
                field: "condition_field",
                value: "test"
            },
            on_true: {
                type: "from_field",
                field: "true_field"
            },
            on_false: {
                type: "from_field",
                field: "false_field"
            }
        };
        expect(getRendererFields(renderer)).toEqual(["condition_field", "true_field", "false_field"]);
    });

    it("should handle conditional renderer with only on_true", () => {
        const renderer: ValueRenderer = {
            type: "conditionnal",
            term: {
                condition: "compare_value_to_field_value",
                field: "condition_field",
                value: "test"
            },
            on_true: {
                type: "from_field",
                field: "true_field"
            }
        };
        expect(getRendererFields(renderer)).toEqual(["condition_field", "true_field"]);
    });

    it("should handle nested conditional renderers", () => {
        const renderer: ValueRenderer = {
            type: "conditionnal",
            term: {
                condition: "compare_value_to_field_value",
                field: "condition1",
                value: "test"
            },
            on_true: {
                type: "from_field",
                field: "field2"
            }
        };
        expect(getRendererFields(renderer)).toEqual(["condition1", "field2"]);
    });

    it("should handle conditional renderer with hardcoded values", () => {
        const renderer: ValueRenderer = {
            type: "conditionnal",
            term: {
                condition: "compare_value_to_field_value",
                field: "condition_field",
                value: "test"
            },
            on_true: {
                type: "hardcoded",
                value: "true_value"
            },
            on_false: {
                type: "hardcoded",
                value: "false_value"
            }
        };
        expect(getRendererFields(renderer)).toEqual(["condition_field"]);
    });
});

describe("getLockFields", () => {
    it("should return empty array for empty locks array", () => {
        expect(getLockFields([])).toEqual([]);
    });

    it("should get fields from single lock condition", () => {
        const locks: Lock[] = [
            {
                text: "test_text",
                condition: {
                    condition: "compare_value_to_field_value",
                    field: "lock_field",
                    value: "test"
                }
            }
        ];
        expect(getLockFields(locks)).toEqual(["lock_field"]);
    });

    it("should combine fields from multiple locks", () => {
        const locks: Lock[] = [
            {
                text: "lock1",
                condition: {
                    condition: "compare_value_to_field_value",
                    field: "field1",
                    value: "test1"
                }
            },
            {
                text: "lock2",
                condition: {
                    condition: "compare_value_to_field_value",
                    field: "field2",
                    value: "test2"
                }
            }
        ];
        expect(getLockFields(locks)).toEqual(["field1", "field2"]);
    });

    it("should handle complex lock conditions", () => {
        const locks: Lock[] = [
            {
                text: "complex_lock",
                condition: {
                    condition: "all_of",
                    terms: [
                        {
                            condition: "compare_value_to_field_value",
                            field: "field1",
                            value: "test1"
                        },
                        {
                            condition: "object",
                            field: "parent_field",
                            terms: {
                                condition: "compare_value_to_field_value",
                                field: "field2",
                                value: "test2"
                            }
                        }
                    ]
                }
            }
        ];
        expect(getLockFields(locks)).toEqual(["field1", "parent_field"]);
    });
});
