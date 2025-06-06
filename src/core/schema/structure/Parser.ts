import type { ParserParams } from "@/core/engine/Parser";
import type { StructureParser, StructureProps, MinecraftStructure, SpawnOverride, PoolAlias, DimensionPadding, MobCategory } from "./types";
import { KNOWN_STRUCTURE_FIELDS, JIGSAW_STRUCTURE_TYPES, extractUnknownFields } from "./types";

/**
 * Parse Minecraft Structure to simplified Voxel format
 */
export const StructureDataDrivenToVoxelFormat: StructureParser = ({
    element,
    tags = [],
    configurator
}: ParserParams<MinecraftStructure>): StructureProps => {
    const data = element.data;

    // Normalize biomes to array
    const biomes = Array.isArray(data.biomes) ? data.biomes : [data.biomes];

    // Convert spawn overrides from record to array
    const spawnOverrides: SpawnOverride[] = Object.entries(data.spawn_overrides || {}).map(([category, override]) => ({
        mobCategory: category as MobCategory,
        boundingBox: override.bounding_box,
        spawns: override.spawns || []
    }));

    // Build base structure
    const structure: StructureProps = {
        identifier: element.identifier,
        type: data.type,
        biomes,
        step: data.step,
        spawnOverrides,
        override: configurator,
        tags
    };

    // Add optional base properties
    if (data.terrain_adaptation) {
        structure.terrainAdaptation = data.terrain_adaptation;
    }

    // Handle Jigsaw structures (flatten properties)
    if (JIGSAW_STRUCTURE_TYPES.has(data.type)) {
        if (data.start_pool) structure.startPool = data.start_pool;
        if (data.size !== undefined) structure.size = data.size;
        if (data.start_height) structure.startHeight = data.start_height;
        if (data.start_jigsaw_name) structure.startJigsawName = data.start_jigsaw_name;
        if (data.project_start_to_heightmap) structure.projectStartToHeightmap = data.project_start_to_heightmap;
        if (data.max_distance_from_center !== undefined) structure.maxDistanceFromCenter = data.max_distance_from_center;
        if (data.use_expansion_hack !== undefined) structure.useExpansionHack = data.use_expansion_hack;
        if (data.pool_aliases?.length) structure.poolAliases = data.pool_aliases.map(normalizePoolAlias);
        if (data.dimension_padding) structure.dimensionPadding = normalizeDimensionPadding(data.dimension_padding);
        if (data.liquid_settings) structure.liquidSettings = data.liquid_settings;
    } else {
        // For legacy structures, store type-specific config
        const typeSpecific: Record<string, any> = {};

        // Copy legacy properties
        const legacyProps = [
            "probability",
            "mineshaft_type",
            "height",
            "biome_temp",
            "large_probability",
            "cluster_probability",
            "setups",
            "is_beached"
        ];

        for (const prop of legacyProps) {
            if (data[prop] !== undefined) {
                typeSpecific[prop] = data[prop];
            }
        }

        if (Object.keys(typeSpecific).length > 0) {
            structure.typeSpecific = typeSpecific;
        }
    }

    // Preserve unknown fields
    const unknownFields = extractUnknownFields(data, KNOWN_STRUCTURE_FIELDS);
    if (unknownFields) {
        structure.unknownFields = unknownFields;
    }

    return structure;
};

/**
 * Normalize pool alias to unified format
 */
function normalizePoolAlias(alias: any): PoolAlias {
    return {
        type: alias.type,
        ...(alias.alias && { alias: alias.alias }),
        ...(alias.target && { target: alias.target }),
        ...(alias.targets && { targets: alias.targets }),
        ...(alias.groups && { groups: alias.groups })
    };
}

/**
 * Normalize dimension padding to object format
 */
function normalizeDimensionPadding(padding: number | any): DimensionPadding {
    if (typeof padding === "number") {
        return { bottom: padding, top: padding };
    }
    return {
        ...(padding.bottom !== undefined && { bottom: padding.bottom }),
        ...(padding.top !== undefined && { top: padding.top })
    };
}
