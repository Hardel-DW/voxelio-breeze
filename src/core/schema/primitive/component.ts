import type { Action } from "@/core/engine/actions/types";
import type { Condition } from "@/core/engine/condition/types";
import type { IterationValue, TemplateReplacer } from "@/core/engine/renderer/iteration/type";
import type { ValueRenderer } from "@/core/engine/renderer/value";
import type { TextRenderType, TranslateTextType } from "@/core/schema/primitive/text";

// Base type for common component properties
export type BaseComponent = {
    hide?: Condition;
};

export type BaseInteractiveComponent = BaseComponent & {
    action: Action;
    renderer: ValueRenderer;
    lock?: Lock[];
};

export type Lock = {
    text: TranslateTextType;
    condition: Condition;
};

export type LockRenderer = { isLocked: boolean; text?: TranslateTextType };

// Define container components
export type ToolGridType = BaseComponent & {
    type: "Grid";
    size?: string;
    children: FormComponent[];
};

export type ToolSectionType = BaseComponent & {
    type: "Section";
    id: string;
    title: TranslateTextType;
    children: FormComponent[];
    button?: { text: TranslateTextType; url: string };
};

export type ToolCategoryType = BaseComponent & {
    type: "Category";
    title: TranslateTextType;
    children: FormComponent[];
};

// Special Components
export type ToolIterationType = BaseComponent & {
    type: "Iteration";
    values: IterationValue[];
    template: TemplateReplacer<FormComponent>;
    fallback?: FormComponent;
};

export type BaseDynamicSchema<T> = BaseComponent & {
    elements: T[];
};

export type ToolSectionSelectorType = BaseDynamicSchema<ToolSectionSelectorSection> & {
    type: "SectionSelector";
};

export type ToolSectionSelectorSection = {
    id: string;
    title: TranslateTextType;
};

export type ToolRevealType = BaseDynamicSchema<ToolRevealElementType> & {
    type: "Reveal";
};

export type ToolRevealElementType = {
    id: string;
    title: TranslateTextType;
    soon?: TranslateTextType;
    image: string;
    logo: string;
    href: string;
    description: TranslateTextType;
};

// Interactions Components
export type ToolSelectorType = BaseInteractiveComponent & {
    type: "Selector";
    title: TranslateTextType;
    description: TranslateTextType;
    options: { label: TranslateTextType; value: string }[];
};

export type ToolDonationType = BaseComponent & {
    type: "Donation";
    icon: string;
    title: TranslateTextType;
    description: TranslateTextType;
    subTitle: TranslateTextType;
    extra: TranslateTextType[];
    tipText: {
        text: TranslateTextType;
        link: string;
    };
    patreon: {
        text: TranslateTextType;
        link: string;
    };
};

export type ToolSwitchSlotType = BaseInteractiveComponent & {
    type: "SwitchSlot";
    title: TranslateTextType;
    description: TranslateTextType;
    image?: string;
};

export type ToolSwitchSlotSpecialType = BaseInteractiveComponent & {
    type: "SwitchSlotSpecial";
    title: TranslateTextType;
    description: TranslateTextType;
    image?: string;
    data: {
        registry: string;
        element: string;
    };
};

export type ToolSwitchType = BaseInteractiveComponent & {
    type: "Switch";
    title: TranslateTextType;
    description: TranslateTextType;
};

export type ToolSlotType = BaseInteractiveComponent & {
    type: "Slot";
    description?: TranslateTextType;
    title: TranslateTextType;
    image: string;
    size?: number;
};

export type ToolCounterType = BaseInteractiveComponent & {
    type: "Counter";
    title: TranslateTextType;
    short?: TranslateTextType;
    description?: TranslateTextType;
    image: string;
    min: number;
    max: number;
    step: number;
};

export type ToolRangeType = BaseInteractiveComponent & {
    type: "Range";
    label: TranslateTextType;
    min: number;
    max: number;
    step: number;
};

export type ToolInlineType = BaseInteractiveComponent & {
    type: "InlineSlot";
    description?: TranslateTextType;
    title: TranslateTextType;
    image: string;
};

export type ToolPropertyType = BaseInteractiveComponent & {
    type: "Property";
    condition: Condition;
};

// Define non-container components first
type NonContainerComponent =
    | ToolDonationType
    | ToolSwitchSlotType
    | ToolSwitchSlotSpecialType
    | ToolSwitchType
    | TextRenderType
    | ToolSlotType
    | ToolCounterType
    | ToolRangeType
    | ToolSelectorType
    | ToolInlineType
    | ToolPropertyType;

// Finally, export the complete FormComponent type
export type FormComponent =
    | NonContainerComponent
    | ToolRevealType
    | ToolGridType
    | ToolSectionType
    | ToolSectionSelectorType
    | ToolCategoryType
    | ToolIterationType;
