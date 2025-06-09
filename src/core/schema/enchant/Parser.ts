import type { ParserParams } from "@/core/engine/Parser";
import type { Parser } from "@/core/engine/Parser";
import { extractUnknownFields } from "@/core/schema/utils";
import type { Enchantment } from "@/schema/Enchantment";
import { type EnchantmentProps, FUNCTIONALITY_TAGS_CACHE, KNOWN_ENCHANTMENT_FIELDS } from "./types";

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

    // Extract unknown fields from mods
    const unknownFields = extractUnknownFields(data, KNOWN_ENCHANTMENT_FIELDS);

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
        unknownFields,
        override: configurator
    };
};
