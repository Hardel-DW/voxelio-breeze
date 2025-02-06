import type { VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import { Identifier, type IdentifierObject } from "@/core/Identifier";
import { tagsToIdentifiers } from "@/core/Tag";
import type { Analysers } from "@/core/engine/Analyser";
import type { Compiler } from "@/core/engine/Compiler";
import type { Parser, ParserParams } from "@/core/engine/Parser";
import type { SlotRegistryType } from "@/core/engine/managers/SlotManager";
import type { FieldProperties } from "@/core/schema/primitive/properties";
import { I18n } from "@/i18n/i18n";
import type { Enchantment } from "@/schema/enchantment/Enchantment";
import type { TextComponentType } from "@/schema/text/TextComponentType";
import type { SingleOrMultiple } from "@/utils";

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

export const enchantmentProperties = (lang: string): FieldProperties => {
    const i18n = new I18n(lang);
    const t = i18n.translate.bind(i18n);
    const fields: FieldProperties = {
        description: {
            name: t("enchantment.field.description.name"),
            type: "string"
        },
        exclusiveSet: {
            name: t("enchantment.field.exclusiveSet.name"),
            type: "string"
        },
        supportedItems: {
            name: t("enchantment.field.supportedItems.name"),
            type: "tags"
        },
        primaryItems: {
            name: t("enchantment.field.primaryItems.name"),
            type: "tags"
        },
        maxLevel: {
            name: t("enchantment.field.maxLevel.name"),
            type: "number",
            icon: "/icons/tools/level.svg"
        },
        weight: {
            name: t("enchantment.field.weight.name"),
            type: "number",
            icon: "/icons/tools/weight.svg"
        },
        anvilCost: {
            name: t("enchantment.field.anvilCost.name"),
            type: "number",
            icon: "/icons/tools/anvil.svg"
        },
        minCostBase: {
            name: t("enchantment.field.minCostBase.name"),
            type: "number"
        },
        minCostPerLevelAboveFirst: {
            name: t("enchantment.field.minCostPerLevelAboveFirst.name"),
            type: "number"
        },
        maxCostBase: {
            name: t("enchantment.field.maxCostBase.name"),
            type: "number"
        },
        maxCostPerLevelAboveFirst: {
            name: t("enchantment.field.maxCostPerLevelAboveFirst.name"),
            type: "number"
        },
        effects: {
            name: t("enchantment.field.effects.name"),
            type: "effects"
        },
        slots: {
            name: t("enchantment.field.slots.name"),
            type: "array"
        },
        tags: {
            name: t("enchantment.field.tags.name"),
            type: "array"
        },
        mode: {
            name: t("enchantment.field.mode.name"),
            type: "string"
        },
        disabledEffects: {
            name: t("enchantment.field.disabledEffects.name"),
            type: "effects"
        }
    };

    return fields;
};

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
export const DataDrivenToVoxelFormat: Parser<EnchantmentProps, Enchantment> = ({
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
    const tagsRelatedToFunctionality = tags_related_to_functionality.map((tag) => new Identifier(tag).toString());
    if (tagsWithoutExclusiveSet.every((tag) => tagsRelatedToFunctionality.includes(tag))) {
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
export const VoxelToDataDriven: Compiler<EnchantmentProps, Enchantment> = (
    element: EnchantmentProps,
    config: keyof Analysers,
    original?: Enchantment
): {
    element: DataDrivenRegistryElement<Enchantment>;
    tags: IdentifierObject[];
} => {
    const enchantment = structuredClone(original ?? {}) as Enchantment;
    const enchant = structuredClone(element);
    const tagRegistry = `tags/${config}`;
    let tags = [...tagsToIdentifiers(enchant.tags, tagRegistry)];

    enchantment.max_level = enchant.maxLevel;
    enchantment.weight = enchant.weight;
    enchantment.anvil_cost = enchant.anvilCost;
    enchantment.supported_items = enchant.supportedItems;
    enchantment.slots = enchant.slots;
    enchantment.effects = enchant.effects;
    enchantment.min_cost = {
        base: enchant.minCostBase,
        per_level_above_first: enchant.minCostPerLevelAboveFirst
    };
    enchantment.max_cost = {
        base: enchant.maxCostBase,
        per_level_above_first: enchant.maxCostPerLevelAboveFirst
    };

    if (enchant.primaryItems) {
        enchantment.primary_items = enchant.primaryItems;
    }

    if (!enchant.supportedItems && enchant.primaryItems) {
        enchantment.supported_items = enchant.primaryItems;
    }

    if (enchant.mode === "only_creative") {
        tags = tags.filter((tag) => tags_related_to_functionality.some((t) => new Identifier(t).equalsObject(tag)));
    }

    if (enchant.exclusiveSet) {
        enchantment.exclusive_set = enchant.exclusiveSet;

        if (typeof enchant.exclusiveSet === "string") {
            tags.push(Identifier.of(enchant.exclusiveSet, tagRegistry));
        }
    }

    if (enchant.disabledEffects.length > 0 && enchantment.effects) {
        for (const effect of enchant.disabledEffects) {
            delete enchantment.effects[effect as keyof typeof enchantment.effects];
        }
    }

    if (enchant.mode === "soft_delete") {
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
