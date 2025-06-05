import { getManager } from "@/core/engine/Manager";
import type { ActionHandler } from "../../types";
import type { EnchantmentAction } from "./types";
import { getFieldValue, getValueAtPath, setValueAtPath } from "../../utils";
import { type SlotRegistryType, isArraySlotRegistryType, isSlotRegistryType } from "@/core/engine/managers/SlotManager";
import { isStringArray } from "@/core/engine/utils/property";

/**
 * Handler for enchantment.set_computed_slot action
 * Toggles a slot value in the target array. If the slot is already present, it will be removed.
 * If the slot is not present, it will be added using SlotManager logic.
 */
export class SetComputedSlotHandler implements ActionHandler<EnchantmentAction> {
    execute(
        action: Extract<EnchantmentAction, { type: "enchantment.set_computed_slot" }>,
        element: Record<string, unknown>,
        version?: number
    ): Record<string, unknown> | undefined {
        if (!version) throw new Error("Version is required for computed slot actions");

        const { path } = action;
        const computedValue = getFieldValue(action.slot);
        const unformattedValue = getValueAtPath(element, path);

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

        // Get SlotManager for the version
        const slotManager = getManager("slot", version);
        if (!slotManager) {
            throw new Error(`SlotManager is not available for version ${version}`);
        }

        // Apply the slot toggle and return new element
        const newSlots = slotManager.apply(currentValue, slotValue);
        return setValueAtPath(element, path, newSlots);
    }
}
