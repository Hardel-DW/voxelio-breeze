import { assertEquals, assertRejects } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { getRegistry, refreshCache } from "../package/net/fetcher.ts";
import type { RegistryKey } from "../package/collections/one_twenty_one/name.ts";

describe("Registry Fetcher", () => {
  it("should fetch existing registry", async () => {
    const registry = await getRegistry("rule_test" as RegistryKey);
    assertEquals(Array.isArray(registry), true);
    assertEquals(registry.length > 0, true);
    assertEquals(registry.includes("always_true"), true);
    assertEquals(registry.includes("block_match"), true);
    assertEquals(registry.includes("blockstate_match"), true);
    assertEquals(registry.includes("random_block_match"), true);
    assertEquals(registry.includes("random_blockstate_match"), true);
    assertEquals(registry.includes("tag_match"), true);
  });

  it("should throw for non-existent registry", async () => {
    await assertRejects(
      () => getRegistry("non_existent_registry"),
      Error,
      "Registry 'non_existent_registry' not found",
    );
  });

  it("should use cache for subsequent calls", async () => {
    const firstCall = await getRegistry("rule_test");
    const secondCall = await getRegistry("rule_test");
    assertEquals(firstCall, secondCall);
  });

  it("should refresh cache when requested", async () => {
    const beforeRefresh = await getRegistry("rule_test");
    await refreshCache();
    const afterRefresh = await getRegistry("rule_test");
    assertEquals(beforeRefresh, afterRefresh);
  });
});
