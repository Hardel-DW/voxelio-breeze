import { bench, describe } from "vitest";
import { village, mineshaft } from "../test/template/concept/structure/DataDriven";
import { StructureDataDrivenToVoxelFormat } from "@/core/schema/structure/Parser";
import { VoxelToStructureDataDriven } from "@/core/schema/structure/Compiler";

describe("Structure benchmark", () => {
    bench("Structure DataDriven to Voxel format: village", () => {
        StructureDataDrivenToVoxelFormat({ element: village });
    });

    bench("Structure Voxel to DataDriven format: village", () => {
        const voxelStructure = StructureDataDrivenToVoxelFormat({ element: village });
        VoxelToStructureDataDriven(voxelStructure, "worldgen/structure", village.data);
    });

    bench("Structure DataDriven to Voxel format: mineshaft", () => {
        StructureDataDrivenToVoxelFormat({ element: mineshaft });
    });

    bench("Structure Voxel to DataDriven format: mineshaft", () => {
        const voxelStructure = StructureDataDrivenToVoxelFormat({ element: mineshaft });
        VoxelToStructureDataDriven(voxelStructure, "worldgen/structure", mineshaft.data);
    });

    bench("Structure DataDriven to Voxel format: both structures", () => {
        const voxelStructure = StructureDataDrivenToVoxelFormat({ element: village });
        VoxelToStructureDataDriven(voxelStructure, "worldgen/structure", village.data);
    });
});
