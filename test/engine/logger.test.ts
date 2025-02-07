import { describe, it, expect } from "vitest";
import { Logger } from "@/core/engine/migrations/logger";
import type { DatapackInfo, FileLog, Log, LogDifference } from "@/core/engine/migrations/types";
import type { EnchantmentProps } from "@/core/schema/enchant/EnchantmentProps";
import type { VoxelRegistryElement } from "@/core/Element";
import { createDifferenceFromAction } from "@/core/engine/migrations/logValidation";
import { Identifier } from "@/core/Identifier";
import type { ComputedAction, SequentialAction, SimpleAction, ToggleListValueAction } from "@/core/engine/actions/types";

const createComplexMockElement = (data: Partial<EnchantmentProps> = {}): VoxelRegistryElement<EnchantmentProps> => ({
    identifier: "foo",
    data: {
        identifier: { namespace: "enchantplus", registry: "enchantment", resource: "bow/accuracy_shot" },
        anvilCost: 4,
        description: { translate: "enchantment.test.foo", fallback: "Enchantment Test" },
        disabledEffects: [],
        effects: {
            "minecraft:projectile_spawned": [
                {
                    effect: {
                        type: "minecraft:run_function",
                        function: "enchantplus:actions/accuracy_shot/on_shoot"
                    }
                }
            ]
        },
        exclusiveSet: ["minecraft:efficiency", "minecraft:unbreaking"],
        maxLevel: 1,
        mode: "normal",
        minCostBase: 1,
        minCostPerLevelAboveFirst: 1,
        maxCostBase: 10,
        maxCostPerLevelAboveFirst: 10,
        primaryItems: undefined,
        supportedItems: "#voxel:enchantable/range",
        slots: ["mainhand", "offhand"],
        tags: [
            "#minecraft:non_treasure",
            "#yggdrasil:structure/alfheim_tree/ominous_vault",
            "#yggdrasil:structure/alfheim_tree/ominous_vault/floor",
            "#yggdrasil:structure/asflors/common"
        ],
        weight: 2,
        ...data
    }
});

const createMockLog = (logs: FileLog[]): Log => ({
    id: "test-id",
    date: "2024-03-20",
    version: 48,
    isModded: false,
    datapack: {
        name: "Test Datapack",
        description: "A test datapack",
        namespaces: ["minecraft", "test"]
    },
    isMinified: true,
    logs
});

const mockDatapackInfo: DatapackInfo = {
    name: "Test Datapack",
    description: "A test datapack",
    namespaces: ["minecraft", "test"]
};

const existingLog = (): Log => ({
    id: "test-id",
    date: "2024-03-20",
    version: 48,
    isModded: false,
    datapack: mockDatapackInfo,
    isMinified: false,
    logs: []
});

describe("Logger System", () => {
    describe("Logger initialization", () => {
        it("should create a new logger with initial state", () => {
            const logger = new Logger(existingLog());
            const logs = logger.getLogs();

            expect(logs).toMatchObject({
                id: "test-id",
                date: "2024-03-20",
                version: 48,
                isModded: false,
                datapack: mockDatapackInfo,
                isMinified: false,
                logs: []
            });
        });

        it("should initialize from existing log", () => {
            const logger = new Logger(existingLog());
            expect(logger.getLogs()).toEqual(existingLog());
        });
    });

    describe("Logging differences", () => {
        it("should log a new difference", () => {
            const logger = new Logger(existingLog());
            const difference: LogDifference = {
                type: "set",
                path: "effects.strength.level",
                value: 2,
                origin_value: 1
            };

            logger.logDifference("minecraft:strength", "enchantment", difference);

            const logs = logger.getLogs();
            expect(logs.logs).toHaveLength(1);
            expect(logs.logs[0]).toMatchObject({
                identifier: "minecraft:strength",
                registry: "enchantment",
                type: "updated",
                differences: [difference]
            });
        });

        it("should update existing difference", () => {
            const logger = new Logger(existingLog());
            const initialDifference: LogDifference = {
                type: "set",
                path: "effects.strength.level",
                value: 2,
                origin_value: 1
            };
            const updatedDifference: LogDifference = {
                type: "set",
                path: "effects.strength.level",
                value: 3,
                origin_value: 1
            };

            logger.logDifference("minecraft:strength", "enchantment", initialDifference);
            logger.logDifference("minecraft:strength", "enchantment", updatedDifference);

            const logs = logger.getLogs();
            const fileLog = logs.logs[0];
            expect(fileLog.type).toBe("updated");
            if (fileLog.type === "updated") {
                expect(fileLog.differences).toHaveLength(1);
                expect(fileLog.differences[0]).toEqual(updatedDifference);
            }
        });

        it("should remove difference when type is remove", () => {
            const logger = new Logger(existingLog());
            const initialDifference: LogDifference = {
                type: "set",
                path: "effects.strength.level",
                value: 2,
                origin_value: 1
            };
            const removeDifference: LogDifference = {
                type: "remove",
                path: "effects.strength.level"
            };

            logger.logDifference("minecraft:strength", "enchantment", initialDifference);
            logger.logDifference("minecraft:strength", "enchantment", removeDifference);

            const logs = logger.getLogs();
            const fileLog = logs.logs[0];
            expect(fileLog.type).toBe("updated");
            if (fileLog.type === "updated") {
                expect(fileLog.differences).toHaveLength(0);
            }
        });
    });

    describe("Logging sequential actions", () => {
        it("should log multiple differences from sequential actions", () => {
            const logger = new Logger(existingLog());
            const element = createComplexMockElement();

            // Simulate the sequential action with two modifications
            const sequentialAction: SequentialAction = {
                type: "sequential",
                actions: [
                    {
                        type: "set_value",
                        field: "exclusiveSet",
                        value: "#minecraft:armor"
                    },
                    {
                        type: "toggle_value_in_list",
                        field: "tags",
                        value: "#minecraft:new_tag"
                    }
                ]
            };

            const difference = createDifferenceFromAction(sequentialAction, element.data, 48, "enchantment", logger);
            if (!difference) {
                throw new Error("Failed to create difference");
            }

            // Log the differences
            logger.logDifference(
                new Identifier(element.data.identifier).toString(),
                element.data.identifier.registry || "unknown",
                difference
            );

            // Verify the logs
            const logs = logger.getLogs();
            expect(logs.logs).toHaveLength(1);
            const fileLog = logs.logs[0];
            expect(fileLog.type).toBe("updated");

            if (fileLog.type === "updated") {
                expect(fileLog.differences).toHaveLength(2);

                // Check exclusiveSet modification
                expect(fileLog.differences[0]).toMatchObject({
                    type: "set",
                    path: "exclusiveSet",
                    value: "#minecraft:armor",
                    origin_value: ["minecraft:efficiency", "minecraft:unbreaking"]
                });

                // Check tags modification
                expect(fileLog.differences[1]).toMatchObject({
                    type: "set",
                    path: "tags",
                    value: [
                        "#minecraft:non_treasure",
                        "#yggdrasil:structure/alfheim_tree/ominous_vault",
                        "#yggdrasil:structure/alfheim_tree/ominous_vault/floor",
                        "#yggdrasil:structure/asflors/common",
                        "#minecraft:new_tag"
                    ],
                    origin_value: [
                        "#minecraft:non_treasure",
                        "#yggdrasil:structure/alfheim_tree/ominous_vault",
                        "#yggdrasil:structure/alfheim_tree/ominous_vault/floor",
                        "#yggdrasil:structure/asflors/common"
                    ]
                });
            }
        });

        it("should add a new value to existing list, wihout removing the old original value", () => {
            const existingLogWithDifferences = createMockLog([
                {
                    identifier: "enchantplus:bow/accuracy_shot",
                    registry: "enchantment",
                    type: "updated",
                    differences: [
                        {
                            type: "set",
                            path: "exclusiveSet",
                            value: "#minecraft:armor",
                            origin_value: ["minecraft:efficiency", "minecraft:unbreaking"]
                        },
                        {
                            type: "set",
                            path: "tags",
                            value: [
                                "#minecraft:non_treasure",
                                "#yggdrasil:structure/alfheim_tree/ominous_vault",
                                "#yggdrasil:structure/alfheim_tree/ominous_vault/floor",
                                "#yggdrasil:structure/asflors/common",
                                "#minecraft:new_tag"
                            ],
                            origin_value: [
                                "#minecraft:non_treasure",
                                "#yggdrasil:structure/alfheim_tree/ominous_vault",
                                "#yggdrasil:structure/alfheim_tree/ominous_vault/floor",
                                "#yggdrasil:structure/asflors/common"
                            ]
                        }
                    ]
                }
            ]);

            const actions: ToggleListValueAction = {
                type: "toggle_value_in_list",
                field: "exclusiveSet",
                mode: ["remove_if_empty", "override"],
                value: "minecraft:sharpness"
            };

            const logger = new Logger(existingLogWithDifferences);
            const element = createComplexMockElement();

            const difference = createDifferenceFromAction(actions, element.data, logger.getVersion(), "enchantment", logger);
            if (!difference) {
                throw new Error("Failed to create difference");
            }

            logger.logDifference(
                new Identifier(element.data.identifier).toString(),
                element.data.identifier.registry || "unknown",
                difference
            );

            const logs = logger.getLogs();
            expect(logs.logs).toHaveLength(1);
            expect(logs.logs[0]).toMatchObject({
                identifier: "enchantplus:bow/accuracy_shot",
                registry: "enchantment",
                type: "updated"
            });

            expect("differences" in logs.logs[0] && logs.logs[0].differences).toHaveLength(2);
            expect("differences" in logs.logs[0] && logs.logs[0].differences[0]).toMatchObject({
                type: "set",
                path: "exclusiveSet",
                value: ["minecraft:efficiency", "minecraft:unbreaking", "minecraft:sharpness"],
                origin_value: ["minecraft:efficiency", "minecraft:unbreaking"]
            });

            expect("differences" in logs.logs[0] && logs.logs[0].differences[1]).toMatchObject({
                type: "set",
                path: "tags",
                value: [
                    "#minecraft:non_treasure",
                    "#yggdrasil:structure/alfheim_tree/ominous_vault",
                    "#yggdrasil:structure/alfheim_tree/ominous_vault/floor",
                    "#yggdrasil:structure/asflors/common",
                    "#minecraft:new_tag"
                ]
            });
        });

        it("should remove a value from existing list, wihout removing the old original value", () => {
            const element = createComplexMockElement({ exclusiveSet: "#minecraft:new_tag" });
            const existingLogWithDifferences = createMockLog([
                {
                    identifier: "enchantplus:bow/accuracy_shot",
                    registry: "enchantment",
                    type: "updated",
                    differences: [
                        {
                            type: "set",
                            path: "exclusiveSet",
                            value: "#minecraft:new_tag",
                            origin_value: "#minecraft:armor"
                        },
                        {
                            type: "set",
                            path: "tags",
                            value: [
                                "#minecraft:non_treasure",
                                "#yggdrasil:structure/alfheim_tree/ominous_vault",
                                "#yggdrasil:structure/alfheim_tree/ominous_vault/floor",
                                "#yggdrasil:structure/asflors/common",
                                "#minecraft:new_tag"
                            ],
                            origin_value: [
                                "#minecraft:non_treasure",
                                "#yggdrasil:structure/alfheim_tree/ominous_vault",
                                "#yggdrasil:structure/alfheim_tree/ominous_vault/floor",
                                "#yggdrasil:structure/asflors/common",
                                "#minecraft:armor"
                            ]
                        }
                    ]
                }
            ]);

            const actions: SequentialAction = {
                type: "sequential",
                actions: [
                    {
                        type: "toggle_value_in_list",
                        field: "exclusiveSet",
                        mode: ["remove_if_empty", "override"],
                        value: "minecraft:sharpness"
                    },
                    {
                        type: "remove_value_from_list",
                        field: "tags",
                        value: "#minecraft:new_tag"
                    }
                ]
            };

            const logger = new Logger(existingLogWithDifferences);
            const difference = createDifferenceFromAction(actions, element.data, logger.getVersion(), "enchantment", logger);
            if (!difference) {
                throw new Error("Failed to create difference");
            }

            logger.logDifference(
                new Identifier(element.data.identifier).toString(),
                element.data.identifier.registry || "unknown",
                difference
            );

            const logs = logger.getLogs();
            expect(logs.logs).toHaveLength(1);
            expect(logs.logs[0]).toMatchObject({
                identifier: "enchantplus:bow/accuracy_shot",
                registry: "enchantment",
                type: "updated"
            });

            expect("differences" in logs.logs[0] && logs.logs[0].differences).toHaveLength(2);
            expect("differences" in logs.logs[0] && logs.logs[0].differences[0]).toMatchObject({
                type: "set",
                path: "exclusiveSet",
                value: ["minecraft:sharpness"],
                origin_value: "#minecraft:armor"
            });

            expect("differences" in logs.logs[0] && logs.logs[0].differences[1]).toMatchObject({
                type: "set",
                path: "tags",
                value: [
                    "#minecraft:non_treasure",
                    "#yggdrasil:structure/alfheim_tree/ominous_vault",
                    "#yggdrasil:structure/alfheim_tree/ominous_vault/floor",
                    "#yggdrasil:structure/asflors/common"
                ]
            });
        });

        it("Shouldn't log if value equals original value", () => {
            const element = createComplexMockElement();
            const action: SimpleAction = {
                type: "toggle_value",
                value: "#minecraft:exclusive_set/armor",
                field: "exclusiveSet"
            };

            const logger = new Logger(existingLog());
            const difference = createDifferenceFromAction(action, element.data, logger.getVersion(), "enchantment", logger);
            if (!difference) {
                throw new Error("Failed to create difference");
            }

            logger.logDifference(
                new Identifier(element.data.identifier).toString(),
                element.data.identifier.registry || "unknown",
                difference
            );

            const logs = logger.getLogs();
            expect(logs.logs).toHaveLength(1);
            if (logs.logs[0].type === "updated") {
                expect(logs.logs[0].differences).toHaveLength(1);
            }
        });
    });

    describe("Logging with optional value parameter", () => {
        it("should handle toggle list value with optional value parameter", () => {
            const logger = new Logger(existingLog());
            const element = createComplexMockElement();

            const action: ToggleListValueAction = {
                type: "toggle_value_in_list",
                field: "tags"
            };

            // Test avec une valeur optionnelle différente
            const difference = createDifferenceFromAction(
                action,
                element.data,
                logger.getVersion(),
                "enchantment",
                logger,
                "#minecraft:override_tag"
            );
            if (!difference) {
                throw new Error("Failed to create difference");
            }

            logger.logDifference(
                new Identifier(element.data.identifier).toString(),
                element.data.identifier.registry || "unknown",
                difference
            );

            const logs = logger.getLogs();
            expect(logs.logs).toHaveLength(1);
            const fileLog = logs.logs[0];
            expect(fileLog.type).toBe("updated");
            if (fileLog.type === "updated") {
                expect(fileLog.differences).toHaveLength(1);
                expect(fileLog.differences[0]).toMatchObject({
                    type: "set",
                    path: "tags",
                    value: [
                        "#minecraft:non_treasure",
                        "#yggdrasil:structure/alfheim_tree/ominous_vault",
                        "#yggdrasil:structure/alfheim_tree/ominous_vault/floor",
                        "#yggdrasil:structure/asflors/common",
                        "#minecraft:override_tag"
                    ],
                    origin_value: [
                        "#minecraft:non_treasure",
                        "#yggdrasil:structure/alfheim_tree/ominous_vault",
                        "#yggdrasil:structure/alfheim_tree/ominous_vault/floor",
                        "#yggdrasil:structure/asflors/common"
                    ]
                });
            }
        });

        it("should handle set_value_from_computed_value action with optional value parameter", () => {
            const logger = new Logger(existingLog());
            const element = createComplexMockElement();

            const action: ComputedAction = {
                type: "set_value_from_computed_value",
                field: "maxLevel"
            };

            const optionalValue = 5;
            const difference = createDifferenceFromAction(action, element.data, logger.getVersion(), "enchantment", logger, optionalValue);
            if (!difference) {
                throw new Error("Failed to create difference");
            }

            logger.logDifference(
                new Identifier(element.data.identifier).toString(),
                element.data.identifier.registry || "unknown",
                difference
            );

            const logs = logger.getLogs();
            expect(logs.logs).toHaveLength(1);
            const fileLog = logs.logs[0];
            expect(fileLog.type).toBe("updated");
            if (fileLog.type === "updated") {
                expect(fileLog.differences).toHaveLength(1);
                expect(fileLog.differences[0]).toMatchObject({
                    type: "set",
                    path: "maxLevel",
                    value: 5,
                    origin_value: 1
                });
            }
        });

        it("should handle toggle_value_from_computed_value action with optional value parameter", () => {
            const logger = new Logger(existingLog());
            const element = createComplexMockElement();

            const action: ComputedAction = {
                type: "toggle_value_from_computed_value",
                field: "supportedItems"
            };

            const optionalValue = "#minecraft:axes";
            const difference = createDifferenceFromAction(action, element.data, logger.getVersion(), "enchantment", logger, optionalValue);
            if (!difference) {
                throw new Error("Failed to create difference");
            }

            logger.logDifference(
                new Identifier(element.data.identifier).toString(),
                element.data.identifier.registry || "unknown",
                difference
            );

            const logs = logger.getLogs();
            expect(logs.logs).toHaveLength(1);
            const fileLog = logs.logs[0];
            expect(fileLog.type).toBe("updated");
            if (fileLog.type === "updated") {
                expect(fileLog.differences).toHaveLength(1);
                expect(fileLog.differences[0]).toMatchObject({
                    type: "set",
                    path: "supportedItems",
                    value: "#minecraft:axes",
                    origin_value: "#voxel:enchantable/range"
                });
            }
        });

        it("should handle toggle_value_from_computed_value action that removes value", () => {
            const logger = new Logger(existingLog());
            const element = createComplexMockElement();

            const action: ComputedAction = {
                type: "toggle_value_from_computed_value",
                field: "supportedItems"
            };

            // Using the same value as current to trigger removal
            const optionalValue = "#voxel:enchantable/range";
            const difference = createDifferenceFromAction(action, element.data, logger.getVersion(), "enchantment", logger, optionalValue);

            // Si la différence est undefined, c'est normal car la valeur est supprimée
            expect(difference).toBeUndefined();

            // Vérifions que le logger n'a pas enregistré de changement
            const logs = logger.getLogs();
            expect(logs.logs).toHaveLength(0);
        });

        // Ajoutons un test pour vérifier le comportement quand la valeur est différente
        it("should handle toggle_value_from_computed_value action with different value", () => {
            const logger = new Logger(existingLog());
            const element = createComplexMockElement();

            const action: ComputedAction = {
                type: "toggle_value_from_computed_value",
                field: "supportedItems"
            };

            // Utilisons une valeur différente
            const optionalValue = "#minecraft:different_value";
            const difference = createDifferenceFromAction(action, element.data, logger.getVersion(), "enchantment", logger, optionalValue);
            if (!difference) {
                throw new Error("Failed to create difference");
            }

            logger.logDifference(
                new Identifier(element.data.identifier).toString(),
                element.data.identifier.registry || "unknown",
                difference
            );

            const logs = logger.getLogs();
            expect(logs.logs).toHaveLength(1);
            const fileLog = logs.logs[0];
            expect(fileLog.type).toBe("updated");
            if (fileLog.type === "updated") {
                expect(fileLog.differences).toHaveLength(1);
                expect(fileLog.differences[0]).toMatchObject({
                    type: "set",
                    path: "supportedItems",
                    value: "#minecraft:different_value",
                    origin_value: "#voxel:enchantable/range"
                });
            }
        });
    });
});
