import { downloadZip, type InputWithMeta } from "@voxelio/zip";
import type { DataDrivenRegistryElement, DataDrivenElement } from "@/core/Element";

export async function createZipFile(filesRecord: Record<string, Uint8Array>): Promise<File> {
    const files: InputWithMeta[] = Object.entries(filesRecord).map(([path, content]) => ({ name: path, input: new File([content], path) }));
    const zipContent = downloadZip(files);
    return new File([await zipContent.arrayBuffer()], "datapack.zip");
}

// We want to make fonction to do this automatically au dessus
export function prepareFiles(filesRecord: Record<string, Record<string, unknown>>, packVersion = 61) {
    const files: Record<string, Uint8Array> = {};

    // Add pack.mcmeta based on version
    const packData = packVersion === -1 ? { pack: {} } : { pack: { pack_format: packVersion, description: "lorem ipsum" } };
    files["pack.mcmeta"] = new TextEncoder().encode(JSON.stringify(packData, null, 2));

    // Add all other files
    for (const [path, content] of Object.entries(filesRecord)) {
        files[path] = new TextEncoder().encode(JSON.stringify(content, null, 2));
    }

    return files;
}

export function createFilesFromElements(
    elements: DataDrivenRegistryElement<DataDrivenElement>[],
    packVersion = 61
): Record<string, Uint8Array> {
    const files: Record<string, Uint8Array> = {};

    const packData = packVersion === -1 ? { pack: {} } : { pack: { pack_format: packVersion, description: "lorem ipsum" } };
    files["pack.mcmeta"] = new TextEncoder().encode(JSON.stringify(packData, null, 2));

    for (const element of elements) {
        const { namespace, registry, resource } = element.identifier;
        const filePath = `data/${namespace}/${registry}/${resource}.json`;
        files[filePath] = new TextEncoder().encode(JSON.stringify(element.data, null, 2));
    }

    return files;
}
