import { Datapack } from "@/core/Datapack";
import type { DataDrivenElement, VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { IdentifierObject } from "@/core/Identifier";
import { type Analysers, type GetAnalyserVoxel, analyserCollection, conceptWithTag } from "@/core/engine/Analyser";
import type { LabeledElement } from "@/core/schema/primitive/label";

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

    for (const [concept, hasTag] of conceptWithTag.entries()) {
        const { compiler } = analyserCollection[concept];
        const compiled = elements.map((element) => compiler(element, concept, datapack.readFile(element.identifier)));
        const compiledElement = compiled.map((element) => element.element);
        const compiledTags = hasTag ? datapack.getCompiledTags(compiled, concept) : [];
        allLabeledElements.push(...datapack.labelElements(concept, hasTag, [...compiledElement, ...compiledTags]));
    }

    return allLabeledElements;
}
