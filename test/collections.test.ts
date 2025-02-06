import { assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { CollectionRegistry } from "../package/collections/registry.ts";
import { initCollections } from "../package/collections/one_twenty_one/base.ts";
import { getList } from "../package/index.ts";

describe("Predefined Collections", () => {
  const registry = CollectionRegistry.getInstance();
  initCollections(registry);

  it("should have valid keybind collection", () => {
    const keybinds = getList("keybind");
    assertEquals(keybinds.includes("key.jump"), true);
    assertEquals(keybinds.includes("key.inventory"), true);
    assertEquals(keybinds.includes("key.forward"), true);
  });

  it("should have valid equipment_slot collection", () => {
    const slots = getList("equipment_slot");
    assertEquals(slots.length, 7);
    assertEquals(slots.includes("mainhand"), true);
    assertEquals(slots.includes("offhand"), true);
    assertEquals(slots.includes("head"), true);
  });

  it("should have valid gamemode collection", () => {
    const gamemodes = getList("gamemode");
    assertEquals(gamemodes.length, 4);
    assertEquals(gamemodes, ["survival", "creative", "adventure", "spectator"]);
  });

  it("should have valid direction collection", () => {
    const directions = getList("direction");
    assertEquals(directions.length, 6);
    assertEquals(directions, ["down", "up", "north", "east", "south", "west"]);
  });

  it("should have valid dye_color collection", () => {
    const colors = getList("dye_color");
    assertEquals(colors.length, 16);
    assertEquals(colors.includes("white"), true);
    assertEquals(colors.includes("black"), true);
    assertEquals(colors.includes("red"), true);
  });

  it("should have valid rarity collection", () => {
    const rarities = getList("rarity");
    assertEquals(rarities.length, 4);
    assertEquals(rarities, ["common", "uncommon", "rare", "epic"]);
  });

  it("should have valid map_feature collection", () => {
    const features = getList("map_feature");
    assertEquals(features.includes("village"), true);
    assertEquals(features.includes("fortress"), true);
    assertEquals(features.includes("monument"), true);
  });

  it("should have valid use_animation collection", () => {
    const animations = getList("use_animation");
    assertEquals(animations.includes("eat"), true);
    assertEquals(animations.includes("drink"), true);
    assertEquals(animations.includes("block"), true);
  });

  it("should have valid slot_range collection", () => {
    const slotRanges = getList("slot_range");
    assertEquals(slotRanges.includes("contents"), true);
    assertEquals(slotRanges.includes("hotbar.0"), true);
    assertEquals(slotRanges.includes("inventory.26"), true);
    assertEquals(slotRanges.includes("armor.head"), true);
  });

  it("should have valid mob_category collection", () => {
    const categories = getList("mob_category");
    assertEquals(categories.includes("monster"), true);
    assertEquals(categories.includes("creature"), true);
    assertEquals(categories.includes("ambient"), true);
    assertEquals(categories.length, 8);
  });
});
