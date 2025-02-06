import type { VoxelElement } from "../Element.ts";
import type { Compiler } from "./Compiler.ts";
import type { Parser } from "./Parser.ts";
import { DatapackError } from "../errors/DatapackError.ts";
import { ENCHANT_TOOL_CONFIG } from "../schema/enchant/EnchantmentProps.ts";
import {
	DataDrivenToVoxelFormat,
	type EnchantmentProps,
	VoxelToDataDriven,
} from "../schema/enchant/EnchantmentProps.ts";
import { enchantmentProperties } from "../schema/enchant/EnchantmentProps.ts";
import type { ToolConfiguration } from "../schema/primitive/index.ts";
import type { FieldProperties } from "../schema/primitive/properties.ts";
import type { DataDrivenElement, Enchantment } from "@voxel/definitions";

export type GetAnalyserVoxel<T extends keyof Analysers> = Analysers[T]["voxel"];
export type GetAnalyserMinecraft<T extends keyof Analysers> =
	Analysers[T]["minecraft"];

export type Analysers = {
	enchantment: {
		voxel: EnchantmentProps;
		minecraft: Enchantment;
	};
};

export interface Analyser<T extends VoxelElement, K extends DataDrivenElement> {
	compiler: Compiler<T, K>;
	parser: Parser<T, K>;
	properties: (lang: string) => FieldProperties;
}

export type VersionedAnalyser<
	T extends VoxelElement,
	K extends DataDrivenElement,
> = {
	analyser: Analyser<T, K>;
	range: VersionRange;
	config: ToolConfiguration;
};

export type VersionedAnalysers = {
	[Q in keyof Analysers]: Array<
		VersionedAnalyser<Analysers[Q]["voxel"], Analysers[Q]["minecraft"]>
	>;
};

export type VersionRange = {
	min: number;
	max: number;
};

export const versionedAnalyserCollection: VersionedAnalysers = {
	enchantment: [
		{
			analyser: {
				compiler: VoxelToDataDriven,
				parser: DataDrivenToVoxelFormat,
				properties: enchantmentProperties,
			},
			range: { min: 48, max: Number.POSITIVE_INFINITY },
			config: ENCHANT_TOOL_CONFIG,
		},
	],
};

export function getAnalyserForVersion<T extends keyof Analysers>(
	type: T,
	version: number,
): {
	analyser: Analyser<Analysers[T]["voxel"], Analysers[T]["minecraft"]>;
	config: ToolConfiguration;
} {
	const versionedAnalysers = versionedAnalyserCollection[type];
	if (!versionedAnalysers) throw new DatapackError("tools.error.no_analyser");

	for (const entry of versionedAnalysers) {
		if (version >= entry.range.min && version <= entry.range.max) {
			return { analyser: entry.analyser, config: entry.config };
		}
	}

	throw new DatapackError("tools.error.no_analyser");
}
