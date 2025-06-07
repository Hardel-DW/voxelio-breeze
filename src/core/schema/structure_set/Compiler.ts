import type { Analysers } from "@/core/engine/Analyser";
import type {
    CompilerResult,
    StructureSetCompiler,
    StructureSetProps,
    MinecraftStructureSet,
    MinecraftStructureSetElement,
    MinecraftStructurePlacement,
    MinecraftExclusionZone
} from "./types";
import { CONCENTRIC_RINGS_TYPES, RANDOM_SPREAD_TYPES } from "./types";
import type { IdentifierObject } from "@/core/Identifier";
import { tagsToIdentifiers } from "@/core/Tag";

/**
 * Compile Voxel format back to Minecraft Structure Set
 */
export const VoxelToStructureSetDataDriven: StructureSetCompiler = (
    element: StructureSetProps,
    config: keyof Analysers,
    original?: MinecraftStructureSet
): CompilerResult => {
    const structureSet = original ? structuredClone(original) : ({} as MinecraftStructureSet);
    const tagRegistry = `tags/${config}`;
    let tags: IdentifierObject[] = [];

    if (element.tags.length > 0) {
        tags = tagsToIdentifiers(element.tags, tagRegistry);
    }

    // Convert structures array (simple mapping)
    const structures: MinecraftStructureSetElement[] = element.structures.map((struct) => ({
        structure: struct.structure,
        weight: struct.weight
    }));

    // Build placement object (reconstruct hierarchy)
    const placement: MinecraftStructurePlacement = {
        type: element.placementType
    };

    // Add common placement properties if present
    if (element.salt !== undefined) {
        placement.salt = element.salt;
    }
    if (element.frequencyReductionMethod) {
        placement.frequency_reduction_method = element.frequencyReductionMethod;
    }
    if (element.frequency !== undefined) {
        placement.frequency = element.frequency;
    }
    if (element.locateOffset) {
        placement.locate_offset = element.locateOffset;
    }
    if (element.exclusionZone) {
        const exclusionZone: MinecraftExclusionZone = {
            other_set: element.exclusionZone.otherSet,
            chunk_count: element.exclusionZone.chunkCount
        };
        placement.exclusion_zone = exclusionZone;
    }

    // Add type-specific properties (reconstruct from flattened format)
    if (CONCENTRIC_RINGS_TYPES.has(element.placementType)) {
        if (element.distance !== undefined) placement.distance = element.distance;
        if (element.spread !== undefined) placement.spread = element.spread;
        if (element.count !== undefined) placement.count = element.count;
        if (element.preferredBiomes?.length) {
            // Restore to original format if available, otherwise use array
            if (original?.placement?.preferred_biomes) {
                // Preserve original format (string or array)
                placement.preferred_biomes = original.placement.preferred_biomes;
            } else {
                // Default to array format for new elements
                placement.preferred_biomes = element.preferredBiomes;
            }
        }
    } else if (RANDOM_SPREAD_TYPES.has(element.placementType)) {
        if (element.spacing !== undefined) placement.spacing = element.spacing;
        if (element.separation !== undefined) placement.separation = element.separation;
        if (element.spreadType) placement.spread_type = element.spreadType;
    }

    // Restore unknown fields
    if (element.unknownFields) {
        // Extract placement-specific unknown fields
        if (element.unknownFields.placement) {
            Object.assign(placement, element.unknownFields.placement);
        }

        // Extract root-level unknown fields
        const rootFields = { ...element.unknownFields };
        rootFields.placement = undefined; // Remove placement to avoid duplication

        Object.assign(structureSet, rootFields);
    }

    // Set final structure
    structureSet.structures = structures;
    structureSet.placement = placement;

    return {
        element: {
            data: structureSet,
            identifier: element.identifier
        },
        tags
    };
};
