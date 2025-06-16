import type { EnchantmentProps } from "@/core/schema/enchant/types";
import type { ActionHandler } from "../../types";
import { SetComputedSlotHandler } from "./SetComputedSlotHandler";
import type { EnchantmentAction } from "./types";
import { createEnchantmentHandlers } from "./types";

export default function register(): Map<string, ActionHandler<EnchantmentAction>> {
    const handlerDefinitions = createEnchantmentHandlers({
        "enchantment.set_computed_slot": new SetComputedSlotHandler(),
        "enchantment.toggle_enchantment_to_exclusive_set": new ToggleEnchantmentToExclusiveSetHandler(),
        "enchantment.set_exclusive_set_with_tags": new SetExclusiveSetWithTagsHandler()
    });

    return new Map(Object.entries(handlerDefinitions));
}

class ToggleEnchantmentToExclusiveSetHandler implements ActionHandler<EnchantmentAction> {
    execute(
        action: Extract<EnchantmentAction, { type: "enchantment.toggle_enchantment_to_exclusive_set" }>,
        element: Record<string, unknown>
    ) {
        const props = { ...element } as EnchantmentProps;
        if (typeof props.exclusiveSet === "string" && props.exclusiveSet.startsWith("#")) {
            props.tags = props.tags.filter((tag) => tag !== props.exclusiveSet);
        }

        const currentSet = Array.isArray(props.exclusiveSet) ? props.exclusiveSet : [];
        const exists = currentSet.includes(action.enchantment);

        props.exclusiveSet = exists ? currentSet.filter((e) => e !== action.enchantment) : [...currentSet, action.enchantment];

        return props;
    }
}

class SetExclusiveSetWithTagsHandler implements ActionHandler<EnchantmentAction> {
    execute(action: Extract<EnchantmentAction, { type: "enchantment.set_exclusive_set_with_tags" }>, element: Record<string, unknown>) {
        const props = { ...element } as EnchantmentProps;
        if (!action.value.startsWith("#")) {
            return props;
        }

        if (typeof props.exclusiveSet === "string" && props.exclusiveSet.startsWith("#") && props.exclusiveSet !== action.value) {
            props.tags = props.tags.filter((tag) => tag !== props.exclusiveSet);
        }

        props.exclusiveSet = action.value;
        return props;
    }
}
