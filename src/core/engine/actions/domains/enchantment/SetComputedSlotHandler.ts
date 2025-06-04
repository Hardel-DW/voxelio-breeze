import { getManager } from "@/core/engine/Manager";
import type { ActionHandler } from "../../types";
import type { EnchantmentAction } from "./types";
import { getFieldValue } from "../../utils";
import { type SlotRegistryType, isArraySlotRegistryType, isSlotRegistryType } from "@/core/engine/managers/SlotManager";
import { isStringArray } from "@/core/engine/utils/property";

/**
 * Handler for enchantment.set_computed_slot action
 * Modifies the slot field of the element with the given value. It adds or removes the value from the slot.
 * If the value is already in the slot, it will be removed, otherwise it will be added.
 */
export class SetComputedSlotHandler implements ActionHandler<EnchantmentAction> {
    execute(
        action: Extract<EnchantmentAction, { type: "enchantment.set_computed_slot" }>,
        element: Record<string, unknown>,
        version?: number
    ): Record<string, unknown> | undefined {
        if (!version) throw new Error("Version is required for computed slot actions");

        const shadowCopy = structuredClone(element);
        const { path } = action;
        const computedValue = getFieldValue(action.slot);

        // Navigate to the field using path
        const pathParts = path.split(".");
        let current = shadowCopy;
        for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]] as Record<string, unknown>;
        }
        const field = pathParts[pathParts.length - 1];
        const unformattedValue = current[field];

        let slotValue: SlotRegistryType;
        if (typeof computedValue === "string" && isSlotRegistryType(computedValue)) {
            slotValue = computedValue;
        } else {
            throw new Error(`Invalid SlotRegistryType: ${computedValue}`);
        }

        let currentValue: SlotRegistryType[];
        if (isStringArray(unformattedValue) && isArraySlotRegistryType(unformattedValue)) {
            currentValue = unformattedValue;
        } else {
            throw new Error(`Invalid SlotRegistryType array: ${unformattedValue}`);
        }

        // Utiliser le ManagerSelector pour obtenir le SlotManager approprié
        const slotManager = getManager("slot", version);
        if (!slotManager) {
            throw new Error(`SlotManager is not available for version ${version}`);
        }

        // Update the field with the computed slot value
        current[field] = slotManager.apply(currentValue, slotValue);

        return shadowCopy;
    }
}
