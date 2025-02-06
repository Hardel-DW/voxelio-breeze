import type { RegistryKey } from "../collections/one_twenty_one/name.ts";

const CACHE_NAME = "minecraft-collections-v1";

/**
 * URL of the raw GitHub data containing Minecraft registries.
 */
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/misode/mcmeta/summary/registries/data.min.json";

/**
 * Fetches a specific Minecraft registry by its key.
 * @param {RegistryKey} key - The key of the registry to fetch.
 * @returns {Promise<string[]>} A promise that resolves to an array of registry values.
 * @throws {Error} If the registry is not found or if the fetch operation fails.
 */
export async function getRegistry(key: RegistryKey): Promise<string[]> {
    try {
        const data = await cachedFetch<Record<string, string[]>>(GITHUB_RAW_URL);
        if (!data[key]) {
            throw new Error(`Registry '${key}' not found`);
        }
        return data[key];
    } catch (e) {
        throw new Error(
            `Failed to fetch registry '${key}': ${e instanceof Error ? e.message : String(e)}`,
        );
    }
}

/**
 * Options for the fetch operation.
 */
interface FetchOptions {
    /**
     * Whether to refresh the cache.
     */
    refresh?: boolean;
}

/**
 * Fetches data from a URL, using cache when available.
 * @param {string} url - The URL to fetch data from.
 * @param {FetchOptions} [options={}] - Options for the fetch operation.
 * @returns {Promise<T>} A promise that resolves to the fetched data.
 * @throws {Error} If the cache operation fails.
 */
async function cachedFetch<T>(
    url: string,
    options: FetchOptions = {},
): Promise<T> {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(url);

        if (cachedResponse && !options.refresh) {
            const data = await cachedResponse.json();
            return data as T;
        }

        const response = await fetch(url);
        const responseClone = response.clone();
        const data = await response.json();

        await cache.put(url, responseClone);
        return data as T;
    } catch (e) {
        throw new Error(
            `Cache operation failed: ${e instanceof Error ? e.message : String(e)}`,
        );
    }
}

/**
 * Refreshes the cache by deleting the stored data.
 * @returns {Promise<void>} A promise that resolves when the cache is refreshed.
 */
export async function refreshCache(): Promise<void> {
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.delete(GITHUB_RAW_URL);
    } catch (e) {
        console.warn("Failed to refresh cache:", e);
    }
}
