import type { ActionHandler } from "../../types";
import { AddSpawnOverrideHandler } from "./AddSpawnOverrideHandler";
import { SetBiomesHandler } from "./SetBiomesHandler";
import { SetJigsawConfigHandler } from "./SetJigsawConfigHandler";
import type { StructureAction } from "./types";
import { createStructureHandlers } from "./types";

export default function register(): Map<string, ActionHandler<StructureAction>> {
    const handlerDefinitions = createStructureHandlers({
        "structure.set_biomes": new SetBiomesHandler(),
        "structure.add_spawn_override": new AddSpawnOverrideHandler(),
        "structure.remove_spawn_override": new RemoveSpawnOverrideHandler(),
        "structure.set_jigsaw_config": new SetJigsawConfigHandler(),
        "structure.add_pool_alias": new AddPoolAliasHandler(),
        "structure.remove_pool_alias": new RemovePoolAliasHandler(),
        "structure.set_terrain_adaptation": new SetTerrainAdaptationHandler(),
        "structure.set_decoration_step": new SetDecorationStepHandler()
    });

    return new Map(Object.entries(handlerDefinitions));
}

class RemoveSpawnOverrideHandler implements ActionHandler<StructureAction> {
    execute(
        action: Extract<StructureAction, { type: "structure.remove_spawn_override" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const currentOverrides = Array.isArray(element.spawnOverrides) ? element.spawnOverrides : [];
        return {
            ...element,
            spawnOverrides: currentOverrides.filter((override: any) => override.mobCategory !== action.mobCategory)
        };
    }
}

class AddPoolAliasHandler implements ActionHandler<StructureAction> {
    execute(
        action: Extract<StructureAction, { type: "structure.add_pool_alias" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const newAlias = {
            type: action.aliasType,
            ...(action.alias && { alias: action.alias }),
            ...(action.target && { target: action.target }),
            ...(action.targets && { targets: action.targets })
        };

        const poolAliases = Array.isArray(element.poolAliases) ? element.poolAliases : [];

        return {
            ...element,
            poolAliases: [...poolAliases, newAlias]
        };
    }
}

class RemovePoolAliasHandler implements ActionHandler<StructureAction> {
    execute(
        action: Extract<StructureAction, { type: "structure.remove_pool_alias" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        const poolAliases = Array.isArray(element.poolAliases) ? element.poolAliases : [];

        return {
            ...element,
            poolAliases: poolAliases.filter((alias: any) => alias.alias !== action.alias)
        };
    }
}

class SetTerrainAdaptationHandler implements ActionHandler<StructureAction> {
    execute(
        action: Extract<StructureAction, { type: "structure.set_terrain_adaptation" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        return { ...element, terrainAdaptation: action.adaptation };
    }
}

class SetDecorationStepHandler implements ActionHandler<StructureAction> {
    execute(
        action: Extract<StructureAction, { type: "structure.set_decoration_step" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        return { ...element, step: action.step };
    }
}
