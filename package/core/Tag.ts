import type { DataDrivenRegistryElement } from "@/lib/minecraft/core/Element";
import { Identifier } from "@/lib/minecraft/core/Identifier";
import type { IdentifierObject } from "@/lib/minecraft/core/Identifier";
import type { Compiler } from "@/lib/minecraft/core/engine/Compiler";
import type { TagType } from "@voxel/definitions";

/**
 * Searches for a tag in a list of tags.
 * @param tag - The JSON tag object.
 * @param value - The value to search for.
 */
export const isPresentInTag = (tag: DataDrivenRegistryElement<TagType>, value: string): boolean => {
    return tag.data.values.some((tagValue) => {
        if (typeof tagValue === "string") {
            return tagValue === value;
        }

        if (typeof tagValue === "object") {
            return tagValue.id === value;
        }

        return false;
    });
};

/**
 * Converts a list of tags to identifiers.
 * @param tags - The list of tags to convert.
 * @param registry - The registry to use.
 * @returns The list of identifiers.
 */
export const tagsToIdentifiers = (tags: string[], registry: string): IdentifierObject[] => {
    return tags.map((tag) => Identifier.of(tag, registry));
};

/**
 * Get the tags from a registry element.
 * @param el - The registry element.
 * @returns The tags.
 */
export const getTagsFromRegistry = (el: TagType): string[] => {
    return el.values.map((value) => (typeof value === "string" ? value : value.id));
};

/**
 * Check if an element is a tag.
 * @param element - The element to check.
 * @returns Whether the element is a tag.
 */
export const isTag = (element: DataDrivenRegistryElement<any>): element is DataDrivenRegistryElement<TagType> => {
    return element?.identifier?.registry?.startsWith("tags/") ?? false;
};

/**
 * Merge two tags.
 * @param a - The first tag.
 * @param b - The second tag.
 * @returns The merged tag.
 */
export const mergeTags = (a: TagType, b: TagType): TagType => {
    return {
        values: Array.from(new Set([...a.values, ...b.values]))
    };
};

export const mergeDataDrivenRegistryElement = (
    a: DataDrivenRegistryElement<TagType>[],
    b: DataDrivenRegistryElement<TagType>[]
): DataDrivenRegistryElement<TagType>[] => {
    const response = new Map<string, DataDrivenRegistryElement<TagType>>();

    for (const tag of a) {
        const key = new Identifier(tag.identifier).toFilePath();
        response.set(key, tag);
    }

    for (const tag of b) {
        const key = new Identifier(tag.identifier).toFilePath();
        const existing = response.get(key);
        if (existing) {
            response.set(key, {
                identifier: existing.identifier,
                data: mergeTags(existing.data, tag.data)
            });
        } else {
            response.set(key, tag);
        }
    }

    return Array.from(response.values());
};

/**
 * Create a tag from a list of main elements like "enchantment".
 * @param elements - The elements to create the tag from.
 * @returns The tag.
 */
export const createTagFromElement = (elements: ReturnType<Compiler>[]) => {
    const tags: DataDrivenRegistryElement<TagType>[] = [];
    const temp: Map<string, { identifier: IdentifierObject; elements: string[] }> = new Map();

    for (const element of elements) {
        for (const tags of element.tags) {
            const path = new Identifier(tags).toFilePath();

            if (!temp.has(path)) temp.set(path, { identifier: tags, elements: [] });
            temp.get(path)?.elements.push(new Identifier(element.element.identifier).toString());
        }
    }

    for (const path of temp.keys()) {
        const value = temp.get(path);
        if (!value) continue;

        tags.push({ identifier: value.identifier, data: { values: value.elements } });
    }

    return tags;
};
