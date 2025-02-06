import Datapack from "../Datapack.ts";
import type { ConfiguratorConfigFromDatapack, DataDrivenElement, VoxelElement } from "../Element.ts";
import type { DataDrivenRegistryElement } from "../Element.ts";
import { sortVoxelElements } from "../Element.ts";
import type { Analysers, GetAnalyserMinecraft, GetAnalyserVoxel } from "./Analyser.ts";
import { getAnalyserForVersion } from "./Analyser.ts";
import { calculateInitialToggle } from "./managers/InitialToggle.ts";
import { Logger } from "./migrations/logger.ts";
import { DatapackError } from "../errors/DatapackError.ts";
import type { ToolConfiguration } from "../schema/primitive/index.ts";
import type { ToggleSectionMap } from "../schema/primitive/toggle.ts";
import { Identifier } from "../Identifier.ts";
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
    toggleSection: ToggleSectionMap;
    currentElementId: string;
    isModded: boolean;
    config: ToolConfiguration;
    logger: Logger;
}

/**
 * Parses a datapack and returns the elements.
 */
export async function parseDatapack<T extends keyof Analysers>(tool: T, file: File): Promise<ParseDatapackResult<GetAnalyserVoxel<T>>> {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const date = new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());

    const datapack = await Datapack.parse(file);
    const namespaces = datapack.getNamespaces();
    const version = datapack.getPackFormat();
    const description = datapack.getDescription();
    const isModded = datapack.isModded();
    const name = datapack.getFileName();
    const logs = datapack.getVoxelLogs();
    const files = datapack.getFiles();

    const { analyser, config } = getAnalyserForVersion(tool, version);
    const toggleSection = calculateInitialToggle(config.interface);

    const mainRegistry = datapack.getRegistry<GetAnalyserMinecraft<T>>(config.analyser);
    const compiled = mainRegistry.map((element) => {
        const configurator = datapack.readFile<ConfiguratorConfigFromDatapack>(element.identifier, "voxel");
        const tags = datapack.getRelatedTags(`tags/${config.analyser}`, element.identifier);

        return {
            identifier: new Identifier(element.identifier).toUniqueKey(),
            data: analyser.parser({ element, tags, configurator })
        };
    });

    if (compiled.length === 0) throw new DatapackError("tools.warning.no_elements");
    const elements = new Map(compiled.map((element) => [element.identifier, element.data]));
    const currentElementId = sortVoxelElements(elements)[0];
    const logger = logs
        ? new Logger(JSON.parse(new TextDecoder().decode(logs)))
        : new Logger({
              id,
              date,
              version,
              isModded,
              datapack: { name, description, namespaces },
              isMinified: true,
              logs: []
          });

    return {
        name,
        files,
        elements,
        version,
        toggleSection,
        currentElementId,
        isModded,
        config,
        logger
    };
}
