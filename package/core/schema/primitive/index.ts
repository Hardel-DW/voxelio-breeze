import type { Analysers } from "../../engine/Analyser.ts";
import type { Action } from "../../engine/actions/index.ts";
import type { Condition } from "../../engine/condition/index.ts";
import type { FormComponent } from "../../schema/primitive/component.ts";
import type { Lock } from "../../schema/primitive/component.ts";
import type { TranslateTextType } from "../../schema/primitive/text.ts";

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
