import { Datapack } from "@/core/Datapack";
import { DatapackError } from "@/core/DatapackError";
import type { ConfiguratorConfigFromDatapack, DataDrivenElement, VoxelElement, VoxelRegistryElement } from "@/core/Element";
import type { DataDrivenRegistryElement } from "@/core/Element";
import { Identifier } from "@/core/Identifier";
import type { Analysers, GetAnalyserMinecraft, GetAnalyserVoxel } from "@/core/engine/Analyser";
import { analyserCollection, conceptWithTag } from "@/core/engine/Analyser";
import { Logger } from "@/core/engine/migrations/logger";
export interface ParserParams<K extends DataDrivenElement> {
    element: DataDrivenRegistryElement<K>;
    tags?: string[];
    configurator?: ConfiguratorConfigFromDatapack;
}

export type Parser<T extends VoxelElement, K extends DataDrivenElement> = (params: ParserParams<K>) => T;

export interface ParseDatapackResult<T extends VoxelElement> {
    name: string;
    files: Record<string, Uint8Array>;
    elements: Map<string, T>;
    version: number;
    isModded: boolean;
    logger: Logger;
}

/**
 * Parses a datapack and returns the elements.
 */
export async function parseDatapack<T extends keyof Analysers>(file: File): Promise<ParseDatapackResult<GetAnalyserVoxel<T>>> {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const date = new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const datapack = await Datapack.parse(file);
    const namespaces = datapack.getNamespaces();
    const version = datapack.getPackFormat();
    const description = datapack.getDescription();
    const isModded = datapack.isModded();
    const name = datapack.getFileName();
    const logs = datapack.getVoxelLogs();
    const files = datapack.getFiles();

    const elements = new Map<string, GetAnalyserVoxel<T>>();
    for (const [key, value] of conceptWithTag.entries()) {
        const { parser } = analyserCollection[key];
        const mainRegistry = datapack.getRegistry<GetAnalyserMinecraft<T>>(key);
        mainRegistry.map((element) => {
            const configurator = datapack.readFile<ConfiguratorConfigFromDatapack>(element.identifier, "voxel");
            const tags = value ? datapack.getRelatedTags(`tags/${key}`, element.identifier) : [];

            elements.set(new Identifier(element.identifier).toUniqueKey(), parser({ element, tags, configurator }));
        });
    }

    if (elements.size === 0) throw new DatapackError("tools.warning.no_elements");
    const logger = logs
        ? new Logger(JSON.parse(new TextDecoder().decode(logs)))
        : new Logger({ id, date, version, isModded, datapack: { name, description, namespaces }, isMinified: true, logs: [] });

    return { name, files, elements, version, isModded, logger };
}
