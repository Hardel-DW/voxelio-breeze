import { describe, it, expect } from "vitest";
import { CollectionRegistry } from "@/collections/registry";
import { initCollections } from "@/collections/one_twenty_one/base";
import { getList } from "@/collections/utils";

describe("Predefined Collections", () => {
    const registry = CollectionRegistry.getInstance();
    initCollections(registry);

    it("should have valid keybind collection", () => {
        const keybinds = getList("keybind");
        expect(keybinds.includes("key.jump")).toBe(true);
        expect(keybinds.includes("key.inventory")).toBe(true);
        expect(keybinds.includes("key.forward")).toBe(true);
    });

    it("should have valid equipment_slot collection", () => {
        const slots = getList("equipment_slot");
        expect(slots.length).toBe(7);
        expect(slots.includes("mainhand")).toBe(true);
        expect(slots.includes("offhand")).toBe(true);
        expect(slots.includes("head")).toBe(true);
    });

    it("should have valid gamemode collection", () => {
        const gamemodes = getList("gamemode");
        expect(gamemodes.length).toBe(4);
        expect(gamemodes).toEqual(["survival", "creative", "adventure", "spectator"]);
    });

    it("should have valid direction collection", () => {
        const directions = getList("direction");
        expect(directions.length).toBe(6);
        expect(directions).toEqual(["down", "up", "north", "east", "south", "west"]);
    });

    it("should have valid dye_color collection", () => {
        const colors = getList("dye_color");
        expect(colors.length).toBe(16);
        expect(colors.includes("white")).toBe(true);
        expect(colors.includes("black")).toBe(true);
        expect(colors.includes("red")).toBe(true);
    });

    it("should have valid rarity collection", () => {
        const rarities = getList("rarity");
        expect(rarities.length).toBe(4);
        expect(rarities).toEqual(["common", "uncommon", "rare", "epic"]);
    });

    it("should have valid map_feature collection", () => {
        const features = getList("map_feature");
        expect(features.includes("village")).toBe(true);
        expect(features.includes("fortress")).toBe(true);
        expect(features.includes("monument")).toBe(true);
    });

    it("should have valid use_animation collection", () => {
        const animations = getList("use_animation");
        expect(animations.includes("eat")).toBe(true);
        expect(animations.includes("drink")).toBe(true);
        expect(animations.includes("block")).toBe(true);
    });

    it("should have valid slot_range collection", () => {
        const slotRanges = getList("slot_range");
        expect(slotRanges.includes("contents")).toBe(true);
        expect(slotRanges.includes("hotbar.0")).toBe(true);
        expect(slotRanges.includes("inventory.26")).toBe(true);
        expect(slotRanges.includes("armor.head")).toBe(true);
    });

    it("should have valid mob_category collection", () => {
        const categories = getList("mob_category");
        expect(categories.includes("monster")).toBe(true);
        expect(categories.includes("creature")).toBe(true);
        expect(categories.includes("ambient")).toBe(true);
        expect(categories.length).toBe(8);
    });
});
