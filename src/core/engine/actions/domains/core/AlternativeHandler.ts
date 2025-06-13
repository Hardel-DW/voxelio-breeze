import type { ActionRegistry } from "../../registry";
import type { ActionHandler } from "../../types";
import type { CoreAction } from "./types";

export class AlternativeHandler implements ActionHandler<CoreAction> {
    constructor(private registry: ActionRegistry) {}

    async execute(
        action: Extract<CoreAction, { type: "core.alternative" }>,
        element: Record<string, unknown>,
        version?: number
    ): Promise<Record<string, unknown> | undefined> {
        if (action.condition) {
            return await this.registry.execute(action.ifTrue, element, version);
        }

        if (action.ifFalse) {
            return await this.registry.execute(action.ifFalse, element, version);
        }

        return element;
    }
}
