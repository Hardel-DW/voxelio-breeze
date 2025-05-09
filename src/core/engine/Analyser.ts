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

export interface Analyser<T extends keyof Analysers> {
    compiler: Compiler<Analysers[T]["voxel"], Analysers[T]["minecraft"]>;
    parser: Parser<Analysers[T]["voxel"], Analysers[T]["minecraft"]>;
    hasTag: boolean;
}

export type VersionedAnalysers = {
    [Q in keyof Analysers]: Analyser<Q>;
};

export const analyserCollection: VersionedAnalysers = {
    enchantment: {
        compiler: VoxelToDataDriven,
        parser: DataDrivenToVoxelFormat,
        hasTag: true
    }
};

export const conceptWithTag = new Map<keyof Analysers, boolean>(
    Object.entries(analyserCollection).map(([key, analyser]) => [key as keyof Analysers, analyser.hasTag])
);
