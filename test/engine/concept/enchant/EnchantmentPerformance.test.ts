import { describe, it, expect, beforeEach } from "vitest";
import { type EnchantmentOption, EnchantmentSimulator, type ItemData } from "@/core/calculation/EnchantmentSimulation";
import type { Enchantment } from "@/schema/Enchantment";
import { enchantment } from "@test/template/concept/enchant/EnchantmentSimulation";
import { tagsEnchantment } from "@test/template/concept/enchant/TagsEnchantment";

describe("EnchantmentSimulator Performance", () => {
    let simulator: EnchantmentSimulator;

    const testItem: ItemData = {
        id: "minecraft:diamond_sword",
        enchantability: 10,
        tags: ["minecraft:enchantable/sword", "minecraft:enchantable/sharp_weapon", "minecraft:enchantable/weapon"]
    };

    beforeEach(() => {
        // Setup avec tous les enchantements vanilla
        const enchantments = new Map<string, Enchantment>();
        for (const [id, ench] of Object.entries(enchantment)) {
            enchantments.set(`minecraft:${id}`, ench);
        }

        const exclusivityTags = Object.entries(tagsEnchantment).map(([id, tag]) => ({
            identifier: {
                namespace: "minecraft",
                registry: "tags/enchantment",
                resource: id
            },
            data: { values: tag.values }
        }));

        simulator = new EnchantmentSimulator(enchantments, exclusivityTags);
    });

    describe("Single simulation performance", () => {
        it("devrait simuler une table d'enchantement rapidement", () => {
            const start = performance.now();

            for (let i = 0; i < 1000; i++) {
                simulator.simulateEnchantmentTable(15, 10, testItem.tags);
            }

            const duration = performance.now() - start;

            // Devrait être très rapide (moins de 100ms pour 1000 simulations)
            expect(duration).toBeLessThan(100);
        });

        it("devrait gérer des enchantabilités élevées sans ralentissement", () => {
            const start = performance.now();

            for (let i = 0; i < 100; i++) {
                simulator.simulateEnchantmentTable(15, 100, testItem.tags);
            }

            const duration = performance.now() - start;

            expect(duration).toBeLessThan(50);
        });
    });

    describe("Probability calculation performance", () => {
        it("devrait calculer les probabilités efficacement", () => {
            const start = performance.now();

            const stats = simulator.calculateEnchantmentProbabilities(15, 10, testItem.tags, 10000);

            const duration = performance.now() - start;

            // 10000 itérations devraient prendre moins de 2 secondes
            expect(duration).toBeLessThan(2000);
            expect(stats.length).toBeGreaterThan(0);
        });

        it("devrait être linéaire avec le nombre d'itérations", () => {
            const iterations = [100, 500, 1000];
            const times: number[] = [];

            for (const iter of iterations) {
                const start = performance.now();
                simulator.calculateEnchantmentProbabilities(15, 10, testItem.tags, iter);
                times.push(performance.now() - start);
            }

            // Le temps devrait grosso modo doubler quand on double les itérations
            const ratio1 = times[1] / times[0]; // 500/100 = 5x
            const ratio2 = times[2] / times[1]; // 1000/500 = 2x

            // Les ratios devraient être proches des attentes (avec une marge)
            expect(ratio1).toBeGreaterThan(3);
            expect(ratio1).toBeLessThan(7);
            expect(ratio2).toBeGreaterThan(1.5);
            expect(ratio2).toBeLessThan(3);
        });
    });

    describe("Memory usage", () => {
        it("ne devrait pas avoir de fuite mémoire", () => {
            // Force garbage collection si disponible
            if (global.gc) {
                global.gc();
            }

            const initialMemory = process.memoryUsage().heapUsed;

            // Faire beaucoup de simulations
            for (let i = 0; i < 5000; i++) {
                simulator.simulateEnchantmentTable(15, 10, testItem.tags);
            }

            if (global.gc) {
                global.gc();
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            // L'augmentation de mémoire devrait être raisonnable (moins de 10MB)
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        });
    });

    describe("Stress tests", () => {
        it("devrait gérer de nombreux enchantements", () => {
            // Créer un simulateur avec beaucoup d'enchantements
            const manyEnchantments = new Map<string, Enchantment>();

            // Ajouter les enchantements vanilla
            for (const [id, ench] of Object.entries(enchantment)) {
                manyEnchantments.set(`minecraft:${id}`, ench);
            }

            // Ajouter des enchantements factices
            for (let i = 0; i < 1000; i++) {
                manyEnchantments.set(`test:enchant_${i}`, {
                    description: `Test Enchant ${i}`,
                    supported_items: "#minecraft:enchantable/sword",
                    weight: Math.floor(Math.random() * 10) + 1,
                    max_level: Math.floor(Math.random() * 5) + 1,
                    min_cost: { base: 1, per_level_above_first: 5 },
                    max_cost: { base: 50, per_level_above_first: 5 },
                    anvil_cost: 1,
                    slots: ["mainhand"]
                });
            }

            const stressSimulator = new EnchantmentSimulator(manyEnchantments);

            const start = performance.now();

            for (let i = 0; i < 100; i++) {
                stressSimulator.simulateEnchantmentTable(15, 10, testItem.tags);
            }

            const duration = performance.now() - start;

            // Même avec 1000+ enchantements, devrait rester rapide
            expect(duration).toBeLessThan(1000);
        });

        it("devrait gérer de nombreux tags sur un item", () => {
            const manyTagsItem: ItemData = {
                id: "test:super_item",
                enchantability: 10,
                tags: []
            };

            // Ajouter beaucoup de tags
            for (let i = 0; i < 100; i++) {
                manyTagsItem.tags.push(`test:tag_${i}`);
            }

            const start = performance.now();

            for (let i = 0; i < 1000; i++) {
                simulator.simulateEnchantmentTable(15, 10, manyTagsItem.tags);
            }

            const duration = performance.now() - start;

            expect(duration).toBeLessThan(200);
        });
    });

    describe("Concurrent simulations", () => {
        it("devrait gérer les simulations parallèles", async () => {
            const promises: Promise<EnchantmentOption[]>[] = [];

            const start = performance.now();

            // Lancer plusieurs simulations en parallèle
            for (let i = 0; i < 10; i++) {
                promises.push(
                    Promise.resolve().then(() => {
                        const results: any[] = [];
                        for (let j = 0; j < 100; j++) {
                            results.push(simulator.simulateEnchantmentTable(15, 10, testItem.tags));
                        }
                        return results;
                    })
                );
            }

            const allResults = await Promise.all(promises);

            const duration = performance.now() - start;

            expect(allResults).toHaveLength(10);
            expect(allResults[0]).toHaveLength(100);
        });
    });
});
