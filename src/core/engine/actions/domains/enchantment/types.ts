import type { SlotRegistryType } from "@/core/engine/managers/SlotManager";
import { type AllExpectedHandlerKeys, type ValidateHandlerRegistry, createHandlers } from "../../types";

// Enchantment domain action types
export interface EnchantmentActions {
    set_computed_slot: {
        path: string;
        slot: SlotRegistryType;
    };
}

// Export typed actions for this domain
export type EnchantmentAction = {
    [K in keyof EnchantmentActions]: EnchantmentActions[K] & { type: `enchantment.${K}` };
}[keyof EnchantmentActions];

// Use generic validation system
export type EnchantmentHandlerKeys = AllExpectedHandlerKeys<"enchantment", EnchantmentActions>;
export const createEnchantmentHandlers = <T extends Record<EnchantmentHandlerKeys, any>>(
    handlers: ValidateHandlerRegistry<T, EnchantmentHandlerKeys>
): T => createHandlers(handlers);
