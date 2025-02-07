import { Datapack } from "@/core/Datapack";
import { Identifier } from "@/core/Identifier";
import { collectFromPath } from "@/core/engine/renderer/iteration/collectFromPath";
import type { IterationResult, IterationValue } from "@/core/engine/renderer/iteration/type";

export function createIterations(valueSet: IterationValue, files: Record<string, Uint8Array>): IterationResult[] {
    if (valueSet.type === "collect_from_path" || valueSet.type === "get_registry_elements") {
        const elements =
            valueSet.type === "collect_from_path"
                ? collectFromPath(valueSet.registry, files, valueSet.path, valueSet.exclude_namespace)
                : new Datapack(files).getRegistry(valueSet.registry);

        return elements.map((file) => ({
            key: new Identifier(file.identifier).toString(),
            context: {
                filename: new Identifier(file.identifier).toResourceName(),
                resource: new Identifier(file.identifier).toResourcePath(),
                namespace: file.identifier.namespace,
                identifier: new Identifier(file.identifier).toString()
            }
        }));
    }

    if (valueSet.type === "static") {
        return valueSet.values.map((value) => ({
            key: value,
            context: {
                current_iteration: value
            }
        }));
    }

    if (valueSet.type === "object") {
        return valueSet.values.map((objectData, index) => ({
            key: `object_${index}`,
            context: {
                object_data: objectData
            }
        }));
    }

    return [];
}
