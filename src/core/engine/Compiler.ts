import { Datapack } from "@/core/Datapack";
import type { DataDrivenElement, LabeledElement, VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { IdentifierObject } from "@/core/Identifier";
import { Identifier } from "@/core/Identifier";
import { type Analysers, type GetAnalyserVoxel, analyserCollection } from "@/core/engine/Analyser";
import type { Logger } from "@/core/engine/migrations/logger";

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
    files,
    logger
}: {
    elements: GetAnalyserVoxel<keyof Analysers>[];
    files: Record<string, Uint8Array>;
    logger?: Logger;
}): Array<LabeledElement> {
    const datapack = new Datapack(files);
    const allLabeledElements: LabeledElement[] = [];

    const filteredElements = logger
        ? (() => {
              const modifiedElements = new Set(logger.getChanges().map((change) => `${change.identifier}$${change.registry}`));
              return elements.filter((element) => modifiedElements.has(new Identifier(element.identifier).toUniqueKey()));
          })()
        : elements;

    // Group elements by their identifier registry
    const elementsByRegistry = new Map<keyof Analysers, GetAnalyserVoxel<keyof Analysers>[]>();
    for (const element of filteredElements) {
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
