import { isRegistryVoxelElement } from "../../Element.ts";
import type { Analysers, GetAnalyserVoxel } from "../Analyser.ts";
import type { ParseDatapackResult } from "../Parser.ts";
import type { Action } from "../actions/index.ts";
import { updateData } from "../actions/index.ts";

/**
 * Applies migration actions to a target datapack
 */
export function applyActions<T extends keyof Analysers>(
	target: ParseDatapackResult<GetAnalyserVoxel<T>>,
	actions: Map<string, Action[]>,
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
		elements: modifiedElements,
	};
}
