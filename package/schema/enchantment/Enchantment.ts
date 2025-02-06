import type { DataDrivenElement } from "../../index.ts";
import type { SingleOrMultiple } from "../../utils.ts";
import type { TextComponentType } from "../text/TextComponentType.ts";
import type { EffectComponentsRecord } from "./EffectComponents.ts";
import type { EnchantmentCost } from "./EnchantmentCost.ts";

const SlotManager = [
    "any",
    "mainhand",
    "offhand",
    "hand",
    "head",
    "chest",
    "legs",
    "feet",
    "armor",
] as const;
export type SlotRegistryType = (typeof SlotManager)[number];
export interface Enchantment extends DataDrivenElement {
    description: TextComponentType;
    exclusive_set?: SingleOrMultiple<string>;
    supported_items: SingleOrMultiple<string>;
    primary_items?: SingleOrMultiple<string>;
    weight: number;
    max_level: number;
    min_cost: EnchantmentCost;
    max_cost: EnchantmentCost;
    anvil_cost: number;
    slots: SlotRegistryType[];
    effects?: EffectComponentsRecord;
}
