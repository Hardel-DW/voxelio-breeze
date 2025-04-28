import type { Analysers } from "@/core/engine/Analyser";
import type { FormComponent } from "@/core/schema/primitive/component";
import type { TranslateTextType } from "@/core/schema/primitive/text";

export type RoadmapKeysCollection = {
    [registryId: string]: Roadmap;
};

export type Roadmap = {
    field: string | null;
    sections: ToolTab[];
    schema: { id: string; content: string; hash: string }[];
};

export type ToolTab = {
    id: string;
    disabled?: boolean;
    soon?: boolean;
    text: TranslateTextType | undefined;
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
        type: FieldType;
        icon?: string;
    }
>;

export type FieldType = "string" | "number" | "boolean" | "array" | "tags" | "effects" | "deleted";
