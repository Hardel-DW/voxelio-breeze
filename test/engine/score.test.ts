import { describe, expect, it } from "vitest";
import { searchRelevantElements } from "@/core/engine/utils/searchElements";
import { Identifier } from "@/core/Identifier";
import { VOXEL_TEMPLATE_ENCHANTMENT } from "@test/template/concept/enchant/VoxelDriven";

describe("searchRelevantElements", () => {
    it("Get fury enchantment with common prompt", () => {
        const results = searchRelevantElements(
            VOXEL_TEMPLATE_ENCHANTMENT.map((element) => element.data),
            "Hello, i want get the fury enchantment"
        );
        expect(results.length).toBeGreaterThan(0);
        expect(results.map((element) => new Identifier(element.identifier).toString())).toContain("enchantplus:armor/fury");
    });

    it("Get accuracy shot enchantment with common prompt", () => {
        const results = searchRelevantElements(
            VOXEL_TEMPLATE_ENCHANTMENT.map((element) => element.data),
            "I want modify the accuracy shot enchantment and set the max level to 2"
        );
        expect(results.length).toBeGreaterThan(0);
        expect(results.map((element) => new Identifier(element.identifier).toString())).toContain("enchantplus:bow/accuracy_shot");
    });

    it("Get fury enchantment with common prompt in french", () => {
        const results = searchRelevantElements(
            VOXEL_TEMPLATE_ENCHANTMENT.map((element) => element.data),
            "Bonjour, je voudrais obtenir l'enchantement fury"
        );
        expect(results.length).toBeGreaterThan(0);
        expect(results.map((element) => new Identifier(element.identifier).toString())).toContain("enchantplus:armor/fury");
    });

    it("Get accuracy shot enchantment with common prompt in french", () => {
        const results = searchRelevantElements(
            VOXEL_TEMPLATE_ENCHANTMENT.map((element) => element.data),
            "Je veux modifier l'enchantement accuracy shot et mettre le niveau maximum à 2"
        );
        expect(results.length).toBeGreaterThan(0);
        expect(results.map((element) => new Identifier(element.identifier).toString())).toContain("enchantplus:bow/accuracy_shot");
    });

    it("Get accuracy shot enchantment with common prompt in french", () => {
        const results = searchRelevantElements(
            VOXEL_TEMPLATE_ENCHANTMENT.map((element) => element.data),
            "Je veux modifier l'enchantement accuracy shot et mettre le niveau maximum à 2"
        );
        expect(results.length).toBeGreaterThan(0);
        expect(results.map((element) => new Identifier(element.identifier).toString())).toContain("enchantplus:bow/accuracy_shot");
    });

    it("Another test for search element in french", () => {
        const results = searchRelevantElements(
            VOXEL_TEMPLATE_ENCHANTMENT.map((element) => element.data),
            "Met l'enchantment fury au niveau 2"
        );
        expect(results.length).toBeGreaterThan(0);
        expect(
            results.map((element) => new Identifier(element.identifier).toString()),
            `The result should contain the fury enchantment, actually it contains: ${results.map((element) => new Identifier(element.identifier).toString())}`
        ).toContain("enchantplus:armor/fury");
    });

    it("Get multiple element by search terms", () => {
        const results = searchRelevantElements(
            VOXEL_TEMPLATE_ENCHANTMENT.map((element) => element.data),
            "I want get the storm arrow enchantment and the lifeplus enchantment"
        );
        expect(results.map((element) => new Identifier(element.identifier).toString())).toEqual(
            expect.arrayContaining(["enchantplus:bow/storm_arrow", "enchantplus:armor/lifeplus"])
        );
    });
});
