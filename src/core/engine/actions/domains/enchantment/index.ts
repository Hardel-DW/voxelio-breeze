import type { ActionHandler } from "../../types";
import { SetComputedSlotHandler } from "./SetComputedSlotHandler";
import type { EnchantmentAction } from "./types";
import { createEnchantmentHandlers } from "./types";

export default function register(): Map<string, ActionHandler<EnchantmentAction>> {
    const handlerDefinitions = createEnchantmentHandlers({
        "enchantment.set_computed_slot": new SetComputedSlotHandler()
    });

    return new Map(Object.entries(handlerDefinitions));
}
