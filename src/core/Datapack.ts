import { DatapackError } from "@/core/DatapackError";
import type { DataDrivenElement, DataDrivenRegistryElement, LabeledElement } from "@/core/Element";
import { Identifier, type IdentifierObject } from "@/core/Identifier";
import { createTagFromElement, isPresentInTag, mergeDataDrivenRegistryElement } from "@/core/Tag";
import { getMinecraftVersion } from "@/core/Version";
import type { Analysers, GetAnalyserMinecraft } from "@/core/engine/Analyser";
import type { Compiler } from "@/core/engine/Compiler";
import type { Logger } from "@/core/engine/migrations/logger";
import type { TagType } from "@/schema/tag/TagType";
import { downloadZip, extractZip } from "@voxelio/zip";
import type { InputWithoutMeta } from "@voxelio/zip";

export interface PackMcmeta {
    pack: {
        pack_format: number;
        description: string;
    };
}

export class Datapack {
    private fileName: string;
    private pack: PackMcmeta;
    private files: Record<string, Uint8Array<ArrayBufferLike>>;

    constructor(files: Record<string, Uint8Array<ArrayBufferLike>>, fileName?: string) {
        this.files = files;
        this.fileName = fileName ?? "Datapack";
        const packMcmeta = files["pack.mcmeta"];
        if (!packMcmeta) throw new DatapackError("tools.error.failed_to_get_pack_mcmeta");

        const pack = JSON.parse(new TextDecoder().decode(packMcmeta));
        if (!pack.pack.pack_format) throw new DatapackError("tools.error.failed_to_get_pack_format");
        this.pack = pack;
    }

    static async parse(file: File) {
        return new Datapack(await extractZip(new Uint8Array(await file.arrayBuffer())), file.name);
    }

    /**
     * Get the namespaces of the datapack. (From Data)
     * @returns The namespaces of the datapack.
     */
    getNamespaces() {
        return Object.keys(this.files)
            .filter((path) => path.startsWith("data/"))
            .map((path) => path.split("/")[1])
            .filter((namespace, index, self) => namespace && self.indexOf(namespace) === index);
    }

    /**
     * Check if the datapack is modded.
     * @returns Whether the datapack is modded.
     */
    isModded() {
        return this.fileName.endsWith(".jar");
    }

    /**
     * Get the pack format of the datapack. Or throw an error if it's not found.
     * @returns The pack format of the datapack.
     */
    getPackFormat() {
        if (!this.pack.pack.pack_format) throw new DatapackError("tools.error.failed_to_get_pack_format");
        return this.pack.pack.pack_format;
    }

    /**
     * Get the formatted version of the datapack.
     * @returns The version of the datapack.
     * @example
     * getVersion() // "1.21.1"
     */
    getVersion() {
        return getMinecraftVersion(this.getPackFormat());
    }

    /**
     * Get the description of the datapack. If no description is found, the fallback will be used, and if no fallback is provided, an error will be thrown.
     * @param fallback - The fallback description.
     * @returns The description of the datapack.
     */
    getDescription(fallback = "Unknown") {
        if (!fallback && !this.pack.pack.description) throw new DatapackError("tools.error.failed_to_get_datapack_description");
        return this.pack.pack.description || fallback;
    }

    /**
     * Processes a datapack name by handling versioning and file extensions
     * @example
     * datapackName("test.zip") // Returns "V0-test"
     * datapackName("V1-test") // Returns "V2-test"
     */
    getFileName(): string {
        const nameWithoutExtension = this.fileName.replace(/\.(zip|jar)$/, "");
        const versionMatch = nameWithoutExtension.match(/^V(\d+)-/);
        if (!versionMatch?.[1]) return `V0-${nameWithoutExtension}`;

        const currentVersion = +versionMatch[1];
        const newVersion = currentVersion + 1;
        return nameWithoutExtension.replace(/^V\d+-/, `V${newVersion}-`);
    }

    /**
     * Get the voxel logs of the datapack. from the logs.json file.
     * @returns The voxel logs of the datapack.
     */
    getVoxelLogs() {
        return this.files?.["voxel/logs.json"];
    }

    /**
     * Get the files of the datapack.
     * @returns The files of the datapack.
     */
    getFiles() {
        return this.files;
    }

    /**
     * For an element, get all the tags where the identifier appears.
     * @param registry - The registry of the tags.
     * @param identifier - The identifier of the tags.
     * @returns The related tags of the identifier.
     */
    getRelatedTags(registry: string | undefined, identifier: IdentifierObject): string[] {
        if (!registry) return [];
        return this.getRegistry<TagType>(registry)
            .filter((tag) => isPresentInTag(tag, new Identifier(identifier).toString()))
            .map((tag) => new Identifier(tag.identifier).toString());
    }

    /**
     * Get the registry of the datapack. Find all jsons for a registry.
     * @param registry - The registry of the datapack.
     * @returns The registry of the datapack.
     * @example
     * getRegistry("enchantment") // Returns all the enchantments of the datapack like Fire Aspect, Looting, etc.
     */
    getRegistry<T extends DataDrivenElement>(registry: string | undefined): DataDrivenRegistryElement<T>[] {
        const registries: DataDrivenRegistryElement<T>[] = [];
        if (!registry) return registries;

        for (const file of Object.keys(this.files)) {
            const fileParts = file.split("/");
            if (!file.endsWith(".json")) continue;
            if (fileParts.length < 3) continue;
            if (fileParts[0] !== "data") continue;

            const namespace = fileParts[1];
            const compressedPath = file.split("/").slice(2).join("/").replace(".json", "");

            if (!compressedPath.startsWith(`${registry}/`) && compressedPath !== registry) continue;

            const resource = compressedPath.slice(registry.length + 1);
            if (!resource || !namespace || !registry) continue;

            registries.push({
                identifier: { namespace, registry, resource },
                data: JSON.parse(new TextDecoder().decode(this.files[file]))
            });
        }

        return registries;
    }

    /**
     * Get the values of the tags of an element.
     * @param identifier - The identifier of the Tags element.
     * @param blacklist - The blacklist of values to exclude.
     * @returns The values of the tags of the element.
     */
    getTag(identifier: IdentifierObject, blacklist: string[] = []): TagType {
        const tags = this.readFile<TagType>(identifier);
        if (!tags) return { values: [] };

        return {
            values: tags.values.filter((value) => !blacklist.includes(typeof value === "string" ? value : value.id))
        };
    }

    /**
     * Find for each identifier all corresponding tags in the datapack, (excluding the blacklist).
     * @param identifier - The identifier of the Tags element.
     * @param blacklist - The blacklist of values to exclude.
     * @returns The values of the tags of the element.
     */
    getTags(identifier: IdentifierObject[], blacklist: string[] = []): DataDrivenRegistryElement<TagType>[] {
        return identifier.map((id) => ({ identifier: id, data: this.getTag(id, blacklist) }));
    }

    /**
     * Get the compiled tags of the elements.
     * @param elements - The elements to compile.
     * @returns The compiled tags.
     */
    getCompiledTags(elements: ReturnType<Compiler>[], concept: keyof Analysers): DataDrivenRegistryElement<TagType>[] {
        const registryElements: DataDrivenRegistryElement<TagType>[] = createTagFromElement(elements);
        const blacklist = elements.map((e) => new Identifier(e.element.identifier).toString());
        const ogTags = this.getRegistry<TagType>(`tags/${concept}`).map((e) => e.identifier);
        const originalTags = this.getTags(ogTags, blacklist);
        return mergeDataDrivenRegistryElement(originalTags, registryElements);
    }

    /**
     * Read a file from the datapack.
     * @param identifier - The identifier of the file.
     * @param basePath - The base path of the file.
     * @returns The file.
     */
    readFile<T>(identifier: IdentifierObject, basePath = "data"): T | undefined {
        const file = new Identifier(identifier).toFilePath(basePath);
        if (!(file in this.files)) return undefined;
        return JSON.parse(new TextDecoder().decode(this.files[file]));
    }

    /**
     * Determine if the element is new, updated or deleted.
     * If the ones that were there at the beginning are no longer there, I'll delete them.
     * If it wasn't in the initial list but is new, I create it.
     * If it was there at the beginning and is still there at the end, just keep it.
     * if it wasn't there at the beginning and isn't there at the end, I do nothing.
     * @param concept - The concept of the elements.
     * @param hasTag - Whether the element has a tag.
     * @param elements - The elements of the datapack.
     * @returns The elements of the datapack.
     */
    labelElements<T extends keyof Analysers>(
        concept: keyof Analysers,
        hasTag: boolean,
        elements: DataDrivenRegistryElement<DataDrivenElement>[]
    ): LabeledElement[] {
        const mainRegistry = this.getRegistry<GetAnalyserMinecraft<T>>(concept);
        const tagsRegistry = hasTag ? this.getRegistry<TagType>(`tags/${concept}`) : [];
        const originalElements = [...mainRegistry, ...tagsRegistry];

        const originalIdentifiers = originalElements.map((element) => element.identifier);
        const result: LabeledElement[] = [];
        const processedIds = new Set<string>();

        for (const original of originalIdentifiers) {
            const element = elements.find((el) => new Identifier(el.identifier).equalsObject(original));
            if (!element) {
                result.push({ type: "deleted", identifier: original });
            } else {
                result.push({ type: "updated", element });
                processedIds.add(new Identifier(element.identifier).toString());
            }
        }

        for (const element of elements) {
            if (!processedIds.has(new Identifier(element.identifier).toString())) {
                result.push({ type: "new", element });
            }
        }

        return result;
    }

    /**
     * Generate a new datapack.
     * @param content - The content of the datapack.
     * @param params - The parameters of the datapack.
     * @returns The new datapack.
     */
    generate(
        content: LabeledElement[],
        params: { isMinified: boolean; logger?: Logger; include?: DataDrivenRegistryElement<DataDrivenElement>[] }
    ) {
        const { isMinified, logger, include = [] } = params;

        const files: InputWithoutMeta[] = [];
        this.prepareExistingFiles(files, content);
        this.prepareIncludedFiles(files, include, isMinified);
        this.prepareContentFiles(files, content, isMinified);
        this.prepareLogger(files, logger, isMinified);

        return downloadZip(files);
    }

    /**
     * Prepare a JSON file structure for adding to the zip
     * @param path - The path of the file.
     * @param data - The data of the file.
     * @param isMinified - Whether the file is minified.
     */
    private prepareFile(path: string, data: object | string | Uint8Array<ArrayBufferLike>, isMinified: boolean): InputWithoutMeta {
        const input =
            data instanceof Uint8Array
                ? data
                : new TextEncoder().encode(typeof data === "string" ? data : JSON.stringify(data, null, isMinified ? 0 : 4));

        return {
            name: path,
            input: new ReadableStream({
                start(controller) {
                    controller.enqueue(input);
                    controller.close();
                }
            })
        };
    }

    /**
     * Prepare the existing files for the zip. Files marked as deleted will be skipped.
     * @param files - The array to add files to
     * @param content - The content of the datapack.
     */
    private prepareExistingFiles(files: InputWithoutMeta[], content: LabeledElement[]) {
        const filesToDelete = new Set(
            content.filter((file) => file.type === "deleted").map((file) => new Identifier(file.identifier).toFilePath())
        );

        for (const [path, data] of Object.entries(this.files)) {
            if (!filesToDelete.has(path)) {
                files.push(this.prepareFile(path, data, false));
            }
        }
    }

    /**
     * Prepare the included files for the zip. E.G Voxel Datapacks. No operation is made on the files.
     * @param files - The array to add files to
     * @param include - The included files.
     * @param isMinified - Whether the file is minified.
     */
    private prepareIncludedFiles(files: InputWithoutMeta[], include: DataDrivenRegistryElement<DataDrivenElement>[], isMinified: boolean) {
        for (const file of include) {
            files.push(this.prepareFile(new Identifier(file.identifier).toFilePath(), file.data, isMinified));
        }
    }

    /**
     * Process files, deleted tags will continue to exist but will be empty, and other files will be deleted, the rest will be added as is.
     * @param files - The array to add files to
     * @param content - The content of the datapack.
     * @param isMinified - Whether the file is minified.
     */
    private prepareContentFiles(files: InputWithoutMeta[], content: LabeledElement[], isMinified: boolean) {
        for (const file of content) {
            if (file.type === "deleted" && file.identifier.registry.startsWith("tags")) {
                files.push(this.prepareFile(new Identifier(file.identifier).toFilePath(), { values: [] }, isMinified));
                continue;
            }

            if (file.type === "deleted") continue;
            files.push(this.prepareFile(new Identifier(file.element.identifier).toFilePath(), file.element.data, isMinified));
        }
    }

    /**
     * Prepare the logs files for the zip.
     * @param files - The array to add files to
     * @param logger - The logger.
     * @param isMinified - Whether the file is minified.
     */
    private prepareLogger(files: InputWithoutMeta[], logger: Logger | undefined, isMinified: boolean) {
        if (logger) {
            const logData = logger.serialize(isMinified);
            files.push(this.prepareFile("voxel/logs.json", logData, isMinified));
        }
    }
}
