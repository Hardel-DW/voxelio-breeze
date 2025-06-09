# Guide Structure - Parsing et Compiling

## Vue d'ensemble

Ce guide explique la conversion bidirectionnelle entre le format Minecraft natif
des structures et le format Voxel simplifié. Le système Voxel aplatit les
propriétés Jigsaw et normalise les spawn overrides pour une manipulation plus
intuitive.

## Parsing : Minecraft → Voxel

### Fonction principale

```typescript
import { StructureDataDrivenToVoxelFormat } from "@voxelio/breeze/core";

const voxelStructure = StructureDataDrivenToVoxelFormat({
    element: minecraftElement,
    tags: ["minecraft:on_ocean_explorer_maps"],
    configurator: "my_tool",
});
```

### Transformation des propriétés

Le parser effectue ces conversions automatiques :

```typescript
// Minecraft → Voxel
data.biomes → biomes (normalisation en array)
data.step → step
data.terrain_adaptation → terrainAdaptation
data.spawn_overrides → spawnOverrides (Record → Array)

// Propriétés Jigsaw (aplaties)
data.start_pool → startPool
data.size → size
data.start_height → startHeight
data.start_jigsaw_name → startJigsawName
data.project_start_to_heightmap → projectStartToHeightmap
data.max_distance_from_center → maxDistanceFromCenter
data.use_expansion_hack → useExpansionHack
data.pool_aliases → poolAliases
data.dimension_padding → dimensionPadding (normalisé)
data.liquid_settings → liquidSettings
```

### Détection automatique du type de structure

Le parser distingue automatiquement les structures :

**Structures Jigsaw** (propriétés aplaties) :

- `minecraft:bastion_remnant`
- `minecraft:jigsaw`
- `minecraft:pillager_outpost`
- `minecraft:village`

**Structures Legacy** (config dans `typeSpecific`) :

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

### Normalisation des spawn overrides

**Entrée Minecraft** (Record format) :

```json
{
    "spawn_overrides": {
        "monster": {
            "bounding_box": "piece",
            "spawns": [
                {
                    "type": "minecraft:zombie",
                    "weight": 100,
                    "minCount": 2,
                    "maxCount": 4
                }
            ]
        },
        "creature": {
            "bounding_box": "full",
            "spawns": [
                {
                    "type": "minecraft:villager",
                    "weight": 1,
                    "minCount": 2,
                    "maxCount": 6
                }
            ]
        }
    }
}
```

**Sortie Voxel** (Array format) :

```typescript
{
    spawnOverrides: [
        {
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
        {
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
        },
    ];
}
```

### Normalisation des biomes

```typescript
// String unique → Array
data.biomes = "minecraft:plains" 
→ biomes = ["minecraft:plains"]

// Array déjà → Conservé
data.biomes = ["minecraft:plains", "minecraft:forest"]
→ biomes = ["minecraft:plains", "minecraft:forest"]
```

### Normalisation de dimension padding

```typescript
// Number → Object avec valeurs identiques
data.dimension_padding = 5
→ dimensionPadding = { bottom: 5, top: 5 }

// Object → Conservé
data.dimension_padding = { bottom: 3, top: 7 }
→ dimensionPadding = { bottom: 3, top: 7 }
```

### Exemple complet - Village

**Entrée Minecraft** :

```json
{
    "data": {
        "type": "minecraft:village",
        "biomes": ["minecraft:plains", "minecraft:sunflower_plains"],
        "step": "surface_structures",
        "terrain_adaptation": "beard_thin",
        "spawn_overrides": {
            "creature": {
                "bounding_box": "full",
                "spawns": [
                    {
                        "type": "minecraft:villager",
                        "weight": 1,
                        "minCount": 2,
                        "maxCount": 6
                    }
                ]
            }
        },
        "start_pool": "minecraft:village/plains/town_centers",
        "size": 6,
        "start_height": {
            "type": "minecraft:heightmap",
            "heightmap": "WORLD_SURFACE_WG"
        },
        "start_jigsaw_name": "bottom",
        "max_distance_from_center": 80,
        "use_expansion_hack": false,
        "pool_aliases": [
            {
                "type": "direct",
                "alias": "village_center",
                "target": "minecraft:village/plains/town_centers"
            }
        ]
    },
    "identifier": { "namespace": "minecraft", "resource": "village" }
}
```

**Sortie Voxel** :

```typescript
{
    identifier: { namespace: "minecraft", resource: "village" },
    type: "minecraft:village",
    biomes: ["minecraft:plains", "minecraft:sunflower_plains"],
    step: "surface_structures",
    terrainAdaptation: "beard_thin",
    spawnOverrides: [
        {
            mobCategory: "creature",
            boundingBox: "full",
            spawns: [
                {
                    type: "minecraft:villager",
                    weight: 1,
                    minCount: 2,
                    maxCount: 6
                }
            ]
        }
    ],
    // Propriétés Jigsaw aplaties
    startPool: "minecraft:village/plains/town_centers",
    size: 6,
    startHeight: {
        type: "minecraft:heightmap",
        heightmap: "WORLD_SURFACE_WG"
    },
    startJigsawName: "bottom",
    maxDistanceFromCenter: 80,
    useExpansionHack: false,
    poolAliases: [
        {
            type: "direct",
            alias: "village_center",
            target: "minecraft:village/plains/town_centers"
        }
    ],
    tags: [],
    override: "my_tool"
}
```

### Exemple - Structure Legacy (Mineshaft)

**Entrée Minecraft** :

```json
{
    "data": {
        "type": "minecraft:mineshaft",
        "biomes": "#minecraft:has_structure/mineshaft",
        "step": "underground_structures",
        "probability": 0.004,
        "mineshaft_type": "normal"
    }
}
```

**Sortie Voxel** :

```typescript
{
    identifier: { namespace: "minecraft", resource: "mineshaft" },
    type: "minecraft:mineshaft",
    biomes: ["#minecraft:has_structure/mineshaft"],
    step: "underground_structures",
    spawnOverrides: [],
    // Config legacy dans typeSpecific
    typeSpecific: {
        probability: 0.004,
        mineshaft_type: "normal"
    },
    tags: [],
    override: "my_tool"
}
```

## Compiling : Voxel → Minecraft

### Fonction principale

```typescript
import { VoxelToStructureDataDriven } from "@voxelio/breeze/core";

const { element, tags } = VoxelToStructureDataDriven(
    voxelStructure,
    "structure", // config pour le registry des tags
    originalMinecraftElement, // optionnel
);
```

### Transformation inverse

```typescript
// Voxel → Minecraft
biomes → data.biomes (array ou string unique)
step → data.step
terrainAdaptation → data.terrain_adaptation
spawnOverrides → data.spawn_overrides (Array → Record)

// Propriétés Jigsaw (reconstruction)
startPool → data.start_pool
size → data.size
startHeight → data.start_height
startJigsawName → data.start_jigsaw_name
projectStartToHeightmap → data.project_start_to_heightmap
maxDistanceFromCenter → data.max_distance_from_center
useExpansionHack → data.use_expansion_hack
poolAliases → data.pool_aliases
dimensionPadding → data.dimension_padding (dénormalisé)
liquidSettings → data.liquid_settings
```

### Reconstruction des spawn overrides

**Entrée Voxel** (Array format) :

```typescript
{
    spawnOverrides: [
        {
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
    ];
}
```

**Sortie Minecraft** (Record format) :

```json
{
    "spawn_overrides": {
        "monster": {
            "bounding_box": "piece",
            "spawns": [
                {
                    "type": "minecraft:zombie",
                    "weight": 100,
                    "minCount": 2,
                    "maxCount": 4
                }
            ]
        }
    }
}
```

### Dénormalisation de dimension padding

```typescript
// Si les valeurs sont identiques → Number
dimensionPadding = { bottom: 5, top: 5 }
→ data.dimension_padding = 5

// Si les valeurs diffèrent → Object
dimensionPadding = { bottom: 3, top: 7 }
→ data.dimension_padding = { bottom: 3, top: 7 }
```

### Gestion des types de structures

**Structures Jigsaw** - Propriétés spreadées :

```typescript
if (JIGSAW_STRUCTURE_TYPES.has(element.type)) {
    if (element.startPool) structure.start_pool = element.startPool;
    if (element.size !== undefined) structure.size = element.size;
    if (element.startHeight) structure.start_height = element.startHeight;
    // ... autres propriétés Jigsaw
}
```

**Structures Legacy** - Config restaurée :

```typescript
else {
    // Restore typeSpecific config
    if (element.typeSpecific) {
        Object.assign(structure, element.typeSpecific);
    }
}
```

### Optimisation des biomes

```typescript
// Array unique → String simple
biomes = ["minecraft:plains"]
→ data.biomes = "minecraft:plains"

// Array multiple → Conservé array
biomes = ["minecraft:plains", "minecraft:forest"]
→ data.biomes = ["minecraft:plains", "minecraft:forest"]
```

## Préservation des champs inconnus

### Extraction des champs de mods

```typescript
const unknownFields = extractUnknownFields(data, KNOWN_STRUCTURE_FIELDS);

// Champs reconnus :
KNOWN_STRUCTURE_FIELDS = new Set([
    "type",
    "biomes",
    "step",
    "terrain_adaptation",
    "spawn_overrides",
    "start_pool",
    "size",
    "start_height",
    "start_jigsaw_name",
    "project_start_to_heightmap",
    "max_distance_from_center",
    "use_expansion_hack",
    "pool_aliases",
    "dimension_padding",
    "liquid_settings",
    // Legacy fields
    "probability",
    "mineshaft_type",
    "height",
    "biome_temp",
    "large_probability",
    "cluster_probability",
    "setups",
    "is_beached",
]);
```

### Restauration lors du compiling

```typescript
// Restore unknown fields from mods
if (element.unknownFields) {
    Object.assign(structure, element.unknownFields);
}
```

## Cas d'usage pratiques

### Modification d'un village existant

```typescript
// 1. Parser
const voxel = StructureDataDrivenToVoxelFormat({
    element: minecraftVillage,
    tags: ["minecraft:village"],
    configurator: "editor",
});

// 2. Modifier
const modified = {
    ...voxel,
    size: 8, // Agrandir
    maxDistanceFromCenter: 120,
    biomes: [...voxel.biomes, "minecraft:meadow"], // Ajouter biome
};

// 3. Compiler
const { element, tags } = VoxelToStructureDataDriven(
    modified,
    "structure",
);
```

### Conversion Legacy vers Jigsaw

```typescript
// Structure legacy avec config custom
const legacyStructure = {
    ...voxelStructure,
    type: "minecraft:jigsaw", // Changer vers Jigsaw
    startPool: "custom:my_structure/starts",
    size: 5,
    typeSpecific: undefined, // Supprimer config legacy
};

const { element } = VoxelToStructureDataDriven(legacyStructure, "structure");
// Les propriétés Jigsaw seront correctement spreadées
```

### Ajout de spawns personnalisés

```typescript
const withCustomSpawns = {
    ...voxelStructure,
    spawnOverrides: [
        ...voxelStructure.spawnOverrides,
        {
            mobCategory: "monster",
            boundingBox: "piece",
            spawns: [
                {
                    type: "custom:boss_mob",
                    weight: 1,
                    minCount: 1,
                    maxCount: 1,
                },
            ],
        },
    ],
};
```

### Création de structure personnalisée

```typescript
const customStructure = {
    identifier: { namespace: "mymod", resource: "sky_temple" },
    type: "minecraft:jigsaw",
    biomes: ["#minecraft:is_overworld"],
    step: "surface_structures",
    terrainAdaptation: "none",
    spawnOverrides: [
        {
            mobCategory: "creature",
            boundingBox: "full",
            spawns: [
                {
                    type: "mymod:sky_guardian",
                    weight: 1,
                    minCount: 1,
                    maxCount: 2,
                },
            ],
        },
    ],
    // Configuration Jigsaw
    startPool: "mymod:sky_temple/centers",
    size: 7,
    startHeight: {
        type: "minecraft:uniform",
        min_inclusive: { absolute: 200 },
        max_inclusive: { absolute: 250 },
    },
    startJigsawName: "bottom",
    maxDistanceFromCenter: 100,
    useExpansionHack: false,
    poolAliases: [
        {
            type: "random",
            alias: "mymod:temple_rooms",
            targets: [
                { weight: 10, data: "mymod:sky_temple/common_rooms" },
                { weight: 5, data: "mymod:sky_temple/rare_rooms" },
                { weight: 1, data: "mymod:sky_temple/boss_room" },
            ],
        },
    ],
    liquidSettings: "ignore_waterlogging",
    tags: ["mymod:sky_structures"],
    override: "mymod_editor",
};

const { element, tags } = VoxelToStructureDataDriven(
    customStructure,
    "structure",
);
```

## Comportements importants

### Optimisations automatiques

- **Biomes** : Array unique → String simple lors du compiling
- **Dimension Padding** : Valeurs identiques → Number simple
- **Spawn Overrides** : Array vide → Record vide

### Préservation de données

- **Champs inconnus** : Extraits et restaurés intégralement
- **Config legacy** : Stockée dans `typeSpecific` pour structures non-Jigsaw
- **Pool aliases** : Conversion bidirectionnelle parfaite

### Types supportés

Le système supporte tous les types de structures Minecraft 1.21+ avec détection
automatique du format approprié (Jigsaw vs Legacy).

Ce système permet une manipulation intuitive des structures complexes tout en
préservant l'intégrité et la compatibilité des données.
