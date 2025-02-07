import { describe, expect, it } from "vitest";
import Datapack from "@/core/Datapack";

describe("Registry System", () => {
    const mockFiles = {
        "pack.mcmeta": new TextEncoder().encode(JSON.stringify({ pack: { pack_format: 61, description: "lorem ipsum" } })),
        "data/enchantplus/enchantment/armor/fury.json": new TextEncoder().encode(JSON.stringify({ foo: "bar" })),
        "data/minecraft/enchantment/attack_speed.json": new TextEncoder().encode(JSON.stringify({ foo: "bar" })),
        "data/minecraft/enchantment_provider/villager.json": new TextEncoder().encode(JSON.stringify({ foo: "bar" })),
        "data/enchantplus/tags/enchantment/armor.json": new TextEncoder().encode(JSON.stringify({ values: ["enchantplus:fury"] })),
        "data/minecraft/tags/enchantment/weapon.json": new TextEncoder().encode(JSON.stringify({ values: ["minecraft:attack_speed"] }))
    };

    it("should return all registries", () => {
        const datapack = new Datapack(mockFiles);
        const registries = datapack.getRegistry("enchantment");
        expect(registries).toHaveLength(2);
    });

    it("should return all registries with the correct identifier", () => {
        const datapack = new Datapack(mockFiles);
        const registries = datapack.getRegistry("tags/enchantment");
        expect(registries).toHaveLength(2);
        expect(registries[0].identifier).toEqual({ namespace: "enchantplus", registry: "tags/enchantment", resource: "armor" });
        expect(registries[1].identifier).toEqual({ namespace: "minecraft", registry: "tags/enchantment", resource: "weapon" });
    });
});
