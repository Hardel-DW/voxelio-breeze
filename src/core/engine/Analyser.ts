import { DatapackError } from "@/core/DatapackError";
import type { DataDrivenElement, VoxelElement } from "@/core/Element";
import type { Compiler } from "@/core/engine/Compiler";
import type { Parser } from "@/core/engine/Parser";
import { DataDrivenToVoxelFormat, type EnchantmentProps, VoxelToDataDriven } from "@/core/schema/EnchantmentProps";
import type { ToolConfiguration } from "@/core/schema/primitive/index";
import type { Enchantment } from "@/schema/enchantment/Enchantment";

export type GetAnalyserVoxel<T extends keyof Analysers> = Analysers[T]["voxel"];
export type GetAnalyserMinecraft<T extends keyof Analysers> = Analysers[T]["minecraft"];

export type Analysers = {
    enchantment: {
        voxel: EnchantmentProps;
        minecraft: Enchantment;
    };
};

export interface Analyser<T extends VoxelElement, K extends DataDrivenElement> {
    compiler: Compiler<T, K>;
    parser: Parser<T, K>;
}

export type VersionedAnalyser<T extends VoxelElement, K extends DataDrivenElement> = {
    analyser: Analyser<T, K>;
    range: VersionRange;
};

export type VersionedAnalysers = {
    [Q in keyof Analysers]: Array<VersionedAnalyser<Analysers[Q]["voxel"], Analysers[Q]["minecraft"]>>;
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
                parser: DataDrivenToVoxelFormat
            },
            range: { min: 48, max: Number.POSITIVE_INFINITY }
        }
    ]
};

export function getAnalyserForVersion<T extends keyof Analysers>(
    type: T,
    version: number
): {
    analyser: Analyser<Analysers[T]["voxel"], Analysers[T]["minecraft"]>;
} {
    const versionedAnalysers = versionedAnalyserCollection[type];
    if (!versionedAnalysers) throw new DatapackError("tools.error.no_analyser");

    for (const entry of versionedAnalysers) {
        if (version >= entry.range.min && version <= entry.range.max) {
            return { analyser: entry.analyser };
        }
    }

    throw new DatapackError("tools.error.no_analyser");
}
