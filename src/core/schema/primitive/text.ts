import type { BaseComponent } from "@/core/schema/primitive/component";

export type InternalTranslateType = {
    type: "translate";
    value: string;
    replace?: string[];
};

export type TextRenderType = BaseComponent & {
    type: "Text";
    content: TextContent[];
};

export type ToolParagraphType = {
    type: "Paragraph";
    content: TranslateTextType;
};

export type ToolListItemType = {
    type: "ListItem";
    content: TranslateTextType;
};

export type ToolUnorderedListType = {
    type: "UnorderedList";
    sublist: UnorderedListChildren[];
};

export type UnorderedListChildren = ToolListItemType | ToolUnorderedListType;
export type TextContent = ToolParagraphType | UnorderedListChildren;
export type TranslateTextType = string | InternalTranslateType;
