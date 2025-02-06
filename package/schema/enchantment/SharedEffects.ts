import type { SingleOrMultiple } from "../../utils.ts";
import type { LevelBasedValue } from "./LevelBasedValue.ts";
import type { ParticlePositionSource } from "./ParticlePositionSource.ts";
import type { ParticleVelocitySource } from "./ParticleVelocitySource.ts";
import type { SoundValue } from "./SoundValue.ts";

type ApplyMobEffect = {
    type: "minecraft:apply_mob_effect";
    to_apply: string[];
    min_duration: LevelBasedValue;
    max_duration: LevelBasedValue;
    min_amplifier: LevelBasedValue;
    max_amplifier: LevelBasedValue;
};

type DamageEntity = {
    type: "minecraft:damage_entity" | "minecraft:change_entity_damage";
    damage_type: string;
    min_damage: LevelBasedValue;
    max_damage: LevelBasedValue;
};

type DamageItem = {
    type: "minecraft:damage_item";
    amount: LevelBasedValue;
};

type Explode = {
    type: "minecraft:explode";
    damage_type?: string;
    radius: LevelBasedValue;
    offset: [number, number, number];
    block_interaction: "none" | "block" | "tnt" | "trigger" | "mob";
    small_particle: string;
    large_particle: string;
    sound: SoundValue;
    immune_blocks?: SingleOrMultiple<string>;
    knockback_multiplier?: LevelBasedValue;
    attribute_to_user?: boolean;
    create_fire?: boolean;
};

type Ignite = {
    type: "minecraft:ignite";
    duration: LevelBasedValue;
};

type PlaySound = {
    type: "minecraft:play_sound";
    sound: SoundValue;
    volume: number;
    pitch: number;
};

type ReplaceBlock = {
    type: "minecraft:replace_block";
    block_state: unknown;
    predicate?: unknown;
    offset?: [number, number, number];
    trigger_game_event?: string;
};

type ReplaceDisk = {
    type: "minecraft:replace_disk";
    block_state: unknown;
    predicate?: unknown;
    radius: LevelBasedValue;
    height: LevelBasedValue;
    offset?: [number, number, number];
    trigger_game_event?: string;
};

type RunFunction = {
    type: "minecraft:run_function";
    function: string;
};

type SetBlockProperties = {
    type: "minecraft:set_block_properties";
    properties: Record<string, string>;
    offset?: [number, number, number];
    trigger_game_event?: string;
};

type SpawnParticles = {
    type: "minecraft:spawn_particles";
    particle: string;
    horizontal_position: ParticlePositionSource;
    vertical_position: ParticlePositionSource;
    horizontal_velocity: ParticleVelocitySource;
    vertical_velocity: ParticleVelocitySource;
    speed: number;
};

type SummonEntity = {
    type: "minecraft:summon_entity";
    entity: string[];
    join_team?: boolean;
};

export type SharedEffects =
    | ApplyMobEffect
    | DamageEntity
    | DamageItem
    | Explode
    | Ignite
    | PlaySound
    | ReplaceBlock
    | ReplaceDisk
    | RunFunction
    | SetBlockProperties
    | SpawnParticles
    | SummonEntity;
