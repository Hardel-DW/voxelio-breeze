import type { ActionHandler } from "../../types";
import type { StructureSetAction } from "./types";
import { createStructureSetHandlers } from "./types";
import { AddStructureHandler } from "./AddStructureHandler";
import { SetPlacementConfigHandler } from "./SetPlacementConfigHandler";
import { ConfigureConcentricRingsHandler } from "./ConfigureConcentricRingsHandler";

export default function register(): Map<string, ActionHandler<StructureSetAction>> {
    const handlerDefinitions = createStructureSetHandlers({
        "structure_set.add_structure": new AddStructureHandler(),
        "structure_set.remove_structure": new RemoveStructureHandler(),
        "structure_set.modify_structure": new ModifyStructureHandler(),
        "structure_set.set_placement_type": new SetPlacementTypeHandler(),
        "structure_set.configure_placement": new SetPlacementConfigHandler(),
        "structure_set.set_exclusion_zone": new SetExclusionZoneHandler(),
        "structure_set.remove_exclusion_zone": new RemoveExclusionZoneHandler(),
        "structure_set.configure_concentric_rings": new ConfigureConcentricRingsHandler(),
        "structure_set.configure_random_spread": new ConfigureRandomSpreadHandler(),
        "structure_set.reorder_structures": new ReorderStructuresHandler()
    });

    return new Map(Object.entries(handlerDefinitions));
}

// Inline handlers for simpler actions
class RemoveStructureHandler implements ActionHandler<StructureSetAction> {
    execute(
        action: Extract<StructureSetAction, { type: "structure_set.remove_structure" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const structureSet = element as any;

        const updatedStructures = structureSet.structures.filter(
            (struct: any, index: number) => `structure_${index}` !== action.structureId
        );

        return {
            ...structureSet,
            structures: updatedStructures
        };
    }
}

class ModifyStructureHandler implements ActionHandler<StructureSetAction> {
    execute(
        action: Extract<StructureSetAction, { type: "structure_set.modify_structure" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const structureSet = element as any;
        const structureIndex = Number.parseInt(action.structureId.replace("structure_", ""));

        if (structureIndex < 0 || structureIndex >= structureSet.structures.length) {
            return structureSet;
        }

        const updatedStructures = [...structureSet.structures];
        updatedStructures[structureIndex] = {
            ...updatedStructures[structureIndex],
            [action.property]: action.value
        };

        return {
            ...structureSet,
            structures: updatedStructures
        };
    }
}

class SetPlacementTypeHandler implements ActionHandler<StructureSetAction> {
    execute(
        action: Extract<StructureSetAction, { type: "structure_set.set_placement_type" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const structureSet = element as any;

        return {
            ...structureSet,
            placementType: action.placementType
        };
    }
}

class SetExclusionZoneHandler implements ActionHandler<StructureSetAction> {
    execute(
        action: Extract<StructureSetAction, { type: "structure_set.set_exclusion_zone" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const structureSet = element as any;

        return {
            ...structureSet,
            exclusionZone: {
                otherSet: action.otherSet,
                chunkCount: action.chunkCount
            }
        };
    }
}

class RemoveExclusionZoneHandler implements ActionHandler<StructureSetAction> {
    execute(
        action: Extract<StructureSetAction, { type: "structure_set.remove_exclusion_zone" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const structureSet = element as any;
        const { exclusionZone, ...rest } = structureSet;
        return rest;
    }
}

class ConfigureRandomSpreadHandler implements ActionHandler<StructureSetAction> {
    execute(
        action: Extract<StructureSetAction, { type: "structure_set.configure_random_spread" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const structureSet = element as any;

        const updatedElement = { ...structureSet };

        if (action.spacing !== undefined) {
            updatedElement.spacing = action.spacing;
        }
        if (action.separation !== undefined) {
            updatedElement.separation = action.separation;
        }
        if (action.spreadType !== undefined) {
            updatedElement.spreadType = action.spreadType;
        }

        return updatedElement;
    }
}

class ReorderStructuresHandler implements ActionHandler<StructureSetAction> {
    execute(
        action: Extract<StructureSetAction, { type: "structure_set.reorder_structures" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const structureSet = element as any;

        // Reorder structures based on the provided IDs
        const reorderedStructures = action.structureIds
            .map((id) => {
                const index = Number.parseInt(id.replace("structure_", ""));
                return structureSet.structures[index];
            })
            .filter(Boolean);

        return {
            ...structureSet,
            structures: reorderedStructures
        };
    }
}
