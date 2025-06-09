import type { StructureSetProps } from "@/core/schema/structure_set/types";
import type { ActionHandler } from "../../types";
import type { StructureSetAction } from "./types";

export class SetPlacementConfigHandler implements ActionHandler<StructureSetAction> {
    execute(
        action: Extract<StructureSetAction, { type: "structure_set.configure_placement" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const structureSet = element as StructureSetProps;

        const updatedElement = { ...structureSet };

        if (action.salt !== undefined) {
            updatedElement.salt = action.salt;
        }
        if (action.frequencyReductionMethod !== undefined) {
            updatedElement.frequencyReductionMethod = action.frequencyReductionMethod;
        }
        if (action.frequency !== undefined) {
            updatedElement.frequency = action.frequency;
        }
        if (action.locateOffset !== undefined) {
            updatedElement.locateOffset = action.locateOffset;
        }

        return updatedElement;
    }
}
