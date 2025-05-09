import { Datapack } from "@/core/Datapack";
import type { DataDrivenElement, VoxelElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { IdentifierObject } from "@/core/Identifier";
import { type Analysers, type GetAnalyserVoxel, analyserCollection } from "@/core/engine/Analyser";
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
    version,
    files,
    tool
}: {
    elements: GetAnalyserVoxel<keyof Analysers>[];
    version: number;
    files: Record<string, Uint8Array>;
    tool: keyof Analysers;
}): Array<LabeledElement> {
    const datapack = new Datapack(files);
    const { compiler } = analyserCollection[tool];
    const compiledElements = elements.map((element) => compiler(element, tool, datapack.readFile(element.identifier)));
    const compiledTags = datapack.getCompiledTags(compiledElements);

    return datapack.labelElements(tool, [...compiledElements.map((element) => element.element), ...compiledTags]);
}
