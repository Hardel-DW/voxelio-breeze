import type { FrequencyReductionMethod, PlacementType, SpreadType } from "@/core/schema/structure_set/types";
import { type AllExpectedHandlerKeys, type ValidateHandlerRegistry, createHandlers } from "../../types";

// Actions spécifiques au domaine Structure Set
export interface StructureSetActions {
    add_structure: {
        structure: string;
        weight: number;
        position?: number;
    };
    remove_structure: {
        structureId: string;
    };
    modify_structure: {
        structureId: string;
        property: "structure" | "weight";
        value: string | number;
    };
    set_placement_type: {
        placementType: PlacementType;
    };
    configure_placement: {
        salt?: number;
        frequencyReductionMethod?: FrequencyReductionMethod;
        frequency?: number;
        locateOffset?: [number, number, number];
    };
    set_exclusion_zone: {
        otherSet: string;
        chunkCount: number;
    };
    remove_exclusion_zone: Record<string, never>; // No parameters
    configure_concentric_rings: {
        distance?: number;
        spread?: number;
        count?: number;
        preferredBiomes?: string[];
    };
    configure_random_spread: {
        spacing?: number;
        separation?: number;
        spreadType?: SpreadType;
    };
    reorder_structures: {
        structureIds: string[];
    };
}

// Export des actions typées avec préfixe du domaine
export type StructureSetAction = {
    [K in keyof StructureSetActions]: StructureSetActions[K] & { type: `structure_set.${K}` };
}[keyof StructureSetActions];

// Le domaine est extrait automatiquement du préfixe de l'action
// Ex: "structure_set.add_structure" → domaine = "structure_set"

// Validation avec système générique
export type StructureSetHandlerKeys = AllExpectedHandlerKeys<"structure_set", StructureSetActions>;
export const createStructureSetHandlers = <T extends Record<StructureSetHandlerKeys, any>>(
    handlers: ValidateHandlerRegistry<T, StructureSetHandlerKeys>
): T => createHandlers(handlers);
