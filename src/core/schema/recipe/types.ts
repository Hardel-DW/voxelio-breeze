import type { DataDrivenElement, VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { IdentifierObject } from "@/core/Identifier";
import type { Compiler } from "@/core/engine/Compiler";
import type { Parser } from "@/core/engine/Parser";

// Recipe structure with unified slot-based system
export interface RecipeProps extends VoxelElement {
    type: RecipeType;
    group?: string;
    category?: string;
    showNotification?: boolean;

    // Unified slot-based system
    slots: Record<string, string[]>; // "0" -> ["minecraft:diamond"], "1" -> ["#minecraft:logs"]
    gridSize?: { width: number; height: number }; // For shaped crafting only

    result: RecipeResult;
    typeSpecific?: RecipeTypeSpecific;
    unknownFields?: Record<string, any>;
}

export interface RecipeResult {
    item: string;
    count?: number;
    components?: any;
    unknownFields?: Record<string, any>;
}

// Type-specific data for different recipe types
export type RecipeTypeSpecific = SmeltingData | SmithingTransformData | SmithingTrimData | CraftingTransmuteData;

export interface SmeltingData {
    experience?: number;
    cookingTime?: number;
}

export interface SmithingTransformData {
    templateSlot: string; // Reference to slot ID
    baseSlot: string;
    additionSlot: string;
}

export interface SmithingTrimData {
    templateSlot: string;
    baseSlot: string;
    additionSlot: string;
    pattern?: string; // For 1.21.5+
}

export interface CraftingTransmuteData {
    inputSlot: string; // The ingredient that transfers data
    materialSlot: string; // Additional ingredient
}

// Recipe types
export type RecipeType =
    | "minecraft:crafting_shaped"
    | "minecraft:crafting_shapeless"
    | "minecraft:crafting_transmute"
    | "minecraft:smelting"
    | "minecraft:blasting"
    | "minecraft:smoking"
    | "minecraft:campfire_cooking"
    | "minecraft:stonecutting"
    | "minecraft:smithing_transform"
    | "minecraft:smithing_trim"
    | string; // Allow custom mod recipe types

export type CraftingBookCategory = "building" | "redstone" | "equipment" | "misc";
export type CookingBookCategory = "food" | "blocks" | "misc";

// Original Minecraft Recipe format
export interface MinecraftRecipe extends DataDrivenElement {
    type: string;
    group?: string;
    category?: string;
    show_notification?: boolean;

    // Shaped crafting
    pattern?: string | string[];
    key?: Record<string, any>;

    // Shapeless crafting
    ingredients?: any[];

    // Transmute crafting
    input?: any;
    material?: any;

    // Smelting
    ingredient?: any;
    experience?: number;
    cookingtime?: number;

    // Smithing
    base?: any;
    addition?: any;
    template?: any;
    pattern_trim?: string;

    // Result
    result?: any;
    count?: number; // Legacy stonecutting

    // Allow any additional fields for mod compatibility
    [key: string]: any;
}

// Parser and Compiler type definitions
export type RecipeParser = Parser<RecipeProps, MinecraftRecipe>;
export type RecipeCompiler = Compiler<RecipeProps, MinecraftRecipe>;

export interface CompilerResult {
    element: DataDrivenRegistryElement<MinecraftRecipe>;
    tags: IdentifierObject[];
}

// Known fields constants
export const KNOWN_RECIPE_FIELDS = new Set([
    "type",
    "group",
    "category",
    "show_notification",
    "pattern",
    "key",
    "ingredients",
    "input",
    "material",
    "ingredient",
    "experience",
    "cookingtime",
    "base",
    "addition",
    "template",
    "pattern_trim",
    "result",
    "count"
]);

// Helper functions for ingredient normalization
export function normalizeIngredient(ingredient: any): string[] {
    if (typeof ingredient === "string") {
        return [ingredient];
    }
    if (Array.isArray(ingredient)) {
        return ingredient.flatMap(normalizeIngredient);
    }
    if (ingredient?.item) {
        return [ingredient.item];
    }
    if (ingredient?.tag) {
        return [`#${ingredient.tag}`];
    }
    return [];
}

export function denormalizeIngredient(items: string[]): any {
    if (items.length === 0) return undefined;
    if (items.length === 1) {
        const item = items[0];
        if (item.startsWith("#")) {
            return { tag: item.slice(1) };
        }
        return { item };
    }
    return items.map((item) => (item.startsWith("#") ? { tag: item.slice(1) } : { item }));
}

// Grid utility functions for slot-based system
/**
 * Convert grid position to slot index
 * @param row Row position (0-indexed)
 * @param col Column position (0-indexed)
 * @param width Grid width
 * @returns Slot index as string
 */
export function positionToSlot(row: number, col: number, width: number): string {
    return (row * width + col).toString();
}

/**
 * Convert slot index to grid position
 * @param slot Slot index as string
 * @param width Grid width
 * @returns Grid position
 */
export function slotToPosition(slot: string, width: number): { row: number; col: number } {
    const index = Number.parseInt(slot, 10);
    return {
        row: Math.floor(index / width),
        col: index % width
    };
}

/**
 * Get all occupied slots from a slots object
 * @param slots Slots record
 * @returns Array of slot indices
 */
export function getOccupiedSlots(slots: Record<string, string[]>): string[] {
    return Object.entries(slots)
        .filter(([, items]) => items.length > 0)
        .map(([slot]) => slot);
}

/**
 * Optimize grid size to minimum required dimensions
 * @param slots Slots record
 * @param defaultWidth Default grid width
 * @returns Optimized grid size
 */
export function optimizeGridSize(slots: Record<string, string[]>, defaultWidth = 3): { width: number; height: number } {
    const occupiedSlots = getOccupiedSlots(slots);
    if (occupiedSlots.length === 0) {
        return { width: 1, height: 1 };
    }

    const positions = occupiedSlots.map((slot) => slotToPosition(slot, defaultWidth));
    const maxRow = Math.max(...positions.map((p) => p.row));
    const maxCol = Math.max(...positions.map((p) => p.col));

    return {
        width: maxCol + 1,
        height: maxRow + 1
    };
}
