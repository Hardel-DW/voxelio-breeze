import type { LevelBasedValue } from "./LevelBasedValue.ts";

export type EnchantmentValueEffect =
    | ValueEffectAdd
    | ValueEffectAllOf
    | ValueEffectMultiply
    | ValueEffectRemoveBinomial
    | ValueEffectSet;

interface ValueEffectAdd {
    type: "minecraft:add";
    value: LevelBasedValue;
}

interface ValueEffectAllOf {
    type: "minecraft:all_of";
    effects: EnchantmentValueEffect[];
}

interface ValueEffectMultiply {
    type: "minecraft:multiply";
    factor: LevelBasedValue;
}

interface ValueEffectRemoveBinomial {
    type: "minecraft:remove_binomial";
    chance: LevelBasedValue;
}

interface ValueEffectSet {
    type: "minecraft:set";
    value: LevelBasedValue;
}
