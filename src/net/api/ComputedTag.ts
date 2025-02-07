/**
 * Fetches tags from the API
 * @param registry - The registry type (e.g., 'enchantment', 'block', etc.)
 * @param path - The tag path (e.g., 'exclusive_set')
 * @param options - Additional options
 * @returns A promise that resolves to the tags and their values
 */
export const getComputedTag = async (
    registry: string,
    path: string,
    options: {
        namespace?: string;
        nested?: boolean;
    } = {}
): Promise<Record<string, string[]>> => {
    const { namespace = "minecraft", nested = false } = options;

    const params = new URLSearchParams({
        namespace,
        nested: nested.toString()
    });

    const response = await fetch(`https://voxel.hardel.io/api/engine/tags/compute/${registry}/${path}?${params}`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};
