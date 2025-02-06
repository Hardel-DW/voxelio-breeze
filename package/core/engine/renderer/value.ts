import { type Condition, checkCondition } from "@/core/engine/condition/index";

type ConditionnalValueRendererBase = {
    type: "conditionnal";
    term: Condition;
};

type ReturnConditionRenderer = ConditionnalValueRendererBase & {
    return_condition: true;
};

type OnTrueFalseRenderer = ConditionnalValueRendererBase & {
    return_condition?: false;
    on_true?: FieldValueRenderer | RawValueRenderer;
    on_false?: FieldValueRenderer | RawValueRenderer;
};

export type ConditionnalValueRenderer = ReturnConditionRenderer | OnTrueFalseRenderer;

export type RawValueRenderer = {
    type: "hardcoded";
    value: string | number | boolean | string[] | number[] | boolean[];
};

export type FieldValueRenderer = {
    type: "from_field";
    field: string;
};

export type ValueRenderer = ConditionnalValueRenderer | RawValueRenderer | FieldValueRenderer;

export type ReturnValue<K> = K;

export function getValue<K>(renderer: ValueRenderer, element: Record<string, unknown>): ReturnValue<K> {
    switch (renderer.type) {
        case "conditionnal": {
            const conditionMet = checkCondition(renderer.term, element);
            if ("return_condition" in renderer && renderer.return_condition) {
                return conditionMet as K;
            }

            const renderToUse = conditionMet ? renderer.on_true : renderer.on_false;
            if (renderToUse) {
                return getRendererValue(renderToUse, element);
            }

            throw new Error("Conditionnal renderer has no fallback");
        }
        case "hardcoded":
        case "from_field": {
            return getRendererValue(renderer, element);
        }
        default:
            throw new Error("Unknown renderer type");
    }
}

function getRendererValue<K>(renderer: FieldValueRenderer | RawValueRenderer, element: Record<string, unknown>): K {
    switch (renderer.type) {
        case "from_field":
            return element[renderer.field] as K;
        case "hardcoded":
            return renderer.value as K;
        default:
            throw new Error("Unknown renderer type");
    }
}
