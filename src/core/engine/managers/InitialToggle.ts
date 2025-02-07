import { resolve } from "@/core/engine/renderer/resolve";
import type { InterfaceConfiguration } from "@/core/schema/primitive";
import type { ToolSectionType } from "@/core/schema/primitive/component";
import type { ToggleSectionMap } from "@/core/schema/primitive/toggle";

export function calculateInitialToggle(interface_: InterfaceConfiguration[]): ToggleSectionMap {
    const result: ToggleSectionMap = {};

    for (const section of interface_) {
        for (const component of section.components) {
            if (component.type === "Section") {
                const sectionComponent = component as ToolSectionType;
                if (sectionComponent.toggle && sectionComponent.toggle.length > 0) {
                    const firstToggle = sectionComponent.toggle[0];

                    if (typeof sectionComponent.id === "string" && firstToggle && typeof firstToggle === "object") {
                        result[sectionComponent.id] = resolve(firstToggle, {});
                    }
                }
            }
        }
    }

    return result;
}
