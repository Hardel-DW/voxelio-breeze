import Datapack from "../Datapack.ts";
import type { DataDrivenElement, VoxelElement } from "../Element.ts";
import type { DataDrivenRegistryElement } from "../Element.ts";
import type { IdentifierObject } from "../Identifier.ts";
import {
	type Analysers,
	type GetAnalyserVoxel,
	getAnalyserForVersion,
} from "./Analyser.ts";
import type { LabeledElement } from "../schema/primitive/label.ts";

export type Compiler<
	T extends VoxelElement = VoxelElement,
	K extends DataDrivenElement = DataDrivenElement,
> = (
	element: T,
	config: keyof Analysers,
	original?: K,
) => {
	element: DataDrivenRegistryElement<K>;
	tags: IdentifierObject[];
};

export function compileDatapack({
	elements,
	version,
	files,
	tool,
}: {
	elements: GetAnalyserVoxel<keyof Analysers>[];
	version: number;
	files: Record<string, Uint8Array>;
	tool: keyof Analysers;
}): Array<LabeledElement> {
	const datapack = new Datapack(files);
	const analyser = getAnalyserForVersion(tool, version).analyser;
	const compiledElements = elements.map((element) =>
		analyser.compiler(element, tool, datapack.readFile(element.identifier)),
	);
	const compiledTags = datapack.getCompiledTags(compiledElements);

	return datapack.labelElements(tool, [
		...compiledElements.map((element) => element.element),
		...compiledTags,
	]);
}
