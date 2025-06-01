import type { DataDrivenElement, VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { IdentifierObject } from "@/core/Identifier";
import type { Compiler } from "@/core/engine/Compiler";
import type { Parser } from "@/core/engine/Parser";

// Simplified recipe structure for UI
export interface RecipeProps extends VoxelElement {
    type: RecipeType;
    group?: string;
    category?: string;
    showNotification?: boolean;
    ingredients: RecipeIngredient[];
    result: RecipeResult;
    typeSpecific?: RecipeTypeSpecific;
    unknownFields?: Record<string, any>;
}

export interface RecipeIngredient {
    id: string;
    slot?: string;
    position?: { row: number; col: number };
    items: string[];
    count?: number;
    unknownFields?: Record<string, any>;
}

export interface RecipeResult {
    item: string;
    count?: number;
    components?: any;
    unknownFields?: Record<string, any>;
}

// Type-specific data for different recipe types
export type RecipeTypeSpecific = ShapedCraftingData | SmeltingData | SmithingTransformData | SmithingTrimData | CraftingTransmuteData;

export interface ShapedCraftingData {
    pattern: string[]; // e.g., ["AAB", "A B", "CCC"]
    width: number;
    height: number;
}

export interface SmeltingData {
    experience?: number;
    cookingTime?: number;
}

export interface SmithingTransformData {
    baseSlot: string; // Reference to ingredient ID
    additionSlot: string;
    templateSlot: string;
}

export interface SmithingTrimData {
    baseSlot: string;
    additionSlot: string;
    templateSlot: string;
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

// Alternative simpler structure for shaped crafting specifically
export interface ShapedCraftingProps extends VoxelElement {
    type: "minecraft:crafting_shaped";
    group?: string;
    category?: string;
    showNotification?: boolean;

    // Simplified for shaped crafting
    pattern: string[];
    ingredients: Record<string, string[]>; // Direct key -> items mapping
    result: RecipeResult;

    unknownFields?: Record<string, any>;
}

// Union type for different recipe approaches
export type RecipePropsVariant = RecipeProps | ShapedCraftingProps;
