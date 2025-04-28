import type { RoadmapKeysCollection } from "./primitive";

/**
 * Compares two RoadmapKeysCollection objects and returns the IDs of schemas
 * and potentially the string "field" if field hashes differ for the same roadmap registry ID.
 * It only compares elements (schemas or fields) that exist in both collections under the same IDs.
 * @param oldCollection The old collection.
 * @param newCollection The new collection.
 * @returns An array of schema IDs and/or "field" string indicating differences.
 */
export function findDifferingSchemaIds(oldCollection: RoadmapKeysCollection, newCollection: RoadmapKeysCollection): string[] {
    const oldSchemaMap = new Map<string, string>();
    const oldFieldMap = new Map<string, string>();

    for (const [registryId, roadmap] of Object.entries(oldCollection.roadmaps)) {
        oldFieldMap.set(registryId, roadmap.field.hash);
        for (const item of roadmap.schema) {
            oldSchemaMap.set(item.id, item.hash);
        }
    }

    const differingIds = new Set<string>();

    for (const [registryId, newRoadmap] of Object.entries(newCollection.roadmaps)) {
        const oldFieldHash = oldFieldMap.get(registryId);
        if (oldFieldHash !== undefined && oldFieldHash !== newRoadmap.field.hash) {
            differingIds.add("field");
        }

        for (const newItem of newRoadmap.schema) {
            const oldSchemaHash = oldSchemaMap.get(newItem.id);
            if (oldSchemaHash !== undefined && oldSchemaHash !== newItem.hash) {
                differingIds.add(newItem.id);
            }
        }
    }

    return Array.from(differingIds);
}

/**
 * Compares the top-level hash properties of two RoadmapKeysCollection objects.
 * @param oldCollection The old collection.
 * @param newCollection The new collection.
 * @returns True if the top-level hashes are different, false otherwise.
 */
export function haveDifferentCollectionHashes(oldCollection: RoadmapKeysCollection, newCollection: RoadmapKeysCollection): boolean {
    return oldCollection.hash !== newCollection.hash;
}
