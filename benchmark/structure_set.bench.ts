import { bench, describe } from "vitest";
import { StructureSetDataDrivenToVoxelFormat } from "@/core/schema/structure_set/Parser";
import { VoxelToStructureSetDataDriven } from "@/core/schema/structure_set/Compiler";
import {
    villageStructureSet,
    strongholdStructureSet,
    ruinedPortalStructureSet,
    endCityStructureSet
} from "@test/template/concept/structure_set/DataDriven";

describe("StructureSet Benchmark", () => {
    bench("parse village structure set (random spread)", () => {
        StructureSetDataDrivenToVoxelFormat({
            element: villageStructureSet,
            tags: []
        });
    });

    bench("parse stronghold structure set (concentric rings)", () => {
        StructureSetDataDrivenToVoxelFormat({
            element: strongholdStructureSet,
            tags: []
        });
    });

    bench("parse ruined portal structure set (complex with 7 structures)", () => {
        StructureSetDataDrivenToVoxelFormat({
            element: ruinedPortalStructureSet,
            tags: []
        });
    });

    bench("parse end city structure set (with exclusion zone)", () => {
        StructureSetDataDrivenToVoxelFormat({
            element: endCityStructureSet,
            tags: []
        });
    });

    const villageVoxel = StructureSetDataDrivenToVoxelFormat({
        element: villageStructureSet,
        tags: []
    });

    const strongholdVoxel = StructureSetDataDrivenToVoxelFormat({
        element: strongholdStructureSet,
        tags: []
    });

    const ruinedPortalVoxel = StructureSetDataDrivenToVoxelFormat({
        element: ruinedPortalStructureSet,
        tags: []
    });

    const endCityVoxel = StructureSetDataDrivenToVoxelFormat({
        element: endCityStructureSet,
        tags: []
    });

    bench("compile village structure set", () => {
        VoxelToStructureSetDataDriven(villageVoxel, "worldgen/structure_set");
    });

    bench("compile stronghold structure set", () => {
        VoxelToStructureSetDataDriven(strongholdVoxel, "worldgen/structure_set");
    });

    bench("compile ruined portal structure set", () => {
        VoxelToStructureSetDataDriven(ruinedPortalVoxel, "worldgen/structure_set");
    });

    bench("compile end city structure set", () => {
        VoxelToStructureSetDataDriven(endCityVoxel, "worldgen/structure_set");
    });

    bench("round-trip village structure set", () => {
        const voxel = StructureSetDataDrivenToVoxelFormat({
            element: villageStructureSet,
            tags: []
        });

        VoxelToStructureSetDataDriven(voxel, "worldgen/structure_set", villageStructureSet.data);
    });

    bench("round-trip ruined portal structure set (complex)", () => {
        const voxel = StructureSetDataDrivenToVoxelFormat({
            element: ruinedPortalStructureSet,
            tags: []
        });

        VoxelToStructureSetDataDriven(voxel, "worldgen/structure_set", ruinedPortalStructureSet.data);
    });

    const allStructureSets = [villageStructureSet, strongholdStructureSet, ruinedPortalStructureSet, endCityStructureSet];

    bench("parse all structure sets (4 items)", () => {
        for (const structureSet of allStructureSets) {
            StructureSetDataDrivenToVoxelFormat({
                element: structureSet,
                tags: []
            });
        }
    });

    bench("compile all structure sets (4 items)", () => {
        const voxelStructureSets = allStructureSets.map((structureSet) =>
            StructureSetDataDrivenToVoxelFormat({
                element: structureSet,
                tags: []
            })
        );

        for (const voxel of voxelStructureSets) {
            VoxelToStructureSetDataDriven(voxel, "worldgen/structure_set");
        }
    });
});
