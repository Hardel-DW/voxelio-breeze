import { Datapack } from "@/core/Datapack";
import type { DataDrivenElement, LabeledElement, VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { IdentifierObject } from "@/core/Identifier";
import { type Analysers, type GetAnalyserVoxel, analyserCollection } from "@/core/engine/Analyser";

export type Compiler<T extends VoxelElement = VoxelElement, K extends DataDrivenElement = DataDrivenElement> = (
    element: T,
    config: keyof Analysers,
    original?: K
) => {
    element: DataDrivenRegistryElement<K>;
    tags: IdentifierObject[];
};

export function compileDatapack({
    elements,
    files
}: {
    elements: GetAnalyserVoxel<keyof Analysers>[];
    files: Record<string, Uint8Array>;
}): Array<LabeledElement> {
    const datapack = new Datapack(files);
    const allLabeledElements: LabeledElement[] = [];

    // Group elements by their identifier registry
    const elementsByRegistry = new Map<keyof Analysers, GetAnalyserVoxel<keyof Analysers>[]>();
    for (const element of elements) {
        const registry = element.identifier.registry as keyof Analysers;
        if (!elementsByRegistry.has(registry)) {
            elementsByRegistry.set(registry, []);
        }
        elementsByRegistry.get(registry)?.push(element);
    }

    // Type-safe registry processing
    function processRegistry<K extends keyof Analysers>(registry: K, elements: GetAnalyserVoxel<K>[]) {
        const { compiler, hasTag } = analyserCollection[registry];
        const compiled = elements.map((element) => compiler(element, registry, datapack.readFile(element.identifier)));
        const compiledElements = compiled.map((element) => element.element);
        const compiledTags = hasTag ? datapack.getCompiledTags(compiled, registry) : [];
        allLabeledElements.push(...datapack.labelElements(registry, hasTag, [...compiledElements, ...compiledTags]));
    }

    // Process all registries from the map
    for (const [registry, registryElements] of elementsByRegistry.entries()) {
        processRegistry(registry, registryElements);
    }

    return allLabeledElements;
}
