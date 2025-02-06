import { resolve } from "../renderer/resolve.ts";
import type { InterfaceConfiguration } from "../../schema/primitive/index.ts";
import type { ToolSectionType } from "../../schema/primitive/component.ts";
import type { ToggleSectionMap } from "../../schema/primitive/toggle.ts";

export function calculateInitialToggle(
	interface_: InterfaceConfiguration[],
): ToggleSectionMap {
	const result: ToggleSectionMap = {};

	for (const section of interface_) {
		for (const component of section.components) {
			if (component.type === "Section") {
				const sectionComponent = component as ToolSectionType;
				if (sectionComponent.toggle && sectionComponent.toggle.length > 0) {
					const firstToggle = sectionComponent.toggle[0];

					if (
						typeof sectionComponent.id === "string" &&
						firstToggle &&
						typeof firstToggle === "object"
					) {
						result[sectionComponent.id] = resolve(firstToggle, {});
					}
				}
			}
		}
	}

	return result;
}
