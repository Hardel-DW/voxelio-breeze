import type { SlotRegistryType } from "@/core/engine/managers/SlotManager";
import type { EnchantmentAction } from "../domains/enchantment/types";
import { ActionBuilder } from "./ActionBuilder";

export class EnchantmentActionBuilder extends ActionBuilder<EnchantmentAction> {
    setComputedSlot(path: string, slot: SlotRegistryType): SetComputedSlotBuilder {
        return new SetComputedSlotBuilder(path, slot);
    }

    build(): EnchantmentAction {
        throw new Error("Use specific builder methods to create actions");
    }
}

class SetComputedSlotBuilder extends ActionBuilder<Extract<EnchantmentAction, { type: "enchantment.set_computed_slot" }>> {
    constructor(
        private path: string,
        private slot: SlotRegistryType
    ) {
        super();
    }

    build() {
        return {
            type: "enchantment.set_computed_slot" as const,
            path: this.path,
            slot: this.slot
        };
    }
}

export const enchantment = new EnchantmentActionBuilder();
