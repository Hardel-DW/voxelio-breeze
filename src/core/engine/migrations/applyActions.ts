import { isRegistryVoxelElement } from "@/core/Element";
import type { Analysers, GetAnalyserVoxel } from "@/core/engine/Analyser";
import type { ParseDatapackResult } from "@/core/engine/Parser";
import { updateData } from "@/core/engine/actions";
import type { Action } from "@/core/engine/actions/types";

/**
 * Applies migration actions to a target datapack
 */
export function applyActions<T extends keyof Analysers>(
    target: ParseDatapackResult<GetAnalyserVoxel<T>>,
    actions: Map<string, Action[]>
): ParseDatapackResult<GetAnalyserVoxel<T>> {
    const modifiedElements = new Map(target.elements);

    // Apply each action to the corresponding element
    for (const [identifier, elementActions] of actions) {
        const element = modifiedElements.get(identifier);
        if (!element) continue;

        let currentElement = element;
        for (const action of elementActions) {
            const updatedElement = updateData(action, currentElement, target.version);
            const voxelElement = isRegistryVoxelElement(updatedElement);
            if (voxelElement) {
                currentElement = updatedElement.data;
            }
        }
        modifiedElements.set(identifier, currentElement);
    }

    return {
        ...target,
        elements: modifiedElements
    };
}
