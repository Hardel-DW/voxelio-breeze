import type { ToggleSection } from "@/core/schema/primitive/toggle";

export const getInitialToggle = (section: ToggleSection[]) => (section.length > 0 ? section[0] : undefined);
