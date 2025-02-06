import { Identifier } from "@/core/Identifier";
import { enchantplusTags, vanillaTags } from "test/template/tags";
import { DATA_DRIVEN_TEMPLATE_ENCHANTMENT } from "test/template/datadriven";
import JSZip from "jszip";
import { voxelDatapacks } from "@/voxel/VoxelDatapack";

const enchantmentFiles = DATA_DRIVEN_TEMPLATE_ENCHANTMENT.reduce(
    (files, enchant) => {
        const filePath = new Identifier(enchant.identifier).toFilePath();
        files[filePath] = new TextEncoder().encode(JSON.stringify(enchant.data, null, 2));
        return files;
    },
    {} as Record<string, Uint8Array>
);

// Generate tag files from all sources
const tagFiles = [...voxelDatapacks, ...enchantplusTags, ...vanillaTags].reduce(
    (files, tag) => {
        const filePath = new Identifier(tag.identifier).toFilePath();
        files[filePath] = new TextEncoder().encode(JSON.stringify(tag.data, null, 2));
        return files;
    },
    {} as Record<string, Uint8Array>
);

// Create mock files
export const filesRecord = {
    "pack.mcmeta": new TextEncoder().encode(JSON.stringify({ pack: { pack_format: 61, description: "lorem ipsum" } }, null, 2)),
    ...enchantmentFiles,
    ...tagFiles
};

export const filesRecordWithInvalidPackMcmeta = {
    ...filesRecord,
    "pack.mcmeta": new TextEncoder().encode(JSON.stringify({ pack: {} }, null, 2))
};

export const filesRecordWithoutPackMcmeta = {
    ...enchantmentFiles,
    ...tagFiles
};

export async function createZipFile(filesRecord: Record<string, Uint8Array>): Promise<File> {
    const zip = new JSZip();

    for (const [path, content] of Object.entries(filesRecord)) {
        zip.file(path, content);
    }

    const zipContent = await zip.generateAsync({ type: "uint8array" });
    return new File([zipContent], "datapack.zip");
}
