import type { DataDrivenElement, VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { IdentifierObject } from "@/core/Identifier";
import type { Compiler } from "@/core/engine/Compiler";
import type { Parser } from "@/core/engine/Parser";

// Simplified structure format for UI
export interface StructureProps extends VoxelElement {
    type: string; // Structure type ID
    biomes: string[]; // List of biome IDs or tags
    step: DecorationStep;
    terrainAdaptation?: TerrainAdaptation;
    spawnOverrides: SpawnOverride[];

    // Jigsaw-specific properties (flattened)
    startPool?: string;
    size?: number;
    startHeight?: any; // HeightProvider
    startJigsawName?: string;
    projectStartToHeightmap?: HeightmapType;
    maxDistanceFromCenter?: number;
    useExpansionHack?: boolean;
    poolAliases?: PoolAlias[];
    dimensionPadding?: DimensionPadding;
    liquidSettings?: LiquidSettings;

    // Legacy/other config stored as-is
    typeSpecific?: Record<string, any>;

    // Preserve unknown fields from mods
    unknownFields?: Record<string, any>;
    tags: string[];
}

export interface SpawnOverride {
    mobCategory: MobCategory;
    boundingBox: BoundingBox;
    spawns: SpawnerData[];
}

export interface SpawnerData {
    type: string; // Entity type ID
    weight: number;
    minCount: number;
    maxCount: number;
}

export interface PoolAlias {
    type: string;
    alias?: string;
    target?: string;
    targets?: PoolAliasTarget[];
    groups?: PoolAliasGroup[];
}

export interface PoolAliasTarget {
    weight: number;
    data: string;
}

export interface PoolAliasGroup {
    weight: number;
    data: PoolAlias[];
}

export interface DimensionPadding {
    bottom?: number;
    top?: number;
}

// Original Minecraft Structure format
export interface MinecraftStructure extends DataDrivenElement {
    type: string;
    biomes: string[] | string;
    step: DecorationStep;
    terrain_adaptation?: TerrainAdaptation;
    spawn_overrides: Record<MobCategory, MinecraftSpawnOverride>;

    // Jigsaw config (spread from structure_config)
    start_pool?: string;
    size?: number;
    start_height?: any;
    start_jigsaw_name?: string;
    project_start_to_heightmap?: HeightmapType;
    max_distance_from_center?: number;
    use_expansion_hack?: boolean;
    pool_aliases?: MinecraftPoolAlias[];
    dimension_padding?: number | MinecraftDimensionPadding;
    liquid_settings?: LiquidSettings;

    // Legacy config properties
    probability?: number;
    mineshaft_type?: MineshaftType;
    height?: any;
    biome_temp?: BiomeTemperature;
    large_probability?: number;
    cluster_probability?: number;
    setups?: RuinedPortalSetup[];
    is_beached?: boolean;

    // Allow any additional fields for mod compatibility
    [key: string]: any;
}

export interface MinecraftSpawnOverride {
    bounding_box: BoundingBox;
    spawns: SpawnerData[];
}

export interface MinecraftPoolAlias {
    type: string;
    alias?: string;
    target?: string;
    targets?: PoolAliasTarget[];
    groups?: PoolAliasGroup[];
}

export interface MinecraftDimensionPadding {
    bottom?: number;
    top?: number;
}

export interface RuinedPortalSetup {
    placement: RuinedPortalPlacement;
    air_pocket_probability: number;
    mossiness: number;
    overgrown: boolean;
    vines: boolean;
    can_be_cold: boolean;
    replace_with_blackstone: boolean;
    weight: number;
}

// Enums
export type DecorationStep =
    | "raw_generation"
    | "lakes"
    | "local_modifications"
    | "underground_structures"
    | "surface_structures"
    | "strongholds"
    | "underground_ores"
    | "underground_decoration"
    | "fluid_springs"
    | "vegetal_decoration"
    | "top_layer_modification";

export type TerrainAdaptation = "none" | "beard_thin" | "beard_box" | "bury" | "encapsulate";

export type BoundingBox = "piece" | "full";

export type MobCategory =
    | "monster"
    | "creature"
    | "ambient"
    | "axolotls"
    | "underground_water_creature"
    | "water_creature"
    | "water_ambient"
    | "misc";

export type HeightmapType =
    | "MOTION_BLOCKING"
    | "MOTION_BLOCKING_NO_LEAVES"
    | "OCEAN_FLOOR"
    | "OCEAN_FLOOR_WG"
    | "WORLD_SURFACE"
    | "WORLD_SURFACE_WG";

export type LiquidSettings = "apply_waterlogging" | "ignore_waterlogging";

export type MineshaftType = "normal" | "mesa";

export type BiomeTemperature = "cold" | "warm";

export type RuinedPortalPlacement = "on_land_surface" | "partly_buried" | "on_ocean_floor" | "in_mountain" | "underground" | "in_nether";

// Parser and Compiler type definitions
export type StructureParser = Parser<StructureProps, MinecraftStructure>;
export type StructureCompiler = Compiler<StructureProps, MinecraftStructure>;

export interface CompilerResult {
    element: DataDrivenRegistryElement<MinecraftStructure>;
    tags: IdentifierObject[];
}

/**
 * Utility function to extract unknown fields from an object, excluding known fields
 */
export function extractUnknownFields(obj: Record<string, any>, knownFields: Set<string>): Record<string, any> | undefined {
    const unknownFields: Record<string, any> = {};
    let hasUnknownFields = false;

    for (const [key, value] of Object.entries(obj)) {
        if (!knownFields.has(key)) {
            unknownFields[key] = value;
            hasUnknownFields = true;
        }
    }

    return hasUnknownFields ? unknownFields : undefined;
}

// Known fields constants for reuse
export const KNOWN_STRUCTURE_FIELDS = new Set([
    "type",
    "biomes",
    "step",
    "terrain_adaptation",
    "spawn_overrides",
    "start_pool",
    "size",
    "start_height",
    "start_jigsaw_name",
    "project_start_to_heightmap",
    "max_distance_from_center",
    "use_expansion_hack",
    "pool_aliases",
    "dimension_padding",
    "liquid_settings",
    // Legacy fields
    "probability",
    "mineshaft_type",
    "height",
    "biome_temp",
    "large_probability",
    "cluster_probability",
    "setups",
    "is_beached"
]);

// Structure types that use Jigsaw config
export const JIGSAW_STRUCTURE_TYPES = new Set([
    "minecraft:bastion_remnant",
    "minecraft:jigsaw",
    "minecraft:pillager_outpost",
    "minecraft:village"
]);

// Legacy structure types (store config as-is)
export const LEGACY_STRUCTURE_TYPES = new Set([
    "minecraft:desert_pyramid",
    "minecraft:end_city",
    "minecraft:fortress",
    "minecraft:igloo",
    "minecraft:jungle_temple",
    "minecraft:ocean_monument",
    "minecraft:stronghold",
    "minecraft:swamp_hut",
    "minecraft:woodland_mansion",
    "minecraft:buried_treasure",
    "minecraft:mineshaft",
    "minecraft:nether_fossil",
    "minecraft:ocean_ruin",
    "minecraft:ruined_portal",
    "minecraft:shipwreck"
]);
