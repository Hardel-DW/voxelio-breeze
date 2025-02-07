import Datapack from "@/core/Datapack";
import type { DataDrivenElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";

export function collectFromPath<T extends DataDrivenElement>(
    registry: string,
    files: Record<string, Uint8Array>,
    path: string,
    exclude_namespace?: string[]
): DataDrivenRegistryElement<T>[] {
    const content = new Datapack(files).getRegistry<T>(registry);
    return content.filter((element) => {
        const matchesPath = element.identifier.resource.startsWith(path);
        if (!matchesPath) return false;

        if (exclude_namespace && exclude_namespace.length > 0) {
            return !exclude_namespace.includes(element.identifier.namespace);
        }

        return true;
    });
}
