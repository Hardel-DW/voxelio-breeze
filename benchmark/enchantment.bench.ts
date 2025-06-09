import { bench, describe } from "vitest";
import { analyserCollection } from "@/core/engine/Analyser";
import type { Enchantment } from "@/schema/Enchantment";
import type { DataDrivenRegistryElement } from "@/core/Element";
import { DATA_DRIVEN_TEMPLATE_ENCHANTMENT, makeAdvancedEnchantment } from "@test/template/concept/enchant/DataDriven";
import { VOXEL_TEMPLATE_ENCHANTMENT } from "@test/template/concept/enchant/VoxelDriven";

describe("Enchantment Performance", () => {
    const { parser, compiler } = analyserCollection.enchantment;

    const simpleDataDriven = DATA_DRIVEN_TEMPLATE_ENCHANTMENT[0];
    const complexDataDriven = DATA_DRIVEN_TEMPLATE_ENCHANTMENT[4]; // death_touch with complex effects
    const attributeDataDriven = DATA_DRIVEN_TEMPLATE_ENCHANTMENT[1]; // agility with attributes

    const simpleVoxel = VOXEL_TEMPLATE_ENCHANTMENT[0].data;
    const onlyCreativeVoxel = VOXEL_TEMPLATE_ENCHANTMENT[1].data;
    const softDeleteVoxel = VOXEL_TEMPLATE_ENCHANTMENT[2].data;

    const createLargeEnchantmentSet = (count: number): DataDrivenRegistryElement<Enchantment>[] => {
        return Array.from({ length: count }, (_, i) =>
            makeAdvancedEnchantment({
                identifier: { namespace: "test", registry: "enchantment", resource: `stress_test_${i}` },
                description: {
                    translate: `enchantment.test.stress_${i}`,
                    fallback: `Stress Test ${i}`
                },
                supportedItems: `#test:enchantable/type_${i % 10}`,
                exclusiveSet: i % 5 === 0 ? `#test:exclusive_set/group_${i % 3}` : undefined,
                slots: [["mainhand", "offhand", "head", "chest", "legs", "feet"][i % 6]] as any,
                weight: Math.floor(Math.random() * 10) + 1,
                maxLevel: Math.floor(Math.random() * 5) + 1,
                tags: Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, j) => `#test:tag_${j}`),
                effects: {
                    [`minecraft:effect_${i % 10}`]: [
                        {
                            effect: {
                                type: "minecraft:add",
                                value: Math.floor(Math.random() * 10) + 1
                            }
                        }
                    ]
                }
            })
        );
    };

    const createComplexEffectsEnchantment = (): DataDrivenRegistryElement<Enchantment> => {
        return makeAdvancedEnchantment({
            identifier: { namespace: "test", registry: "enchantment", resource: "complex_effects" },
            description: {
                translate: "enchantment.test.complex",
                fallback: "Complex Effects"
            },
            effects: {
                "minecraft:damage": Array.from({ length: 5 }, (_, i) => ({
                    effect: {
                        type: "minecraft:add",
                        value: i + 1
                    },
                    requirements: {
                        condition: "minecraft:random_chance",
                        chance: 0.1 * (i + 1)
                    }
                })),
                "minecraft:post_attack": Array.from({ length: 3 }, (_, i) => ({
                    enchanted: "attacker",
                    affected: "victim",
                    effect: {
                        type: "minecraft:apply_mob_effect",
                        to_apply: `minecraft:effect_${i}`,
                        min_duration: 1 + i,
                        max_duration: 5 + i,
                        min_amplifier: i,
                        max_amplifier: i + 2
                    }
                })),
                "minecraft:attributes": Array.from({ length: 4 }, (_, i) => ({
                    id: `minecraft:enchantment.complex_${i}`,
                    attribute: `minecraft:attribute_${i}`,
                    amount: {
                        type: "minecraft:linear",
                        base: 0.1 * (i + 1),
                        per_level_above_first: 0.05 * (i + 1)
                    },
                    operation: ["add_value", "add_multiplied_base", "add_multiplied_total"][i % 3]
                }))
            }
        });
    };

    const largeEnchantmentSet = createLargeEnchantmentSet(100);
    const complexEffectsEnchantment = createComplexEffectsEnchantment();

    describe("Parsing Performance", () => {
        bench("Parse simple enchantment", () => {
            parser({ element: simpleDataDriven });
        });

        bench("Parse complex enchantment with effects", () => {
            parser({ element: complexDataDriven });
        });

        bench("Parse enchantment with attributes", () => {
            parser({ element: attributeDataDriven });
        });

        bench("Parse enchantment with complex nested effects", () => {
            parser({ element: complexEffectsEnchantment });
        });

        bench("Parse 50 enchantments", () => {
            for (let i = 0; i < 50; i++) {
                parser({ element: largeEnchantmentSet[i] });
            }
        });

        bench("Parse 100 enchantments", () => {
            for (const enchantment of largeEnchantmentSet) {
                parser({ element: enchantment });
            }
        });
    });

    describe("Compilation Performance", () => {
        bench("Compile simple enchantment", () => {
            compiler(simpleVoxel, "enchantment");
        });

        bench("Compile only_creative enchantment", () => {
            compiler(onlyCreativeVoxel, "enchantment");
        });

        bench("Compile soft_delete enchantment", () => {
            compiler(softDeleteVoxel, "enchantment");
        });

        bench("Compile with original data", () => {
            compiler(simpleVoxel, "enchantment", simpleDataDriven.data);
        });

        bench("Compile 50 enchantments", () => {
            for (let i = 0; i < 50; i++) {
                const voxel = parser({ element: largeEnchantmentSet[i] });
                compiler(voxel, "enchantment");
            }
        });

        bench("Compile 100 enchantments", () => {
            for (const enchantment of largeEnchantmentSet) {
                const voxel = parser({ element: enchantment });
                compiler(voxel, "enchantment");
            }
        });
    });

    describe("Round-trip Performance", () => {
        bench("Round-trip simple enchantment", () => {
            const voxel = parser({ element: simpleDataDriven });
            compiler(voxel, "enchantment", simpleDataDriven.data);
        });

        bench("Round-trip complex enchantment", () => {
            const voxel = parser({ element: complexDataDriven });
            compiler(voxel, "enchantment", complexDataDriven.data);
        });

        bench("Round-trip complex effects enchantment", () => {
            const voxel = parser({ element: complexEffectsEnchantment });
            compiler(voxel, "enchantment", complexEffectsEnchantment.data);
        });

        bench("Round-trip 25 enchantments", () => {
            for (let i = 0; i < 25; i++) {
                const enchantment = largeEnchantmentSet[i];
                const voxel = parser({ element: enchantment });
                compiler(voxel, "enchantment", enchantment.data);
            }
        });

        bench("Round-trip 50 enchantments", () => {
            for (let i = 0; i < 50; i++) {
                const enchantment = largeEnchantmentSet[i];
                const voxel = parser({ element: enchantment });
                compiler(voxel, "enchantment", enchantment.data);
            }
        });
    });

    describe("Mode Detection Performance", () => {
        const softDeleteEnchantment = makeAdvancedEnchantment({
            tags: [],
            exclusiveSet: undefined,
            effects: {}
        });

        const onlyCreativeEnchantment = makeAdvancedEnchantment({
            tags: ["minecraft:curse", "minecraft:double_trade_price", "minecraft:prevents_bee_spawns_when_mining"],
            effects: {
                "minecraft:damage": [
                    {
                        effect: {
                            type: "minecraft:add",
                            value: 5
                        }
                    }
                ]
            }
        });

        bench("Detect soft_delete mode", () => {
            parser({ element: softDeleteEnchantment });
        });

        bench("Detect only_creative mode", () => {
            parser({ element: onlyCreativeEnchantment });
        });

        bench("Detect normal mode", () => {
            parser({ element: simpleDataDriven });
        });

        bench("Mode detection for 100 mixed enchantments", () => {
            for (let i = 0; i < 100; i++) {
                const mode = i % 3;
                const enchantment = mode === 0 ? softDeleteEnchantment : mode === 1 ? onlyCreativeEnchantment : simpleDataDriven;
                parser({ element: enchantment });
            }
        });
    });

    describe("Tag Processing Performance", () => {
        const manyTagsEnchantment = makeAdvancedEnchantment({
            tags: Array.from({ length: 20 }, (_, i) => `#test:tag_${i}`),
            exclusiveSet: "#test:exclusive_set/large",
            effects: {
                "minecraft:damage": [{ effect: { type: "minecraft:add", value: 1 } }]
            }
        });

        bench("Process enchantment with many tags", () => {
            const voxel = parser({ element: manyTagsEnchantment });
            compiler(voxel, "enchantment", manyTagsEnchantment.data);
        });

        bench("Process 50 enchantments with many tags", () => {
            for (let i = 0; i < 50; i++) {
                const voxel = parser({ element: manyTagsEnchantment });
                compiler(voxel, "enchantment", manyTagsEnchantment.data);
            }
        });
    });

    describe("Effects Processing Performance", () => {
        const manyEffectsEnchantment = makeAdvancedEnchantment({
            effects: Object.fromEntries(
                Array.from({ length: 10 }, (_, i) => [
                    `minecraft:effect_${i}`,
                    Array.from({ length: 3 }, (_, j) => ({
                        effect: {
                            type: "minecraft:add",
                            value: i + j + 1
                        },
                        requirements: {
                            condition: "minecraft:random_chance",
                            chance: 0.1 * (j + 1)
                        }
                    }))
                ])
            )
        });

        bench("Process enchantment with many effects", () => {
            const voxel = parser({ element: manyEffectsEnchantment });
            compiler(voxel, "enchantment", manyEffectsEnchantment.data);
        });

        bench("Process 25 enchantments with many effects", () => {
            for (let i = 0; i < 25; i++) {
                const voxel = parser({ element: manyEffectsEnchantment });
                compiler(voxel, "enchantment", manyEffectsEnchantment.data);
            }
        });
    });

    describe("Memory Usage Simulation", () => {
        bench("Parse 500 simple enchantments", () => {
            for (let i = 0; i < 500; i++) {
                parser({ element: simpleDataDriven });
            }
        });

        bench("Parse 200 complex enchantments", () => {
            for (let i = 0; i < 200; i++) {
                parser({ element: complexEffectsEnchantment });
            }
        });

        bench("Compile 500 simple enchantments", () => {
            for (let i = 0; i < 500; i++) {
                compiler(simpleVoxel, "enchantment");
            }
        });

        bench("Round-trip 100 complex enchantments", () => {
            for (let i = 0; i < 100; i++) {
                const voxel = parser({ element: complexEffectsEnchantment });
                compiler(voxel, "enchantment", complexEffectsEnchantment.data);
            }
        });
    });
});
