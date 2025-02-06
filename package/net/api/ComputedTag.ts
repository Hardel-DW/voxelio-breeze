import useSWR from "swr";

/**
 * Fetches tags from the API
 * @param registry - The registry type (e.g., 'enchantment', 'block', etc.)
 * @param path - The tag path (e.g., 'exclusive_set')
 * @param options - Additional options
 * @returns An object containing the tags and their values
 */
export const useComputedTag = (
    registry: string,
    path: string,
    options: {
        namespace?: string;
        nested?: boolean;
    } = {}
) => {
    const { namespace = "minecraft", nested = false } = options;

    const params = new URLSearchParams({
        namespace,
        nested: nested.toString()
    });

    const { data, error, isLoading } = useSWR<Record<string, string[]>>(
        `/api/engine/tags/compute/${registry}/${path}?${params}`,
        (url: string) => fetch(url).then((res) => res.json())
    );

    return {
        data,
        isLoading,
        error
    };
};

/**
 * Fetches a specific tag from the API
 * @example
 * // Fetch sword attribute tag
 * const { data } = useTag('enchantment', 'exclusive_set', 'sword_attribute')
 * // Makes request to: /api/engine/tags/get?registry=enchantment&path=exclusive_set&fileName=sword_attribute&namespace=minecraft
 *
 * @param registry - The registry type (e.g., 'enchantment', 'block', etc.)
 * @param path - The tag path (e.g., 'exclusive_set')
 * @param fileName - The tag file name
 * @param options - Additional options
 * @returns An object containing the tag and its value
 */
export const useTag = (
    registry: string,
    path: string,
    fileName: string,
    options: {
        namespace?: string;
    } = {}
) => {
    const { namespace = "minecraft" } = options;

    const params = new URLSearchParams({ registry, path, fileName, namespace });
    const { data, error, isLoading } = useSWR<string[]>(`/api/engine/tags/get?${params}`, (url: string) =>
        fetch(url).then((res) => res.json())
    );

    return {
        data,
        isLoading,
        error
    };
};
