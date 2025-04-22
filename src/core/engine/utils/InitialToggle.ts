import type { ToolSectionType } from "@/core/schema/primitive/component";
export const getInitialToggle = (section: ToolSectionType) => (section.toggle && section.toggle.length > 0 ? section.toggle[0] : undefined);
