import type { DataDrivenElement, VoxelElement } from "@/core/Element";
import type { Compiler } from "@/core/engine/Compiler";
import type { Parser } from "@/core/engine/Parser";
import { DataDrivenToVoxelFormat, type EnchantmentProps, VoxelToDataDriven } from "@/core/schema/EnchantmentProps";
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

export type VersionedAnalysers = {
    [Q in keyof Analysers]: {
        compiler: Compiler<Analysers[Q]["voxel"], Analysers[Q]["minecraft"]>;
        parser: Parser<Analysers[Q]["voxel"], Analysers[Q]["minecraft"]>;
    };
};

export const analyserCollection: VersionedAnalysers = {
    enchantment: {
        compiler: VoxelToDataDriven,
        parser: DataDrivenToVoxelFormat
    }
};
