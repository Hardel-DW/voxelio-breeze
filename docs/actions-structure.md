# Actions Structure - Domaine des structures

## Vue d'ensemble

Le domaine `structure` fournit des actions spécialisées pour manipuler les
structures Minecraft. Il permet de gérer les biomes, spawn overrides,
configuration Jigsaw, et autres propriétés spécifiques aux structures.

## Actions disponibles

### `structure.set_biomes`

Définit ou ajoute des biomes à une structure.

**Signature** :

```typescript
{
    type: "structure.set_biomes";
    biomes: string[];
    replace?: boolean;
}
```

**Paramètres** :

- `biomes` : Liste des biomes ou tags de biomes à définir
- `replace` : Si `true`, remplace la liste existante, sinon ajoute (défaut:
  `false`)

**Exemples** :

```typescript
// Remplacer tous les biomes
const action = {
    type: "structure.set_biomes",
    biomes: ["minecraft:plains", "minecraft:forest"],
    replace: true,
};

// Ajouter des biomes sans doublons
const action = {
    type: "structure.set_biomes",
    biomes: ["#minecraft:is_overworld", "minecraft:desert"],
    replace: false,
};
```

**Résultat** :

- Si `replace: true` : Remplace complètement la liste des biomes
- Si `replace: false` : Ajoute les nouveaux biomes sans créer de doublons
- Évite automatiquement les biomes déjà présents

### `structure.add_spawn_override`

Ajoute ou remplace un spawn override pour une catégorie de mob.

**Signature** :

```typescript
{
    type: "structure.add_spawn_override";
    mobCategory: string;
    boundingBox: "piece" | "full";
    spawns: Array<{
        type: string;
        weight: number;
        minCount: number;
        maxCount: number;
    }>;
}
```

**Paramètres** :

- `mobCategory` : Catégorie de mob (`"monster"`, `"creature"`, `"ambient"`,
  etc.)
- `boundingBox` : Zone d'effet (`"piece"` ou `"full"`)
- `spawns` : Configuration des spawns pour cette catégorie

**Exemples** :

```typescript
// Ajouter des spawns de monstres
const action = {
    type: "structure.add_spawn_override",
    mobCategory: "monster",
    boundingBox: "piece",
    spawns: [
        {
            type: "minecraft:zombie",
            weight: 100,
            minCount: 2,
            maxCount: 4,
        },
        {
            type: "minecraft:skeleton",
            weight: 50,
            minCount: 1,
            maxCount: 2,
        },
    ],
};

// Override pour créatures passives
const action = {
    type: "structure.add_spawn_override",
    mobCategory: "creature",
    boundingBox: "full",
    spawns: [
        {
            type: "minecraft:villager",
            weight: 1,
            minCount: 2,
            maxCount: 6,
        },
    ],
};
```

**Résultat** :

- Remplace l'override existant pour la même `mobCategory`
- Ajoute un nouvel override si la catégorie n'existait pas
- Préserve les autres catégories existantes

### `structure.remove_spawn_override`

Supprime un spawn override pour une catégorie de mob.

**Signature** :

```typescript
{
    type: "structure.remove_spawn_override";
    mobCategory: string;
}
```

**Exemples** :

```typescript
// Supprimer les spawns de monstres
const action = {
    type: "structure.remove_spawn_override",
    mobCategory: "monster",
};
```

**Résultat** :

- Supprime complètement l'override pour la catégorie spécifiée
- Ignore si la catégorie n'existe pas

### `structure.set_jigsaw_config`

Configure les propriétés spécifiques aux structures Jigsaw.

**Signature** :

```typescript
{
    type: "structure.set_jigsaw_config";
    startPool?: string;
    size?: number;
    startHeight?: any;
    startJigsawName?: string;
    maxDistanceFromCenter?: number;
    useExpansionHack?: boolean;
}
```

**Paramètres** :

- `startPool` : Pool de départ pour la génération Jigsaw
- `size` : Taille maximale de la structure
- `startHeight` : Provider de hauteur de départ
- `startJigsawName` : Nom du jigsaw de départ
- `maxDistanceFromCenter` : Distance maximale depuis le centre
- `useExpansionHack` : Utiliser l'expansion hack

**Exemples** :

```typescript
// Configuration complète d'un village
const action = {
    type: "structure.set_jigsaw_config",
    startPool: "minecraft:village/plains/town_centers",
    size: 6,
    startHeight: {
        type: "minecraft:heightmap",
        heightmap: "WORLD_SURFACE_WG",
    },
    startJigsawName: "bottom",
    maxDistanceFromCenter: 80,
    useExpansionHack: false,
};

// Modification partielle
const action = {
    type: "structure.set_jigsaw_config",
    size: 8,
    maxDistanceFromCenter: 120,
};
```

**Résultat** :

- Met à jour uniquement les propriétés spécifiées
- Préserve les autres propriétés Jigsaw existantes
- Ignore les propriétés non-Jigsaw

### `structure.add_pool_alias`

Ajoute un alias de pool pour la génération Jigsaw.

**Signature** :

```typescript
{
    type: "structure.add_pool_alias";
    aliasType: string;
    alias?: string;
    target?: string;
    targets?: Array<{ weight: number; data: string }>;
}
```

**Exemples** :

```typescript
// Alias simple
const action = {
    type: "structure.add_pool_alias",
    aliasType: "direct",
    alias: "custom:village_center",
    target: "minecraft:village/plains/town_centers",
};

// Alias avec poids multiples
const action = {
    type: "structure.add_pool_alias",
    aliasType: "random",
    alias: "custom:random_houses",
    targets: [
        { weight: 10, data: "minecraft:village/plains/houses" },
        { weight: 5, data: "custom:special_houses" },
    ],
};
```

### `structure.remove_pool_alias`

Supprime un alias de pool par son nom.

**Signature** :

```typescript
{
    type: "structure.remove_pool_alias";
    alias: string;
}
```

**Exemples** :

```typescript
const action = {
    type: "structure.remove_pool_alias",
    alias: "custom:village_center",
};
```

### `structure.set_terrain_adaptation`

Définit le mode d'adaptation au terrain.

**Signature** :

```typescript
{
    type: "structure.set_terrain_adaptation";
    adaptation: "none" | "beard_thin" | "beard_box" | "bury" | "encapsulate";
}
```

**Exemples** :

```typescript
// Enterrer la structure
const action = {
    type: "structure.set_terrain_adaptation",
    adaptation: "bury",
};

// Aucune adaptation
const action = {
    type: "structure.set_terrain_adaptation",
    adaptation: "none",
};
```

### `structure.set_decoration_step`

Définit l'étape de décoration pour la génération.

**Signature** :

```typescript
{
    type: "structure.set_decoration_step";
    step: string;
}
```

**Exemples** :

```typescript
// Génération en surface
const action = {
    type: "structure.set_decoration_step",
    step: "surface_structures",
};

// Génération souterraine
const action = {
    type: "structure.set_decoration_step",
    step: "underground_structures",
};
```

## Cas d'usage pratiques

### Configuration d'un village personnalisé

```typescript
const configureCustomVillage = {
    type: "core.sequential",
    actions: [
        // Définir les biomes
        {
            type: "structure.set_biomes",
            biomes: ["minecraft:plains", "minecraft:sunflower_plains"],
            replace: true,
        },
        // Configuration Jigsaw
        {
            type: "structure.set_jigsaw_config",
            startPool: "custom:village/centers",
            size: 8,
            startHeight: {
                type: "minecraft:heightmap",
                heightmap: "WORLD_SURFACE_WG",
            },
            maxDistanceFromCenter: 100,
        },
        // Spawns de villageois
        {
            type: "structure.add_spawn_override",
            mobCategory: "creature",
            boundingBox: "full",
            spawns: [
                {
                    type: "minecraft:villager",
                    weight: 1,
                    minCount: 4,
                    maxCount: 8,
                },
            ],
        },
        // Adaptation au terrain
        {
            type: "structure.set_terrain_adaptation",
            adaptation: "beard_thin",
        },
    ],
};
```

### Modification d'un donjon existant

```typescript
const enhanceDungeon = {
    type: "core.sequential",
    actions: [
        // Ajouter des biomes de spawn
        {
            type: "structure.set_biomes",
            biomes: ["#minecraft:has_structure/buried_treasure"],
            replace: false,
        },
        // Spawns personnalisés
        {
            type: "structure.add_spawn_override",
            mobCategory: "monster",
            boundingBox: "piece",
            spawns: [
                {
                    type: "minecraft:zombie",
                    weight: 50,
                    minCount: 1,
                    maxCount: 3,
                },
                {
                    type: "minecraft:skeleton",
                    weight: 30,
                    minCount: 1,
                    maxCount: 2,
                },
                {
                    type: "custom:boss_mob",
                    weight: 5,
                    minCount: 1,
                    maxCount: 1,
                },
            ],
        },
        // Enterrer partiellement
        {
            type: "structure.set_terrain_adaptation",
            adaptation: "bury",
        },
        // Étape de génération
        {
            type: "structure.set_decoration_step",
            step: "underground_structures",
        },
    ],
};
```

### Création d'une structure bastion personnalisée

```typescript
const customBastion = {
    type: "core.sequential",
    actions: [
        // Biomes du Nether
        {
            type: "structure.set_biomes",
            biomes: [
                "minecraft:nether_wastes",
                "minecraft:crimson_forest",
                "minecraft:warped_forest",
            ],
            replace: true,
        },
        // Configuration Jigsaw pour bastion
        {
            type: "structure.set_jigsaw_config",
            startPool: "custom:bastion/starts",
            size: 7,
            startJigsawName: "empty",
            maxDistanceFromCenter: 90,
            useExpansionHack: true,
        },
        // Spawns de piglins
        {
            type: "structure.add_spawn_override",
            mobCategory: "monster",
            boundingBox: "piece",
            spawns: [
                {
                    type: "minecraft:piglin",
                    weight: 100,
                    minCount: 2,
                    maxCount: 5,
                },
                {
                    type: "minecraft:piglin_brute",
                    weight: 20,
                    minCount: 1,
                    maxCount: 2,
                },
            ],
        },
        // Alias pour variantes
        {
            type: "structure.add_pool_alias",
            aliasType: "random",
            alias: "custom:bastion_rooms",
            targets: [
                { weight: 10, data: "minecraft:bastion/treasure" },
                { weight: 8, data: "custom:enhanced_treasure" },
                { weight: 5, data: "custom:puzzle_rooms" },
            ],
        },
    ],
};
```

### Optimisation des spawns conditionnelle

```typescript
const optimizeSpawns = {
    type: "core.alternative",
    condition: {
        condition: "compare_to_value",
        compare: "type",
        value: "minecraft:village",
    },
    ifTrue: {
        type: "core.sequential",
        actions: [
            // Villages : plus de villageois
            {
                type: "structure.add_spawn_override",
                mobCategory: "creature",
                boundingBox: "full",
                spawns: [
                    {
                        type: "minecraft:villager",
                        weight: 1,
                        minCount: 6,
                        maxCount: 12,
                    },
                ],
            },
            // Réduire les spawns de monstres
            {
                type: "structure.remove_spawn_override",
                mobCategory: "monster",
            },
        ],
    },
    ifFalse: {
        type: "structure.add_spawn_override",
        mobCategory: "monster",
        boundingBox: "piece",
        spawns: [
            {
                type: "minecraft:zombie",
                weight: 100,
                minCount: 2,
                maxCount: 4,
            },
        ],
    },
};
```

## Types de structures

### Structures Jigsaw

Les actions `set_jigsaw_config` et `add_pool_alias` ne s'appliquent qu'aux
structures utilisant le système Jigsaw :

- `minecraft:bastion_remnant`
- `minecraft:jigsaw`
- `minecraft:pillager_outpost`
- `minecraft:village`

### Structures Legacy

Pour les structures legacy, les propriétés Jigsaw sont ignorées :

- `minecraft:desert_pyramid`
- `minecraft:end_city`
- `minecraft:fortress`
- `minecraft:igloo`
- `minecraft:jungle_temple`
- `minecraft:ocean_monument`
- `minecraft:stronghold`
- `minecraft:swamp_hut`
- `minecraft:woodland_mansion`
- `minecraft:buried_treasure`
- `minecraft:mineshaft`
- `minecraft:nether_fossil`
- `minecraft:ocean_ruin`
- `minecraft:ruined_portal`
- `minecraft:shipwreck`

## Catégories de mobs supportées

- `"monster"` : Monstres hostiles
- `"creature"` : Créatures passives
- `"ambient"` : Créatures ambiantes (chauves-souris)
- `"axolotls"` : Axolotls
- `"underground_water_creature"` : Créatures aquatiques souterraines
- `"water_creature"` : Créatures aquatiques
- `"water_ambient"` : Créatures ambiantes aquatiques
- `"misc"` : Divers

## Modes d'adaptation au terrain

- `"none"` : Aucune adaptation
- `"beard_thin"` : Barbe fine sous la structure
- `"beard_box"` : Boîte de barbe sous la structure
- `"bury"` : Enterrer dans le terrain
- `"encapsulate"` : Encapsuler dans le terrain

Ces actions permettent un contrôle précis sur tous les aspects des structures
Minecraft, des configurations Jigsaw complexes aux spawns personnalisés.
