import type { Compiler } from "@/core/engine/Compiler";
import type { Parser } from "@/core/engine/Parser";
import { EnchantmentDataDrivenToVoxelFormat, type EnchantmentProps, VoxelToEnchantmentDataDriven } from "@/core/schema/EnchantmentProps";
import type { Enchantment } from "@/schema/enchantment/Enchantment";
import type { LootTableProps, MinecraftLootTable } from "../schema/loot/types";
import { VoxelToLootDataDriven } from "../schema/loot/Compiler";
import { LootDataDrivenToVoxelFormat } from "../schema/loot/Parser";
export type GetAnalyserVoxel<T extends keyof Analysers> = Analysers[T]["voxel"];
export type GetAnalyserMinecraft<T extends keyof Analysers> = Analysers[T]["minecraft"];

export type Analysers = {
    enchantment: {
        voxel: EnchantmentProps;
        minecraft: Enchantment;
    };
    loot_table: {
        voxel: LootTableProps;
        minecraft: MinecraftLootTable;
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
        compiler: VoxelToEnchantmentDataDriven,
        parser: EnchantmentDataDrivenToVoxelFormat,
        hasTag: true
    },
    loot_table: {
        compiler: VoxelToLootDataDriven,
        parser: LootDataDrivenToVoxelFormat,
        hasTag: true
    }
};

export const conceptWithTag = new Map<keyof Analysers, boolean>(
    Object.entries(analyserCollection).map(([key, analyser]) => [key as keyof Analysers, analyser.hasTag])
);

/**
 * Get all concepts as a Map for iteration
 */
export function getAllConcepts(): Map<keyof Analysers, Analyser<keyof Analysers>> {
    return new Map(Object.entries(analyserCollection) as Array<[keyof Analysers, Analyser<keyof Analysers>]>);
}
