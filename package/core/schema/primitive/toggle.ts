import type { TranslateTextType } from "@/lib/minecraft/core/schema/primitive/text";

export type ToggleSection = {
    name: string;
    field?: string;
    title: TranslateTextType;
    description: TranslateTextType;
};

export type ToggleSectionMap = Record<string, ToggleSection>;
