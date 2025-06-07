import type { Analysers } from "@/core/engine/Analyser";
import type {
    CompilerResult,
    StructureCompiler,
    StructureProps,
    MinecraftStructure,
    MinecraftSpawnOverride,
    MinecraftPoolAlias,
    MobCategory
} from "./types";
import { JIGSAW_STRUCTURE_TYPES } from "./types";
import type { IdentifierObject } from "@/core/Identifier";
import { tagsToIdentifiers } from "@/core/Tag";

/**
 * Compile Voxel format back to Minecraft Structure
 */
export const VoxelToStructureDataDriven: StructureCompiler = (
    element: StructureProps,
    config: keyof Analysers,
    original?: MinecraftStructure
): CompilerResult => {
    const structure = original ? structuredClone(original) : ({} as MinecraftStructure);
    const tagRegistry = `tags/${config}`;
    let tags: IdentifierObject[] = [];
    if (element.tags.length > 0) {
        tags = tagsToIdentifiers(element.tags, tagRegistry);
    }

    // Set base properties
    structure.type = element.type;
    structure.biomes = element.biomes.length === 1 ? element.biomes[0] : element.biomes;
    structure.step = element.step;

    // Set optional base properties
    if (element.terrainAdaptation) {
        structure.terrain_adaptation = element.terrainAdaptation;
    }

    // Convert spawn overrides from array to record (always set, even if empty)
    structure.spawn_overrides = {} as Record<MobCategory, MinecraftSpawnOverride>;
    if (element.spawnOverrides && element.spawnOverrides.length > 0) {
        for (const override of element.spawnOverrides) {
            structure.spawn_overrides[override.mobCategory] = {
                bounding_box: override.boundingBox,
                spawns: override.spawns
            } as MinecraftSpawnOverride;
        }
    }

    // Handle Jigsaw structures (spread flattened properties)
    if (JIGSAW_STRUCTURE_TYPES.has(element.type)) {
        if (element.startPool) structure.start_pool = element.startPool;
        if (element.size !== undefined) structure.size = element.size;
        if (element.startHeight) structure.start_height = element.startHeight;
        if (element.startJigsawName) structure.start_jigsaw_name = element.startJigsawName;
        if (element.projectStartToHeightmap) structure.project_start_to_heightmap = element.projectStartToHeightmap;
        if (element.maxDistanceFromCenter !== undefined) structure.max_distance_from_center = element.maxDistanceFromCenter;
        if (element.useExpansionHack !== undefined) structure.use_expansion_hack = element.useExpansionHack;
        if (element.poolAliases?.length) structure.pool_aliases = element.poolAliases.map(denormalizePoolAlias);
        if (element.dimensionPadding) structure.dimension_padding = denormalizeDimensionPadding(element.dimensionPadding);
        if (element.liquidSettings) structure.liquid_settings = element.liquidSettings;
    } else {
        // For legacy structures, restore type-specific config
        if (element.typeSpecific) {
            Object.assign(structure, element.typeSpecific);
        }
    }

    // Restore unknown fields
    if (element.unknownFields) {
        Object.assign(structure, element.unknownFields);
    }

    return {
        element: {
            data: structure,
            identifier: element.identifier
        },
        tags
    };
};

/**
 * Denormalize pool alias back to Minecraft format
 */
function denormalizePoolAlias(alias: any): MinecraftPoolAlias {
    const result: MinecraftPoolAlias = {
        type: alias.type
    };

    if (alias.alias) result.alias = alias.alias;
    if (alias.target) result.target = alias.target;
    if (alias.targets) result.targets = alias.targets;
    if (alias.groups) result.groups = alias.groups;

    return result;
}

/**
 * Denormalize dimension padding back to Minecraft format
 */
function denormalizeDimensionPadding(padding: any): number | any {
    // If both values are the same, return a simple number
    if (padding.bottom !== undefined && padding.top !== undefined && padding.bottom === padding.top) {
        return padding.bottom;
    }

    // Otherwise return object format
    const result: any = {};
    if (padding.bottom !== undefined) result.bottom = padding.bottom;
    if (padding.top !== undefined) result.top = padding.top;

    return result;
}
