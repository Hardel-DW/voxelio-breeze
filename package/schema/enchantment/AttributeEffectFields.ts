import type { LevelBasedValue } from "./LevelBasedValue.ts";

export interface AttributeEffectFields {
    id: string;
    attribute: string;
    amount: LevelBasedValue;
    operation: string;
}
