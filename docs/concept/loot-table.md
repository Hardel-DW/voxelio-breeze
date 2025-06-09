# Guide Loot Table - Parsing et Compiling

## Vue d'ensemble

Ce guide explique la conversion bidirectionnelle entre le format Minecraft
complexe (pools/entries hiérarchiques) et le format Voxel simplifié (items et
groupes plats).

## Parsing : Minecraft → Voxel

### Fonction principale

```typescript
import { LootDataDrivenToVoxelFormat } from "@voxelio/breeze/core";

const voxelLootTable = LootDataDrivenToVoxelFormat({
  element: minecraftElement,
  configurator: "my_tool",
});
```

### Aplatissement de la structure

Le parser transforme la structure hiérarchique Minecraft en format plat :

**Entrée Minecraft** :

```json
{
  "type": "minecraft:chest",
  "pools": [
    {
      "rolls": 3,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "minecraft:diamond",
          "weight": 5
        },
        {
          "type": "minecraft:alternatives",
          "children": [
            {
              "type": "minecraft:item",
              "name": "minecraft:iron_ingot",
              "weight": 10
            },
            {
              "type": "minecraft:item",
              "name": "minecraft:gold_ingot",
              "weight": 5
            }
          ]
        }
      ]
    }
  ]
}
```

**Sortie Voxel** :

```typescript
{
  identifier: { namespace: "minecraft", resource: "example_chest" },
  type: "minecraft:chest",
  items: [
    {
      id: "item_0",
      name: "minecraft:diamond",
      entryType: "minecraft:item",
      weight: 5,
      poolIndex: 0,
      entryIndex: 0
    },
    {
      id: "item_1",
      name: "minecraft:iron_ingot",
      entryType: "minecraft:item",
      weight: 10,
      poolIndex: 0,
      entryIndex: 1
    },
    {
      id: "item_2",
      name: "minecraft:gold_ingot",
      entryType: "minecraft:item",
      weight: 5,
      poolIndex: 0,
      entryIndex: 1
    }
  ],
  groups: [
    {
      id: "group_0",
      type: "alternatives",
      items: ["item_1", "item_2"],
      poolIndex: 0,
      entryIndex: 1
    }
  ],
  pools: [
    {
      poolIndex: 0,
      rolls: 3
    }
  ],
  override: "my_tool"
}
```

### Algorithme de parsing

Le parser utilise une fonction récursive `processEntry` qui :

1. **Détermine le type** : groupe vs item selon `entry.type`
2. **Génère des IDs uniques** : `item_${itemCounter++}` ou
   `group_${groupCounter++}`
3. **Traite récursivement** : pour les groupes, traite tous les `children`
4. **Préserve les métadonnées** : conditions, functions, champs inconnus

```typescript
function processEntry(
  entry: MinecraftLootEntry,
  poolIndex: number,
  entryIndex: number,
): string {
  const isGroup = entry.type.includes("alternatives") ||
    entry.type.includes("group") ||
    entry.type.includes("sequence");

  if (isGroup) {
    const groupId = `group_${groupCounter++}`;
    const childIds = entry.children?.map((child) =>
      processEntry(child, poolIndex, entryIndex)
    ) || [];
    // Créer le groupe...
    return groupId;
  }

  const itemId = `item_${itemCounter++}`;
  // Créer l'item...
  return itemId;
}
```

### Types d'entries supportés

**Items standards** :

```typescript
// minecraft:item
{ type: "minecraft:item", name: "minecraft:diamond" }
→ { id: "item_0", name: "minecraft:diamond", entryType: "minecraft:item" }
```

**Tags** :

```typescript
// minecraft:tag (ajout automatique du #)
{ type: "minecraft:tag", name: "minecraft:logs" }
→ { id: "item_1", name: "#minecraft:logs", entryType: "minecraft:tag" }
```

**Tables imbriquées** :

```typescript
// Référence string
{ type: "minecraft:loot_table", name: "minecraft:chests/bonus" }
→ { id: "item_2", name: "minecraft:chests/bonus", entryType: "minecraft:loot_table" }

// Objet embarqué
{ type: "minecraft:loot_table", value: { pools: [...] } }
→ { id: "item_3", name: "embedded_table", value: { pools: [...] } }
```

**Entries vides** :

```typescript
{ type: "minecraft:empty" }
→ { id: "item_4", name: "minecraft:empty", entryType: "minecraft:empty" }
```

### Types de groupes

**Alternatives** (un seul sélectionné) :

```typescript
{ type: "minecraft:alternatives", children: [...] }
→ { id: "group_0", type: "alternatives", items: ["item_0", "item_1"] }
```

**Group** (tous sélectionnés) :

```typescript
{ type: "minecraft:group", children: [...] }
→ { id: "group_1", type: "group", items: ["item_2", "item_3"] }
```

**Sequence** (jusqu'au premier échec) :

```typescript
{ type: "minecraft:sequence", children: [...] }
→ { id: "group_2", type: "sequence", items: ["item_4", "item_5"] }
```

### Préservation des métadonnées

**Données de pool** :

```typescript
// Extraites automatiquement
pools: [
  {
    poolIndex: 0,
    rolls: 3,
    bonus_rolls: 1,           // si défini
    functions: [...],         // si présentes
    conditions: [...],        // si présentes
    unknownFields: {...}      // champs de mods
  }
]
```

**Fonctions et conditions** :

```typescript
// Préservées au niveau item/groupe
{
  id: "item_0",
  name: "minecraft:diamond",
  conditions: [{ condition: "minecraft:random_chance", chance: 0.3 }],
  functions: [{ function: "minecraft:set_count", count: { min: 1, max: 3 } }]
}
```

**Champs inconnus** :

```typescript
// Champs de mods préservés avec extractUnknownFields()
unknownFields: {
  "mymod:custom_property": "value",
  "forge:custom_data": { ... }
}
```

## Compiling : Voxel → Minecraft

### Fonction principale

```typescript
import { VoxelToLootDataDriven } from "@voxelio/breeze/core";

const { element, tags } = VoxelToLootDataDriven(
  voxelLootTable,
  "loot_table", // config
  originalMinecraftElement, // optionnel
);
```

### Reconstruction hiérarchique

Le compiler reconstruit la structure Minecraft en plusieurs étapes :

**1. Construction des lookup maps** :

```typescript
const itemMap = new Map(element.items.map((item) => [item.id, item]));
const groupMap = new Map(element.groups.map((group) => [group.id, group]));
const poolDataMap = new Map(element.pools?.map((p) => [p.poolIndex, p]) || []);
```

**2. Détermination du nombre de pools** :

```typescript
const maxPool = Math.max(
  ...element.items.map((i) => i.poolIndex),
  ...element.groups.map((g) => g.poolIndex),
  ...(element.pools?.map((p) => p.poolIndex) || []),
  (original?.pools?.length || 1) - 1,
  0,
);
```

**3. Initialisation des pools** :

```typescript
const pools = Array.from({ length: maxPool + 1 }, (_, i) => {
  const poolData = poolDataMap.get(i);
  return {
    rolls: poolData?.rolls ?? 1,
    bonus_rolls: poolData?.bonus_rolls,
    entries: [],
  };
});
```

**4. Ajout des entries** :

```typescript
// Items standalone (pas dans des groupes)
const itemsInGroups = new Set(element.groups.flatMap((g) => g.items));
for (const item of element.items) {
  if (!itemsInGroups.has(item.id)) {
    pools[item.poolIndex]?.entries.push(buildEntry(item));
  }
}

// Groupes top-level (pas enfants d'autres groupes)
const childGroups = new Set(
  element.groups.flatMap((g) => g.items).filter((id) => groupMap.has(id)),
);
for (const group of element.groups) {
  if (!childGroups.has(group.id)) {
    pools[group.poolIndex]?.entries.push(
      buildGroupEntry(group, itemMap, groupMap),
    );
  }
}
```

### Construction des entries

**Items simples** :

```typescript
function buildEntry(item: LootItem): MinecraftLootEntry {
  const entryType = item.entryType || "minecraft:item";

  const entry = {
    type: entryType,
    ...(item.weight && { weight: item.weight }),
    ...(item.conditions?.length && { conditions: item.conditions }),
    ...item.unknownFields,
  };

  // Logique name/value selon le type
  if (entryType === "minecraft:loot_table") {
    entry.value = item.value ?? item.name;
  } else if (entryType === "minecraft:tag") {
    entry.name = item.name.replace(/^#/, "");
  } else if (entryType !== "minecraft:empty") entry.name = item.name;

  return entry;
}
```

**Groupes récursifs** :

```typescript
function buildGroupEntry(
  group: LootGroup,
  itemMap,
  groupMap,
): MinecraftLootEntry {
  return {
    type: `minecraft:${group.type}`,
    children: group.items
      .map((id) => {
        const nestedGroup = groupMap.get(id);
        if (nestedGroup) return buildGroupEntry(nestedGroup, itemMap, groupMap);

        const item = itemMap.get(id);
        return item ? buildEntry(item) : null;
      })
      .filter((entry) => entry !== null),
    ...(group.conditions?.length && { conditions: group.conditions }),
    ...group.unknownFields,
  };
}
```

### Exemple de reconstruction

**Entrée Voxel** :

```typescript
{
  items: [
    { id: "item_0", name: "minecraft:diamond", poolIndex: 0, entryIndex: 0 },
    { id: "item_1", name: "minecraft:iron_ingot", poolIndex: 0, entryIndex: 1 }
  ],
  groups: [
    { id: "group_0", type: "alternatives", items: ["item_0", "item_1"], poolIndex: 0 }
  ],
  pools: [{ poolIndex: 0, rolls: 3 }]
}
```

**Sortie Minecraft** :

```json
{
  "pools": [
    {
      "rolls": 3,
      "entries": [
        {
          "type": "minecraft:alternatives",
          "children": [
            { "type": "minecraft:item", "name": "minecraft:diamond" },
            { "type": "minecraft:item", "name": "minecraft:iron_ingot" }
          ]
        }
      ]
    }
  ]
}
```

## Optimisations de performance

### Lookup maps O(1)

```typescript
// Accès constant au lieu de recherche linéaire
const itemMap = new Map(element.items.map((item) => [item.id, item]));
const groupMap = new Map(element.groups.map((group) => [group.id, group]));
```

### Détection intelligente

```typescript
// Évite le traitement des items déjà dans des groupes
const itemsInGroups = new Set(element.groups.flatMap((g) => g.items));

// Évite le traitement des groupes enfants
const childGroups = new Set(
  element.groups.flatMap((g) => g.items).filter((id) => groupMap.has(id)),
);
```

### Création conditionnelle

```typescript
// Propriétés ajoutées seulement si nécessaire
...(item.weight && { weight: item.weight }),
...(item.conditions?.length && { conditions: item.conditions }),
```

## Cas d'usage pratiques

### Ajout d'item simple

```typescript
const newItem = {
  id: "item_new",
  name: "minecraft:netherite_ingot",
  entryType: "minecraft:item",
  weight: 1,
  poolIndex: 0,
  entryIndex: 99,
};

const modified = {
  ...originalTable,
  items: [...originalTable.items, newItem],
};
```

### Création de groupe

```typescript
const alternatives = {
  id: "group_new",
  type: "alternatives" as const,
  items: ["item_1", "item_2"],
  poolIndex: 0,
  entryIndex: 0,
};

const modified = {
  ...originalTable,
  groups: [...originalTable.groups, alternatives],
};
```

### Modification de pool

```typescript
const modifiedPools = originalTable.pools?.map((pool) =>
  pool.poolIndex === 0 ? { ...pool, rolls: 5 } : pool
);
```

## Comportements importants

### Gestion des types d'entry

- Le parser préserve `entryType` pour reconstruction fidèle
- Le compiler utilise `entryType || "minecraft:item"` par défaut
- Actions peuvent créer des items sans `entryType`

### Préservation des champs inconnus

```typescript
// Extraction automatique des champs non-standards
const unknownFields = extractUnknownFields(obj, KNOWN_ENTRY_FIELDS);

// Restauration lors du compiling
...item.unknownFields
```

### Gestion des références

- Items dans groupes : exclus des pools directs
- Groupes enfants : exclus des groupes top-level
- IDs uniques garantis par compteurs incrémentaux

Ce système permet une manipulation intuitive des tables de loot complexes tout
en préservant l'intégrité des données.
