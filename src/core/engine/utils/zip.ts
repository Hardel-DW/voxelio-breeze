export async function parseZip(zipData: Uint8Array): Promise<Record<string, Uint8Array>> {
    const JSZip = (await import("jszip")).default;
    const zip = await new JSZip().loadAsync(zipData);
    const files: Record<string, Uint8Array> = {};

    await Promise.all(
        Object.keys(zip.files).map(async (path) => {
            if (!zip.files[path].dir) {
                files[path] = new Uint8Array(await zip.files[path].async("arraybuffer"));
            }
        })
    );

    return files;
}
