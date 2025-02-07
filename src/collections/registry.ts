/**
 * Class allowing to manage collections of strings
 */
export class CollectionRegistry {
    private static instance: CollectionRegistry;

    private collections: Map<string, string[]>;

    private constructor() {
        this.collections = new Map();
    }

    public static getInstance(): CollectionRegistry {
        if (!CollectionRegistry.instance) {
            CollectionRegistry.instance = new CollectionRegistry();
        }
        return CollectionRegistry.instance;
    }

    /**
     * Registers a new collection
     * @param name The name of the collection
     * @param values The values to store
     */
    register(name: string, values: string[]): void {
        this.collections.set(name, values);
    }

    /**
     * Retrieves a collection by its name
     * @param name The name of the collection
     * @returns The collection or undefined if it does not exist
     */
    get(name: string): string[] | undefined {
        return this.collections.get(name);
    }

    /**
     * Checks if a collection exists
     * @param name The name of the collection
     * @returns true if the collection exists, false otherwise
     */
    has(name: string): boolean {
        return this.collections.has(name);
    }
}
