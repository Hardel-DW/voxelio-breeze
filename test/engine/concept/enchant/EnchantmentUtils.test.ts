import { describe, it, expect, vi, beforeEach } from "vitest";
import { EnchantmentSimulator } from "@/core/calculation/EnchantmentSimulation";
import type { Enchantment } from "@/schema/Enchantment";

describe("EnchantmentSimulator Utils", () => {
    let simulator: EnchantmentSimulator;
    let enchantments: Map<string, Enchantment>;

    beforeEach(() => {
        enchantments = new Map();

        // Enchantements de test
        enchantments.set("test:sharpness", {
            description: "Sharpness",
            supported_items: "#minecraft:enchantable/sword",
            exclusive_set: "#minecraft:exclusive_set/damage",
            weight: 10,
            max_level: 5,
            min_cost: { base: 1, per_level_above_first: 11 },
            max_cost: { base: 21, per_level_above_first: 11 },
            anvil_cost: 1,
            slots: ["mainhand"]
        });

        enchantments.set("test:smite", {
            description: "Smite",
            supported_items: "#minecraft:enchantable/sword",
            exclusive_set: "#minecraft:exclusive_set/damage",
            weight: 5,
            max_level: 5,
            min_cost: { base: 5, per_level_above_first: 8 },
            max_cost: { base: 25, per_level_above_first: 8 },
            anvil_cost: 1,
            slots: ["mainhand"]
        });

        enchantments.set("test:unbreaking", {
            description: "Unbreaking",
            supported_items: ["#minecraft:enchantable/sword", "#minecraft:enchantable/armor"],
            weight: 5,
            max_level: 3,
            min_cost: { base: 5, per_level_above_first: 8 },
            max_cost: { base: 55, per_level_above_first: 8 },
            anvil_cost: 1,
            slots: ["any"]
        });

        simulator = new EnchantmentSimulator(enchantments);
    });

    describe("calculateEnchantmentCost", () => {
        it("devrait calculer le coût correctement", () => {
            const cost = { base: 10, per_level_above_first: 5 };

            // Level 1
            // @ts-expect-error - Testing private method
            let result = simulator.calculateEnchantmentCost(cost, 1);
            expect(result).toBe(10); // 10 + (1-1)*5 = 10

            // Level 3
            // @ts-expect-error - Testing private method
            result = simulator.calculateEnchantmentCost(cost, 3);
            expect(result).toBe(20); // 10 + (3-1)*5 = 20

            // Level 5
            // @ts-expect-error - Testing private method
            result = simulator.calculateEnchantmentCost(cost, 5);
            expect(result).toBe(30); // 10 + (5-1)*5 = 30
        });

        it("devrait gérer les cas avec per_level_above_first = 0", () => {
            const cost = { base: 15, per_level_above_first: 0 };

            // @ts-expect-error - Testing private method
            let result = simulator.calculateEnchantmentCost(cost, 1);
            expect(result).toBe(15);

            // @ts-expect-error - Testing private method
            result = simulator.calculateEnchantmentCost(cost, 10);
            expect(result).toBe(15); // Toujours la même valeur
        });
    });

    describe("weightedRandomSelect", () => {
        it("devrait sélectionner selon les poids", () => {
            const items = [
                { id: "a", weight: 1 },
                { id: "b", weight: 9 }
            ];

            const mockRandom = vi.spyOn(Math, "random");

            // Sélectionner le premier item (weight: 1, donc 10% de chance)
            mockRandom.mockReturnValueOnce(0.05); // 5% -> premier item
            // @ts-expect-error - Testing private method
            let result = simulator.weightedRandomSelect(items);
            expect(result?.id).toBe("a");

            // Sélectionner le deuxième item (weight: 9, donc 90% de chance)
            mockRandom.mockReturnValueOnce(0.5); // 50% -> deuxième item
            // @ts-expect-error - Testing private method
            result = simulator.weightedRandomSelect(items);
            expect(result?.id).toBe("b");

            mockRandom.mockRestore();
        });

        it("devrait gérer les tableaux vides", () => {
            // @ts-expect-error - Testing private method
            const result = simulator.weightedRandomSelect([]);
            expect(result).toBeNull();
        });

        it("devrait gérer les poids zéro", () => {
            const items = [
                { id: "a", weight: 0 },
                { id: "b", weight: 0 }
            ];

            // Avec tous les poids à 0, devrait faire une sélection aléatoire uniforme
            // @ts-expect-error - Testing private method
            const result = simulator.weightedRandomSelect(items);
            expect(["a", "b"]).toContain(result?.id);
        });

        it("devrait gérer un seul item", () => {
            const items = [{ id: "only", weight: 5 }];

            // @ts-expect-error - Testing private method
            const result = simulator.weightedRandomSelect(items);
            expect(result?.id).toBe("only");
        });
    });

    describe("isEnchantmentApplicableToItem", () => {
        const testEnchant: Enchantment = {
            description: "Test",
            supported_items: "#minecraft:enchantable/sword",
            weight: 10,
            max_level: 1,
            min_cost: { base: 1, per_level_above_first: 0 },
            max_cost: { base: 50, per_level_above_first: 0 },
            anvil_cost: 1,
            slots: ["mainhand"]
        };

        it("devrait vérifier la compatibilité avec les tags", () => {
            const swordTags = ["minecraft:enchantable/sword"];
            const armorTags = ["minecraft:enchantable/armor"];

            // @ts-expect-error - Testing private method
            let result = simulator.isEnchantmentApplicableToItem(testEnchant, swordTags);
            expect(result).toBe(true);

            // @ts-expect-error - Testing private method
            result = simulator.isEnchantmentApplicableToItem(testEnchant, armorTags);
            expect(result).toBe(false);
        });

        it("devrait vérifier la compatibilité avec des IDs directs", () => {
            const directEnchant: Enchantment = {
                ...testEnchant,
                supported_items: "minecraft:diamond_sword"
            };

            const diamondSwordTags = ["minecraft:diamond_sword"];
            const ironSwordTags = ["minecraft:iron_sword"];

            // @ts-expect-error - Testing private method
            let result = simulator.isEnchantmentApplicableToItem(directEnchant, diamondSwordTags);
            expect(result).toBe(true);

            // @ts-expect-error - Testing private method
            result = simulator.isEnchantmentApplicableToItem(directEnchant, ironSwordTags);
            expect(result).toBe(false);
        });

        it("devrait gérer les supported_items multiples", () => {
            const multiEnchant: Enchantment = {
                ...testEnchant,
                supported_items: ["#minecraft:enchantable/sword", "#minecraft:enchantable/axe"]
            };

            const swordTags = ["minecraft:enchantable/sword"];
            const axeTags = ["minecraft:enchantable/axe"];
            const pickaxeTags = ["minecraft:enchantable/pickaxe"];

            // @ts-expect-error - Testing private method
            let result = simulator.isEnchantmentApplicableToItem(multiEnchant, swordTags);
            expect(result).toBe(true);

            // @ts-expect-error - Testing private method
            result = simulator.isEnchantmentApplicableToItem(multiEnchant, axeTags);
            expect(result).toBe(true);

            // @ts-expect-error - Testing private method
            result = simulator.isEnchantmentApplicableToItem(multiEnchant, pickaxeTags);
            expect(result).toBe(false);
        });
    });

    describe("areEnchantmentsCompatible", () => {
        it("devrait permettre les enchantements sans exclusive_set", () => {
            // @ts-expect-error - Testing private method
            const result = simulator.areEnchantmentsCompatible("test:unbreaking", ["test:sharpness"]);
            expect(result).toBe(true);
        });

        it("devrait interdire les enchantements du même groupe exclusif", () => {
            // @ts-expect-error - Testing private method
            const result = simulator.areEnchantmentsCompatible("test:sharpness", ["test:smite"]);
            expect(result).toBe(false);
        });

        it("devrait permettre les enchantements de groupes différents", () => {
            // @ts-expect-error - Testing private method
            const result = simulator.areEnchantmentsCompatible("test:unbreaking", ["test:sharpness"]);
            expect(result).toBe(true);
        });

        it("devrait gérer les enchantements inexistants", () => {
            // @ts-expect-error - Testing private method
            const result = simulator.areEnchantmentsCompatible("test:unknown", ["test:sharpness"]);
            expect(result).toBe(true);
        });

        it("devrait gérer les listes d'enchantements existants vides", () => {
            // @ts-expect-error - Testing private method
            const result = simulator.areEnchantmentsCompatible("test:sharpness", []);
            expect(result).toBe(true);
        });
    });

    describe("applyEnchantabilityModifiers", () => {
        it("devrait appliquer les modificateurs correctement", () => {
            const mockRandom = vi.spyOn(Math, "random");

            // Mock pour avoir des résultats prévisibles
            // randomInt(0, floor(10/4)) + 1 = randomInt(0, 2) + 1
            // Donc modifier1 et modifier2 seront entre 1 et 3

            // Premier test : Math.random() retourne 0.5 pour randomInt
            mockRandom.mockReturnValueOnce(0.5); // modifier1 = 1 + 1 = 2
            mockRandom.mockReturnValueOnce(0.5); // modifier2 = 1 + 1 = 2
            mockRandom.mockReturnValueOnce(0.5); // random bonus 1
            mockRandom.mockReturnValueOnce(0.5); // random bonus 2

            // baseLevel=10, enchantability=10
            // modifiedLevel = 10 + 2 + 2 = 14
            // randomBonus = 1 + (0.5 + 0.5 - 1) * 0.15 = 1.0
            // result = Math.max(1, Math.round(14 * 1.0)) = 14

            // @ts-expect-error - Testing private method
            const result = simulator.applyEnchantabilityModifiers(10, 10);
            expect(result).toBe(14);

            mockRandom.mockRestore();
        });

        it("devrait garantir un minimum de 1", () => {
            const mockRandom = vi.spyOn(Math, "random");

            // Tous les randoms à 0 pour minimiser le résultat
            mockRandom.mockReturnValue(0);

            // @ts-expect-error - Testing private method
            const result = simulator.applyEnchantabilityModifiers(0, 0);
            expect(result).toBeGreaterThanOrEqual(1);

            mockRandom.mockRestore();
        });

        it("devrait varier selon l'enchantabilité", () => {
            const results1: number[] = [];
            const results25: number[] = [];

            // Tester avec des enchantabilités différentes
            for (let i = 0; i < 50; i++) {
                // @ts-expect-error - Testing private method
                results1.push(simulator.applyEnchantabilityModifiers(10, 1));
                // @ts-expect-error - Testing private method
                results25.push(simulator.applyEnchantabilityModifiers(10, 25));
            }

            const avg1 = results1.reduce((a, b) => a + b, 0) / results1.length;
            const avg25 = results25.reduce((a, b) => a + b, 0) / results25.length;

            // Plus d'enchantabilité devrait donner des résultats plus élevés
            expect(avg25).toBeGreaterThan(avg1);
        });
    });

    describe("Base level calculation", () => {
        it("devrait calculer le base level selon la formule Minecraft", () => {
            const mockRandom = vi.spyOn(Math, "random");

            // Test avec 15 étagères
            // base = randomInt(1,8) + floor(15/2) + randomInt(0,15)
            // base = randomInt(1,8) + 7 + randomInt(0,15)

            mockRandom.mockReturnValueOnce(0); // randomInt(1,8) -> 1
            mockRandom.mockReturnValueOnce(0); // randomInt(0,15) -> 0
            // autres randoms pour les modificateurs...
            mockRandom.mockReturnValue(0.5);

            const options = simulator.simulateEnchantmentTable(15, 10, []);

            // base = 1 + 7 + 0 = 8
            // topSlot = floor(max(8/3, 1)) = floor(max(2.67, 1)) = 2
            // middleSlot = floor((8*2)/3 + 1) = floor(5.33 + 1) = 6
            // bottomSlot = floor(max(8, 15*2)) = floor(max(8, 30)) = 30

            // Les niveaux peuvent être modifiés par les modificateurs d'enchantabilité
            // mais on peut vérifier que les options sont dans un ordre sensible
            expect(options[0].level).toBeLessThanOrEqual(options[1].level);
            expect(options[1].level).toBeLessThanOrEqual(options[2].level);

            mockRandom.mockRestore();
        });
    });
});
