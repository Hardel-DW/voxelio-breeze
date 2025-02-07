import { SECTIONS } from "@/core/schema/enchant/sections";
import type { ToolConfiguration } from "@/core/schema/primitive";

export const ENCHANT_TOOL_CONFIG: ToolConfiguration = {
    interface: SECTIONS,
    sidebar: {
        lock: [
            {
                text: {
                    type: "translate",
                    value: "tools.disabled_because_vanilla"
                },
                condition: {
                    condition: "object",
                    field: "identifier",
                    terms: {
                        condition: "compare_value_to_field_value",
                        field: "namespace",
                        value: "minecraft"
                    }
                }
            }
        ],
        action: {
            type: "alternative",
            field: "mode",
            cases: [
                {
                    when: "normal",
                    do: {
                        type: "set_value",
                        field: "mode",
                        value: "soft_delete"
                    }
                },
                {
                    when: "only_creative",
                    do: {
                        type: "set_value",
                        field: "mode",
                        value: "soft_delete"
                    }
                },
                {
                    when: "soft_delete",
                    do: {
                        type: "set_value",
                        field: "mode",
                        value: "normal"
                    }
                }
            ]
        },
        enabled: {
            condition: "compare_value_to_field_value",
            field: "mode",
            value: "soft_delete"
        }
    },
    analyser: "enchantment"
};
