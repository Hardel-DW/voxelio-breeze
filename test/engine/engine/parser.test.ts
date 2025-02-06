import { parseDatapack } from "@/core/engine/Parser";
import { filesRecord } from "@test/template/datapack";
import { createZipFile } from "@test/template/datapack";
import { describe, it, beforeEach, expect } from "vitest";

describe("Parser", () => {
    let file: File;

    beforeEach(async () => {
        file = await createZipFile(filesRecord);
    });

    it("should parse a datapack", () => {
        const result = parseDatapack("enchantment", file);
        expect(result).toBeDefined();
    });
});
