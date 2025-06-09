import type { SlotRegistryType } from "@/core/engine/managers/SlotManager";
import { type AllExpectedHandlerKeys, type ValidateHandlerRegistry, createHandlers } from "../../types";

export interface EnchantmentActions {
    set_computed_slot: {
        path: string;
        slot: SlotRegistryType;
    };
}

export type EnchantmentAction = {
    [K in keyof EnchantmentActions]: EnchantmentActions[K] & { type: `enchantment.${K}` };
}[keyof EnchantmentActions];

export type EnchantmentHandlerKeys = AllExpectedHandlerKeys<"enchantment", EnchantmentActions>;
export const createEnchantmentHandlers = <T extends Record<EnchantmentHandlerKeys, any>>(
    handlers: ValidateHandlerRegistry<T, EnchantmentHandlerKeys>
): T => createHandlers(handlers);
