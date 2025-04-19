import type { Analysers } from "@/core/engine/Analyser";
import type { FormComponent } from "@/core/schema/primitive/component";
import type { TranslateTextType } from "@/core/schema/primitive/text";

export type ToolTab = {
    id: string;
    section: TranslateTextType;
    disabled?: boolean;
    soon?: boolean;
};

export type ToolConfiguration = {
    tabs: ToolTab[];
    id: keyof Analysers;
};

export type InterfaceConfiguration = {
    id: string;
    components: FormComponent[];
};

export type FieldConfiguration = Record<
    string,
    {
        name: TranslateTextType;
        type: string;
        icon?: string;
    }
>;
