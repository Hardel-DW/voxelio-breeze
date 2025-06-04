import type { ActionHandler } from "../../types";
import type { CoreAction } from "./types";
import type { ActionRegistry } from "../../registry";

export class AlternativeHandler implements ActionHandler<CoreAction> {
    constructor(private registry: ActionRegistry) {}

    async execute(
        action: Extract<CoreAction, { type: "core.alternative" }>,
        element: Record<string, unknown>,
        version?: number
    ): Promise<Record<string, unknown> | undefined> {
        return await this.registry.execute(action.ifTrue, element, version);
    }
}
