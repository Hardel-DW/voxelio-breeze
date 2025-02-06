export type LevelBasedValue =
    | LevelBasedValueConstant
    | LevelBasedValueConstantAdd
    | LevelBasedValueClamped
    | LevelBasedValueFraction
    | LevelBasedValueLevelSquared
    | LevelBasedValueLinear
    | LevelBasedValueLookup;

type LevelBasedValueConstant = number;

type LevelBasedValueConstantAdd = {
    type: "minecraft:constant";
    value: number;
};

type LevelBasedValueClamped = {
    type: "minecraft:clamped";
    value: LevelBasedValue;
    min: number;
    max: number;
};

type LevelBasedValueFraction = {
    type: "minecraft:fraction";
    numerator: LevelBasedValue;
    denominator: LevelBasedValue;
};

type LevelBasedValueLevelSquared = {
    type: "minecraft:levels_squared";
    added: number;
};

type LevelBasedValueLinear = {
    base: number;
    per_level_above_first: number;
};

type LevelBasedValueLookup = {
    type: "minecraft:lookup";
    values: number[];
    fallback: LevelBasedValue;
};
