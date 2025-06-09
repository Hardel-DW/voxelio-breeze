import type { StructureSetProps } from "@/core/schema/structure_set/types";
import type { ActionHandler } from "../../types";
import type { StructureSetAction } from "./types";

export class ConfigureConcentricRingsHandler implements ActionHandler<StructureSetAction> {
    execute(
        action: Extract<StructureSetAction, { type: "structure_set.configure_concentric_rings" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const structureSet = element as StructureSetProps;

        const updatedElement = { ...structureSet };

        // Update concentric rings specific properties
        if (action.distance !== undefined) {
            updatedElement.distance = action.distance;
        }
        if (action.spread !== undefined) {
            updatedElement.spread = action.spread;
        }
        if (action.count !== undefined) {
            updatedElement.count = action.count;
        }
        if (action.preferredBiomes !== undefined) {
            updatedElement.preferredBiomes = action.preferredBiomes;
        }

        return updatedElement;
    }
}
