import type { ChangeSet } from "./types";
import { deepDiff, normalizeValue } from "./differ";

export class Logger {
    private changes: ChangeSet[] = [];

    constructor(jsonData?: string) {
        if (jsonData) {
            this.importJson(jsonData);
        }
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
    sync<T extends Record<string, unknown>>(beforeState: T, afterState: T, elementId?: string, elementType?: string): void {
        const before = normalizeValue(beforeState) as Record<string, unknown>;
        const after = normalizeValue(afterState) as Record<string, unknown>;
        this.addDiff(before, after, afterState, elementId, elementType);
    }

    /**
     * Exports all changes as JSON
     */
    exportJson(): string {
        return JSON.stringify(
            {
                voxel_studio_log: {
                    version: "1.0.0",
                    generated_at: new Date().toISOString(),
                    changes: this.changes
                }
            },
            null,
            2
        );
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
     * Internal method to add differences
     */
    private addDiff(
        before: Record<string, unknown>,
        after: Record<string, unknown>,
        element: Record<string, unknown>,
        elementId?: string,
        elementType?: string
    ): void {
        const differences = deepDiff(before, after);

        if (differences.length > 0) {
            this.changes.push({
                element_id: elementId || this.extractElementId(element),
                element_type: elementType || this.extractElementType(element),
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

        const identifier = element.identifier as Record<string, unknown> | undefined;
        if (identifier?.namespace && identifier?.resource) {
            return `${identifier.namespace}:${identifier.resource}`;
        }

        return undefined;
    }

    /**
     * Extracts element type from common patterns
     */
    private extractElementType(element: Record<string, unknown>): string | undefined {
        if (typeof element.type === "string") return element.type;
        if (typeof element._type === "string") return element._type;

        const identifier = element.identifier as Record<string, unknown> | undefined;
        if (typeof identifier?.registry === "string") {
            return identifier.registry;
        }

        return undefined;
    }

    /**
     * Imports changes from JSON
     */
    private importJson(json: string): void {
        try {
            const data = JSON.parse(json);
            const changes = data.voxel_studio_log?.changes || data.changes || data;
            this.changes = Array.isArray(changes) ? changes : [];
        } catch (error) {
            throw new Error(`Failed to import changes: ${error}`);
        }
    }
}
