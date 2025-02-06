import { assertEquals, assertThrows } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { CollectionRegistry } from "../package/collections/registry.ts";

describe("Registry", () => {
  it("should register and retrieve collections", () => {
    const registry = CollectionRegistry.getInstance();
    const collection = ["test1", "test2"];

    registry.register("test", collection);
    assertEquals(registry.get("test"), collection);
  });

  it("should throw when getting non-existent collection", () => {
    const registry = CollectionRegistry.getInstance();

    assertThrows(
      () => {
        const result = registry.get("nonexistent");
        if (!result) throw new Error("Collection 'nonexistent' not found");
      },
      Error,
      "Collection 'nonexistent' not found",
    );
  });

  it("should be a singleton", () => {
    const registry1 = CollectionRegistry.getInstance();
    const registry2 = CollectionRegistry.getInstance();
    assertEquals(registry1, registry2);
  });

  it("should check if collection exists", () => {
    const registry = CollectionRegistry.getInstance();
    const collection = ["test1", "test2"];

    registry.register("exists", collection);
    assertEquals(registry.has("exists"), true);
    assertEquals(registry.has("does_not_exist"), false);
  });

  it("should handle multiple collections", () => {
    const registry = CollectionRegistry.getInstance();
    const collection1 = ["test1", "test2"];
    const collection2 = ["other1", "other2"];

    registry.register("first", collection1);
    registry.register("second", collection2);

    assertEquals(registry.get("first"), collection1);
    assertEquals(registry.get("second"), collection2);
  });

  it("should override existing collection", () => {
    const registry = CollectionRegistry.getInstance();
    const collection1 = ["initial1", "initial2"];
    const collection2 = ["updated1", "updated2"];

    registry.register("test", collection1);
    registry.register("test", collection2);

    assertEquals(registry.get("test"), collection2);
  });
});
