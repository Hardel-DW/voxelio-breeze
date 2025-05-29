import type { VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import { Identifier, type IdentifierObject } from "@/core/Identifier";
import { tagsToIdentifiers } from "@/core/Tag";
import type { Analysers } from "@/core/engine/Analyser";
import type { Compiler } from "@/core/engine/Compiler";
import type { Parser, ParserParams } from "@/core/engine/Parser";
import type { SlotRegistryType } from "@/core/engine/managers/SlotManager";
import type { SingleOrMultiple } from "@/index";
import type { Enchantment } from "@/schema/enchantment/Enchantment";
import type { TextComponentType } from "@/schema/text/TextComponentType";

const tags_related_to_functionality = [
    { namespace: "minecraft", registry: "tags/enchantment", resource: "curse" },
    { namespace: "minecraft", registry: "tags/enchantment", resource: "double_trade_price" },
    { namespace: "minecraft", registry: "tags/enchantment", resource: "prevents_bee_spawns_when_mining" },
    { namespace: "minecraft", registry: "tags/enchantment", resource: "prevents_decorated_pot_shattering" },
    { namespace: "minecraft", registry: "tags/enchantment", resource: "prevents_ice_melting" },
    { namespace: "minecraft", registry: "tags/enchantment", resource: "prevents_infested_spawns" },
    { namespace: "minecraft", registry: "tags/enchantment", resource: "smelts_loot" },
    { namespace: "minecraft", registry: "tags/enchantment", resource: "tooltip_order" }
];

// Cache des tags de fonctionnalité pour éviter les créations répétées d'Identifier
const FUNCTIONALITY_TAGS_CACHE = new Set(tags_related_to_functionality.map((tag) => new Identifier(tag).toString()));

export interface EnchantmentProps extends VoxelElement {
    description: TextComponentType;
    exclusiveSet: SingleOrMultiple<string> | undefined;
    supportedItems: SingleOrMultiple<string>;
    primaryItems: SingleOrMultiple<string> | undefined;
    maxLevel: number;
    weight: number;
    anvilCost: number;
    minCostBase: number;
    minCostPerLevelAboveFirst: number;
    maxCostBase: number;
    maxCostPerLevelAboveFirst: number;
    effects: Record<string, unknown> | undefined;
    slots: SlotRegistryType[];
    tags: string[];
    mode: "normal" | "soft_delete" | "only_creative";
    disabledEffects: string[];
}

/**
 * Take only one Enchantments with their tags, to transform it to Voxel format
 * @param enchantment
 * @param tags
 */
export const EnchantmentDataDrivenToVoxelFormat: Parser<EnchantmentProps, Enchantment> = ({
    element,
    tags = [],
    configurator
}: ParserParams<Enchantment>): EnchantmentProps => {
    const clone = structuredClone(element);
    const data = clone.data;

    const description = data.description;
    const maxLevel = data.max_level;
    const weight = data.weight;
    const anvilCost = data.anvil_cost;
    const minCostBase = data.min_cost.base;
    const minCostPerLevelAboveFirst = data.min_cost.per_level_above_first;
    const maxCostBase = data.max_cost.base;
    const maxCostPerLevelAboveFirst = data.max_cost.per_level_above_first;
    const exclusiveSet = data.exclusive_set;
    const supportedItems = data.supported_items;
    const primaryItems = data.primary_items;
    const effects = data.effects;
    const slots = data.slots;

    const tagsWithoutExclusiveSet = tags.filter((tag) => !(typeof data.exclusive_set === "string" && tag === data.exclusive_set));
    const hasEffects = data.effects && Object.entries(data.effects).length > 0;

    let mode: "normal" | "soft_delete" | "only_creative" = "normal";

    // Optimisation: utiliser le cache au lieu de créer des Identifiers
    if (tagsWithoutExclusiveSet.every((tag) => FUNCTIONALITY_TAGS_CACHE.has(tag))) {
        mode = "only_creative";
    }

    if (!hasEffects && tagsWithoutExclusiveSet.length === 0) {
        mode = "soft_delete";
    }

    return {
        identifier: element.identifier,
        description,
        exclusiveSet,
        supportedItems,
        primaryItems,
        maxLevel,
        weight,
        anvilCost,
        minCostBase,
        minCostPerLevelAboveFirst,
        maxCostBase,
        maxCostPerLevelAboveFirst,
        effects,
        tags: tagsWithoutExclusiveSet,
        slots,
        mode,
        disabledEffects: [],
        override: configurator
    };
};

/**
 * Transform only one enchantment from Voxel Format into a Minecraft JSON Data Driven Enchantment.
 * @param element
 * @param original
 */
export const VoxelToEnchantmentDataDriven: Compiler<EnchantmentProps, Enchantment> = (
    element: EnchantmentProps,
    config: keyof Analysers,
    original?: Enchantment
): {
    element: DataDrivenRegistryElement<Enchantment>;
    tags: IdentifierObject[];
} => {
    // Optimisation: éviter le double clone
    const enchantment = original ? structuredClone(original) : ({} as Enchantment);
    const tagRegistry = `tags/${config}`;

    // Optimisation: traitement des tags plus efficace
    let tags: IdentifierObject[] = [];
    if (element.tags.length > 0) {
        tags = tagsToIdentifiers(element.tags, tagRegistry);
    }

    // Assignations directes sans cloner element
    enchantment.max_level = element.maxLevel;
    enchantment.weight = element.weight;
    enchantment.anvil_cost = element.anvilCost;
    enchantment.supported_items = element.supportedItems;
    enchantment.slots = element.slots;
    enchantment.effects = element.effects;

    // Optimisation: création d'objets seulement si nécessaire
    enchantment.min_cost = {
        base: element.minCostBase,
        per_level_above_first: element.minCostPerLevelAboveFirst
    };
    enchantment.max_cost = {
        base: element.maxCostBase,
        per_level_above_first: element.maxCostPerLevelAboveFirst
    };

    if (element.primaryItems) {
        enchantment.primary_items = element.primaryItems;
    }

    if (!element.supportedItems && element.primaryItems) {
        enchantment.supported_items = element.primaryItems;
    }

    // Optimisation: filtre plus efficace pour only_creative
    if (element.mode === "only_creative") {
        tags = tags.filter((tag) => FUNCTIONALITY_TAGS_CACHE.has(tag.toString()));
    }

    if (element.exclusiveSet) {
        enchantment.exclusive_set = element.exclusiveSet;

        if (typeof element.exclusiveSet === "string") {
            tags.push(Identifier.of(element.exclusiveSet, tagRegistry));
        }
    }

    // Optimisation: traitement des effets désactivés plus efficace
    if (element.disabledEffects.length > 0 && enchantment.effects) {
        for (const effect of element.disabledEffects) {
            delete enchantment.effects[effect as keyof typeof enchantment.effects];
        }
    }

    if (element.mode === "soft_delete") {
        enchantment.exclusive_set = undefined;
        enchantment.effects = undefined;
        tags = [];
    }

    return {
        element: {
            data: enchantment,
            identifier: element.identifier
        },
        tags
    };
};
