import type { DataDrivenElement, VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { IdentifierObject } from "@/core/Identifier";
import type { Compiler } from "@/core/engine/Compiler";
import type { Parser } from "@/core/engine/Parser";

// Simplified structure set format for UI
export interface StructureSetProps extends VoxelElement {
    // Core structures list (simplified)
    structures: StructureSetStructure[];

    // Placement configuration (flattened)
    placementType: PlacementType;

    // Common placement properties
    salt?: number;
    frequencyReductionMethod?: FrequencyReductionMethod;
    frequency?: number;
    locateOffset?: [number, number, number];

    // Exclusion zone (simplified)
    exclusionZone?: {
        otherSet: string;
        chunkCount: number;
    };

    // Concentric rings specific (flattened)
    distance?: number;
    spread?: number;
    count?: number;
    preferredBiomes?: string[];

    // Random spread specific (flattened)
    spacing?: number;
    separation?: number;
    spreadType?: SpreadType;

    // Preserve unknown fields from mods
    unknownFields?: Record<string, any>;
    tags: string[];
}

export interface StructureSetStructure {
    structure: string; // Structure ID
    weight: number;
}

// Original Minecraft Structure Set format
export interface MinecraftStructureSet extends DataDrivenElement {
    structures: MinecraftStructureSetElement[];
    placement: MinecraftStructurePlacement;

    // Allow any additional fields for mod compatibility
    [key: string]: any;
}

export interface MinecraftStructureSetElement {
    structure: string;
    weight: number;
}

export interface MinecraftStructurePlacement {
    type: string;
    salt?: number;
    frequency_reduction_method?: FrequencyReductionMethod;
    frequency?: number;
    exclusion_zone?: MinecraftExclusionZone;
    locate_offset?: [number, number, number];

    // Concentric rings properties
    distance?: number;
    spread?: number;
    count?: number;
    preferred_biomes?: string[] | string;

    // Random spread properties
    spacing?: number;
    separation?: number;
    spread_type?: SpreadType;

    // Allow any additional fields for mod compatibility
    [key: string]: any;
}

export interface MinecraftExclusionZone {
    other_set: string;
    chunk_count: number;
}

// Enums
export type PlacementType = "minecraft:concentric_rings" | "minecraft:random_spread";

export type FrequencyReductionMethod = "default" | "legacy_type_1" | "legacy_type_2" | "legacy_type_3";

export type SpreadType = "linear" | "triangular";

// Parser and Compiler type definitions
export type StructureSetParser = Parser<StructureSetProps, MinecraftStructureSet>;
export type StructureSetCompiler = Compiler<StructureSetProps, MinecraftStructureSet>;

export interface CompilerResult {
    element: DataDrivenRegistryElement<MinecraftStructureSet>;
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

/**
 * Known Structure Set fields according to Minecraft specification
 */
export const KNOWN_STRUCTURE_SET_FIELDS = new Set(["structures", "placement"]);

/**
 * Known Structure Placement fields according to Minecraft specification
 */
export const KNOWN_PLACEMENT_FIELDS = new Set([
    "type",
    "salt",
    "frequency_reduction_method",
    "frequency",
    "exclusion_zone",
    "locate_offset",
    // Concentric rings
    "distance",
    "spread",
    "count",
    "preferred_biomes",
    // Random spread
    "spacing",
    "separation",
    "spread_type"
]);

/**
 * Placement types that use concentric rings configuration
 */
export const CONCENTRIC_RINGS_TYPES = new Set(["minecraft:concentric_rings"]);

/**
 * Placement types that use random spread configuration
 */
export const RANDOM_SPREAD_TYPES = new Set(["minecraft:random_spread"]);
