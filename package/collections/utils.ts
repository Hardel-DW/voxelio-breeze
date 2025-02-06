import type { RegistryKey } from "./one_twenty_one/name.ts";
import { CollectionRegistry } from "./registry.ts";

/**
 * Retrieves a list based on its key
 * @param key - The key of the desired list
 * @returns An array of elements corresponding to the requested list
 * @throws Error if the key does not exist in the registry
 */
export function getList(key: RegistryKey): string[] {
    const registry = CollectionRegistry.getInstance();
    const collection = registry.get(key);

    if (!collection) {
        throw new Error(`The collection ${key} does not exist`);
    }

    return collection;
}
