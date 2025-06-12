import { deepDiff, normalizeValue } from "./differ";
import type { ChangeSet, DatapackInfo, LogsStructure } from "./types";

export class Logger {
    private changes: ChangeSet[] = [];
    private id: string | undefined;
    private datapackInfo?: DatapackInfo;
    private version?: number;
    private isModded?: boolean;
    private isMinified?: boolean;

    constructor(jsonData?: string) {
        if (jsonData) {
            this.importJson(jsonData);
        }
    }

    /**
     * Set datapack information for export
     */
    setDatapackInfo(info: {
        name: string;
        description?: string;
        namespaces: string[];
        version: number;
        isModded: boolean;
        isMinified?: boolean;
    }): void {
        this.datapackInfo = {
            name: info.name,
            description: info.description,
            namespaces: info.namespaces
        };
        this.version = info.version;
        this.isModded = info.isModded;
        this.isMinified = info.isMinified ?? false;
    }

    /**
     * Tracks changes during a tool operation
     */
    async trackChanges<T extends Record<string, unknown>>(
        element: T,
        operation: (element: T) => Promise<Partial<T> | undefined>
    ): Promise<Partial<T> | undefined> {
        const beforeState = normalizeValue(element) as Record<string, unknown>;
        const result = await operation(element);

        if (result) {
            const afterState = normalizeValue(result) as Record<string, unknown>;
            this.addDiff(beforeState, afterState, element);
        }

        return result;
    }

    /**
     * Syncs changes by comparing two states (for manual changes detection)
     */
    sync<T extends Record<string, unknown>>(beforeState: T, afterState: T, identifier?: string, registry?: string): void {
        const before = normalizeValue(beforeState) as Record<string, unknown>;
        const after = normalizeValue(afterState) as Record<string, unknown>;
        this.addDiff(before, after, afterState, identifier, registry);
    }

    /**
     * Exports all changes as JSON
     */
    exportJson(): string {
        const structure: LogsStructure = {
            id: this.id ?? this.generateId(),
            generated_at: new Date().toISOString(),
            version: this.version ?? 0,
            isModded: this.isModded ?? false,
            engine: 2,
            isMinified: this.isMinified ?? false,
            datapack: this.datapackInfo ?? {
                name: "unknown",
                namespaces: []
            },
            logs: this.changes
        };

        return JSON.stringify(structure, null, 2);
    }

    /**
     * Gets all recorded changes
     */
    getChanges(): ChangeSet[] {
        return [...this.changes];
    }

    /**
     * Clears all recorded changes
     */
    clearChanges(): void {
        this.changes = [];
    }

    /**
     * Generate a random ID
     */
    private generateId(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    /**
     * Internal method to add differences
     */
    private addDiff(
        before: Record<string, unknown>,
        after: Record<string, unknown>,
        element: Record<string, unknown>,
        identifier?: string,
        registry?: string
    ): void {
        const differences = deepDiff(before, after);

        if (differences.length > 0) {
            this.changes.push({
                identifier: identifier || this.extractElementId(element),
                registry: registry || this.extractElementType(element),
                differences,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Extracts element ID from common patterns
     */
    private extractElementId(element: Record<string, unknown>): string | undefined {
        if (typeof element.id === "string") return element.id;
        if (typeof element._id === "string") return element._id;

        const elementIdentifier = element.identifier as Record<string, unknown> | undefined;
        if (elementIdentifier?.namespace && elementIdentifier?.resource) {
            return `${elementIdentifier.namespace}:${elementIdentifier.resource}`;
        }

        return undefined;
    }

    /**
     * Extracts element type from common patterns
     */
    private extractElementType(element: Record<string, unknown>): string | undefined {
        if (typeof element.type === "string") return element.type;
        if (typeof element._type === "string") return element._type;

        const elementIdentifier = element.identifier as Record<string, unknown> | undefined;
        if (typeof elementIdentifier?.registry === "string") {
            return elementIdentifier.registry;
        }

        return undefined;
    }

    /**
     * Imports changes from JSON
     */
    private importJson(json: string): void {
        try {
            const data = JSON.parse(json);

            if (data.logs && Array.isArray(data.logs)) {
                this.changes = data.logs;
                this.id = data.id;
                this.datapackInfo = data.datapack;
                this.version = data.version;
                this.isModded = data.isModded;
                this.isMinified = data.isMinified;
            }
        } catch (error) {
            throw new Error(`Failed to import changes: ${error}`);
        }
    }
}
