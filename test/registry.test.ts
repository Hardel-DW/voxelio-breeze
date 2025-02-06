import { describe, it, expect } from "vitest";
import { CollectionRegistry } from "@/collections/registry";

describe("Registry", () => {
    it("should register and retrieve collections", () => {
        const registry = CollectionRegistry.getInstance();
        const collection = ["test1", "test2"];

        registry.register("test", collection);
        expect(registry.get("test")).toEqual(collection);
    });

    it("should throw when getting non-existent collection", () => {
        const registry = CollectionRegistry.getInstance();

        expect(() => {
            const result = registry.get("nonexistent");
            if (!result) throw new Error("Collection 'nonexistent' not found");
        }).toThrow("Collection 'nonexistent' not found");
    });

    it("should be a singleton", () => {
        const registry1 = CollectionRegistry.getInstance();
        const registry2 = CollectionRegistry.getInstance();
        expect(registry1).toEqual(registry2);
    });

    it("should check if collection exists", () => {
        const registry = CollectionRegistry.getInstance();
        const collection = ["test1", "test2"];

        registry.register("exists", collection);
        expect(registry.has("exists")).toBe(true);
        expect(registry.has("does_not_exist")).toBe(false);
    });

    it("should handle multiple collections", () => {
        const registry = CollectionRegistry.getInstance();
        const collection1 = ["test1", "test2"];
        const collection2 = ["other1", "other2"];

        registry.register("first", collection1);
        registry.register("second", collection2);

        expect(registry.get("first")).toEqual(collection1);
        expect(registry.get("second")).toEqual(collection2);
    });

    it("should override existing collection", () => {
        const registry = CollectionRegistry.getInstance();
        const collection1 = ["initial1", "initial2"];
        const collection2 = ["updated1", "updated2"];

        registry.register("test", collection1);
        registry.register("test", collection2);

        expect(registry.get("test")).toEqual(collection2);
    });
});
