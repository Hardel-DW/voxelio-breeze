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
}

/**
 * LootItem is a simplified loot table item.
 * id. Represents the item id.
 */
export interface LootItem {
    id: string;
    name: string;
    weight?: number;
    quality?: number;
    count?: {
        min: number;
        max: number;
    };
    conditions?: any[]; // Store complete condition objects
    functions?: any[]; // Store complete function objects
    poolIndex: number;
    entryIndex: number;
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
    poolIndex: number;
    entryIndex: number;
}

// Pool-level data that needs to be preserved
export interface PoolData {
    poolIndex: number;
    rolls: any;
    bonus_rolls?: any;
    functions?: any[];
    conditions?: any[];
}

// Original Minecraft LootTable format (simplified)
export interface MinecraftLootTable extends DataDrivenElement {
    type?: string;
    pools?: MinecraftLootPool[];
    functions?: any[];
    random_sequence?: string;
}

export interface MinecraftLootPool {
    rolls: any;
    bonus_rolls?: any;
    entries: MinecraftLootEntry[];
    functions?: any[];
    conditions?: any[];
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
}

// Type definitions for entry types
export type EntryType =
    | "minecraft:item"
    | "minecraft:tag"
    | "minecraft:loot_table"
    | "minecraft:dynamic"
    | "minecraft:alternatives"
    | "minecraft:group"
    | "minecraft:sequence";
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
