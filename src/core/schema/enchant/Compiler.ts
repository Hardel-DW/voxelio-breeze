import { Identifier, type IdentifierObject } from "@/core/Identifier";
import type { Compiler } from "@/core/engine/Compiler";
import type { Analysers } from "@/core/engine/Analyser";
import type { DataDrivenRegistryElement } from "@/core/Element";
import { FUNCTIONALITY_TAGS_CACHE, type EnchantmentProps } from "./types";
import type { Enchantment } from "@/schema/enchantment/Enchantment";
import { tagsToIdentifiers } from "@/core/Tag";

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
