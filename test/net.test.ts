import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRegistry, refreshCache } from "@/net/fetcher";
import type { RegistryKey } from "@/collections/one_twenty_one/name";

describe("Registry Fetcher", () => {
    beforeEach(() => {
        // Mock the fetch function
        global.fetch = vi.fn().mockImplementation((url: string) => {
            if (url.includes("mcmeta")) {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            rule_test: [
                                "always_true",
                                "block_match",
                                "blockstate_match",
                                "random_block_match",
                                "random_blockstate_match",
                                "tag_match"
                            ]
                        }),
                    clone: () => ({
                        json: () =>
                            Promise.resolve({
                                rule_test: [
                                    "always_true",
                                    "block_match",
                                    "blockstate_match",
                                    "random_block_match",
                                    "random_blockstate_match",
                                    "tag_match"
                                ]
                            })
                    })
                });
            }
            return Promise.reject(new Error("Not found"));
        });

        // Mock the caches API
        global.caches = {
            open: vi.fn().mockResolvedValue({
                match: vi.fn().mockResolvedValue(null),
                put: vi.fn().mockResolvedValue(undefined),
                delete: vi.fn().mockResolvedValue(undefined)
            })
        } as any;
    });

    it("should fetch existing registry", async () => {
        const registry = await getRegistry("rule_test" as RegistryKey);
        expect(Array.isArray(registry)).toBe(true);
        expect(registry.length > 0).toBe(true);
        expect(registry.includes("always_true")).toBe(true);
        expect(registry.includes("block_match")).toBe(true);
        expect(registry.includes("blockstate_match")).toBe(true);
        expect(registry.includes("random_block_match")).toBe(true);
        expect(registry.includes("random_blockstate_match")).toBe(true);
        expect(registry.includes("tag_match")).toBe(true);
    });

    it("should throw for non-existent registry", async () => {
        await expect(getRegistry("non_existent_registry")).rejects.toThrow("Registry 'non_existent_registry' not found");
    });

    it("should use cache for subsequent calls", async () => {
        const firstCall = await getRegistry("rule_test");
        const secondCall = await getRegistry("rule_test");
        expect(firstCall).toEqual(secondCall);
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("should refresh cache when requested", async () => {
        const beforeRefresh = await getRegistry("rule_test");
        await refreshCache();
        const afterRefresh = await getRegistry("rule_test");
        expect(beforeRefresh).toEqual(afterRefresh);
    });
});
