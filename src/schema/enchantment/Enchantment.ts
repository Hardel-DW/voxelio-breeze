import type { DataDrivenElement } from "@/core/Element";
import type { EnchantmentCost } from "@/schema/enchantment/EnchantmentCost";
import type { TextComponentType } from "@/schema/text/TextComponentType";
import type { SingleOrMultiple } from "@/utils";

const SlotManager = ["any", "mainhand", "offhand", "hand", "head", "chest", "legs", "feet", "armor"] as const;
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
    effects?: Record<string, any>;
}
