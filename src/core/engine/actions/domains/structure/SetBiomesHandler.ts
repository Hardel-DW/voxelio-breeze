import type { ActionHandler } from "../../types";
import type { StructureAction } from "./types";

export class SetBiomesHandler implements ActionHandler<StructureAction> {
    execute(action: Extract<StructureAction, { type: "structure.set_biomes" }>, element: Record<string, unknown>): Record<string, unknown> {
        if (action.replace) {
            return { ...element, biomes: action.biomes };
        }

        const currentBiomes = Array.isArray(element.biomes) ? element.biomes : [];
        const existingBiomes = new Set(currentBiomes);
        const newBiomes = [...currentBiomes];

        for (const biome of action.biomes) {
            if (!existingBiomes.has(biome)) {
                newBiomes.push(biome);
            }
        }

        return { ...element, biomes: newBiomes };
    }
}
