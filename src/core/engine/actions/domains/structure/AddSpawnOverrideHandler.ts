import type { ActionHandler } from "../../types";
import type { StructureAction } from "./types";
import type { SpawnOverride } from "@/core/schema/structure/types";

export class AddSpawnOverrideHandler implements ActionHandler<StructureAction> {
    execute(
        action: Extract<StructureAction, { type: "structure.add_spawn_override" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const newOverride: SpawnOverride = {
            mobCategory: action.mobCategory as any,
            boundingBox: action.boundingBox,
            spawns: action.spawns
        };

        const currentOverrides = Array.isArray(element.spawnOverrides) ? element.spawnOverrides : [];
        const existingOverrides = currentOverrides.filter((override: any) => override.mobCategory !== action.mobCategory);

        return {
            ...element,
            spawnOverrides: [...existingOverrides, newOverride]
        };
    }
}
