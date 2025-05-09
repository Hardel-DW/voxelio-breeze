import { compileDatapack } from "@/core/engine/Compiler";
import { filesRecord } from "@test/template/datapack";
import { describe, expect, it } from "vitest";
import { VOXEL_ELEMENTS } from "@test/template/datadriven";

describe("Compiler", () => {
    describe("compileDatapack", () => {
        it("should compile elements correctly", () => {
            const result = compileDatapack({
                elements: VOXEL_ELEMENTS,
                files: filesRecord
            });

            expect(Array.isArray(result)).toBe(true);
        });
    });
});
