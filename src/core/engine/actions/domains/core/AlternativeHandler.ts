import { checkCondition } from "../../../condition";
import type { Condition } from "../../../condition/types";
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
        const conditionResult = this.evaluateCondition(action.condition, element);
        if (conditionResult) {
            return await this.registry.execute(action.ifTrue, element, version);
        }

        if (action.ifFalse) {
            return await this.registry.execute(action.ifFalse, element, version);
        }

        return element;
    }

    private evaluateCondition(condition: boolean | Condition, element: Record<string, unknown>): boolean {
        if (typeof condition === "boolean") {
            return condition;
        }

        if (condition && typeof condition === "object" && "condition" in condition) {
            return checkCondition(condition as Condition, element);
        }

        return Boolean(condition);
    }
}
