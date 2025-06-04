import type { ActionHandler } from "../../types";
import type { ActionRegistry } from "../../registry";
import type { CoreAction } from "./types";
import { createCoreHandlers } from "./types";
import { SetValueHandler, ToggleValueHandler, InvertBooleanHandler } from "./SetValueHandler";
import { UndefinedHandler } from "./UndefinedHandler";
import { SequentialHandler } from "./SequentialHandler";
import { AlternativeHandler } from "./AlternativeHandler";

export default function register(registry: ActionRegistry): Map<string, ActionHandler<CoreAction>> {
    const handlerDefinitions = createCoreHandlers({
        "core.set_value": new SetValueHandler(),
        "core.toggle_value": new ToggleValueHandler(),
        "core.set_undefined": new UndefinedHandler(),
        "core.invert_boolean": new InvertBooleanHandler(),
        "core.sequential": new SequentialHandler(registry),
        "core.alternative": new AlternativeHandler(registry)
    });

    return new Map(Object.entries(handlerDefinitions));
}
