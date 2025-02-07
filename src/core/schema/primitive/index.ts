import type { Analysers } from "@/core/engine/Analyser";
import type { Action } from "@/core/engine/actions";
import type { Condition } from "@/core/engine/condition";
import type { FormComponent } from "@/core/schema/primitive/component";
import type { Lock } from "@/core/schema/primitive/component";
import type { TranslateTextType } from "@/core/schema/primitive/text";

export type SidebarConfig = {
    action: Action;
    enabled?: Condition;
    lock?: Lock[];
};

export type ToolConfiguration = {
    interface: InterfaceConfiguration[];
    sidebar: SidebarConfig;
    analyser: keyof Analysers;
};

export type InterfaceConfiguration = {
    disabled?: boolean;
    id: string;
    components: FormComponent[];
    section: TranslateTextType;
    soon?: boolean;
};
