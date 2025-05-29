import type { DataDrivenElement, VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { IdentifierObject } from "@/core/Identifier";
import type { Compiler } from "@/core/engine/Compiler";
import type { Parser } from "@/core/engine/Parser";

// Simplified loot table structure for UI
export interface LootTableProps extends VoxelElement {
    type?: string; // LootContextType
    items: LootItem[];
    groups: LootGroup[];
    randomSequence?: string;
    functions?: any[]; // Store complete function objects at table level
    pools?: PoolData[]; // Store pool-level data
    // Preserve unknown fields from mods
    unknownFields?: Record<string, any>;
}

/**
 * LootItem is a simplified loot table item.
 * id. Represents the item id.
 */
export interface LootItem {
    id: string;
    name: string;
    entryType?: EntryType; // Preserve the original entry type
    value?: any; // For loot_table entries with embedded objects
    weight?: number;
    quality?: number;
    count?: {
        min: number;
        max: number;
    };
    conditions?: any[]; // Store complete condition objects
    functions?: any[]; // Store complete function objects
    expand?: boolean; // For tag entries
    poolIndex: number;
    entryIndex: number;
    // Preserve unknown fields from mods
    unknownFields?: Record<string, any>;
}

/**
 * LootGroup is a simplified loot table group.
 * id. Represents the group id.
 */
export interface LootGroup {
    id: string;
    type: "alternatives" | "group" | "sequence";
    name?: string;
    items: string[];
    conditions?: any[]; // Store complete condition objects
    functions?: any[]; // Store complete function objects
    poolIndex: number;
    entryIndex: number;
    // Preserve unknown fields from mods
    unknownFields?: Record<string, any>;
}

// Pool-level data that needs to be preserved
export interface PoolData {
    poolIndex: number;
    rolls: any;
    bonus_rolls?: any;
    functions?: any[];
    conditions?: any[];
    // Preserve unknown fields from mods
    unknownFields?: Record<string, any>;
}

// Original Minecraft LootTable format (simplified)
export interface MinecraftLootTable extends DataDrivenElement {
    type?: string;
    pools?: MinecraftLootPool[];
    functions?: any[];
    random_sequence?: string;
    // Allow any additional fields for mod compatibility
    [key: string]: any;
}

export interface MinecraftLootPool {
    rolls: any;
    bonus_rolls?: any;
    entries: MinecraftLootEntry[];
    functions?: any[];
    conditions?: any[];
    // Allow any additional fields for mod compatibility
    [key: string]: any;
}

export interface MinecraftLootEntry {
    type: string;
    name?: string;
    value?: any;
    weight?: number;
    quality?: number;
    functions?: any[];
    conditions?: any[];
    children?: MinecraftLootEntry[];
    expand?: boolean;
    // Allow any additional fields for mod compatibility
    [key: string]: any;
}

// Type definitions for entry types
export type EntryType =
    | "minecraft:item"
    | "minecraft:tag"
    | "minecraft:loot_table"
    | "minecraft:dynamic"
    | "minecraft:alternatives"
    | "minecraft:group"
    | "minecraft:empty"
    | "minecraft:sequence"
    | string; // Allow custom mod entry types
export type GroupType = "alternatives" | "group" | "sequence";

// Context for processing entries
export interface ProcessingContext {
    items: LootItem[];
    groups: LootGroup[];
    itemCounter: number;
    groupCounter: number;
}

// Parser and Compiler type definitions
export type LootTableParser = Parser<LootTableProps, MinecraftLootTable>;
export type LootTableCompiler = Compiler<LootTableProps, MinecraftLootTable>;

export interface CompilerResult {
    element: DataDrivenRegistryElement<MinecraftLootTable>;
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
export const KNOWN_ENTRY_FIELDS = new Set(["type", "name", "value", "weight", "quality", "conditions", "functions", "children", "expand"]);

export const KNOWN_TABLE_FIELDS = new Set(["type", "pools", "functions", "random_sequence"]);

export const KNOWN_POOL_FIELDS = new Set(["rolls", "bonus_rolls", "entries", "functions", "conditions"]);
