import type { AllOfEffect, AttributeEffect } from "./EffectComponents.ts";
import type { SharedEffects } from "./SharedEffects.ts";

export type EnchantmentLocationEffect =
    | SharedEffects
    | AttributeEffect
    | AllOfEffect;
