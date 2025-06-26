import type { DataDrivenElement, VoxelElement } from "@/core/Element";
import { normalizeResourceLocation } from "@/core/Element";
export interface RecipeProps extends VoxelElement {
    type: RecipeType;
    group?: string;
    category?: string;
    showNotification?: boolean;
    slots: Record<string, string[] | string>; // string[] -> ["minecraft:diamond"], string -> "#minecraft:logs"
    gridSize?: { width: number; height: number }; // For shaped crafting only
    disabled?: boolean;
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

export type RecipeTypeSpecific = SmeltingData | SmithingTransformData | SmithingTrimData | CraftingTransmuteData;

export interface SmeltingData {
    experience?: number;
    cookingTime?: number;
}

export interface SmithingTransformData {
    templateSlot: string;
    baseSlot: string;
    additionSlot: string;
}

export interface SmithingTrimData {
    templateSlot: string;
    baseSlot: string;
    additionSlot: string;
    pattern?: string;
}

export interface CraftingTransmuteData {
    inputSlot: string;
    materialSlot: string;
}

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
    | (string & {}); // Allow custom mod recipe types

export type CraftingBookCategory = "building" | "redstone" | "equipment" | "misc";
export type CookingBookCategory = "food" | "blocks" | "misc";

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

    [key: string]: any;
}

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

export function normalizeIngredient(ingredient: any): string[] | string {
    if (typeof ingredient === "string") {
        const normalized = normalizeResourceLocation(ingredient);
        if (normalized.startsWith("#")) {
            return normalized; // Return single string for tags
        }
        return [normalized]; // Return array for single items
    }
    if (Array.isArray(ingredient)) {
        const items = ingredient.flatMap(item => {
            if (typeof item === "string") {
                return normalizeResourceLocation(item);
            }
            if (item?.item) {
                return normalizeResourceLocation(item.item);
            }
            if (item?.tag) {
                return `#${normalizeResourceLocation(item.tag)}`;
            }
            return [];
        });

        // Check if array contains tags - this is an error
        const hasTag = items.some(item => item.startsWith("#"));
        const hasItem = items.some(item => !item.startsWith("#"));

        if (hasTag && hasItem) {
            throw new Error("Cannot mix tags and items in the same ingredient array");
        }

        if (hasTag && items.length === 1) {
            return items[0]; // Single tag as string
        }

        if (hasTag) {
            throw new Error("Multiple tags in the same ingredient slot are not supported");
        }

        return items; // Items as array
    }
    if (ingredient?.item) {
        return [normalizeResourceLocation(ingredient.item)];
    }
    if (ingredient?.tag) {
        return `#${normalizeResourceLocation(ingredient.tag)}`;
    }
    return [];
}

export function denormalizeIngredient(items: string[] | string): any {
    if (typeof items === "string") {
        return items.startsWith("#") ? { tag: items.slice(1) } : { item: items };
    }

    if (Array.isArray(items)) {
        if (items.length === 0) return undefined;
        if (items.length === 1) {
            const item = items[0];
            return item.startsWith("#") ? { tag: item.slice(1) } : { item };
        }
        return items.map((item) => (item.startsWith("#") ? { tag: item.slice(1) } : { item }));
    }

    return undefined;
}

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
export function getOccupiedSlots(slots: Record<string, string[] | string>): string[] {
    return Object.entries(slots)
        .filter(([, items]) => (typeof items === "string" ? items.length > 0 : Array.isArray(items) && items.length > 0))
        .map(([slot]) => slot);
}

/**
 * Optimize grid size to minimum required dimensions
 * @param slots Slots record
 * @param defaultWidth Default grid width
 * @returns Optimized grid size
 */
export function optimizeGridSize(slots: Record<string, string[] | string>, defaultWidth = 3): { width: number; height: number } {
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
