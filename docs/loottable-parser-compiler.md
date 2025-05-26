# LootTable Parser/Compiler

Le système LootTable transforme les tables de loot Minecraft complexes et
imbriquées en format Voxel plat et gérable. C'est le deuxième système
implémenté, suivant le modèle des Enchantments.

## 🎯 Vue d'ensemble

```
Minecraft LootTable ←→ Format Voxel
        ↑                   ↓
    Compiler            Parser
```

- **Parser** : `LootDataDrivenToVoxelFormat` - Minecraft → Voxel
- **Compiler** : `VoxelToLootDataDriven` - Voxel → Minecraft

## 🏗️ Problème résolu

Les LootTables Minecraft sont **extrêmement complexes** :

- Structure arborescente profonde (pools → entries → children → children...)
- Groupes imbriqués (alternatives, group, sequence)
- Types d'entrées variés (item, tag, loot_table, dynamic)
- Conditions et fonctions à tous les niveaux

**Exemple Minecraft (complexe) :**

```json
{
    "pools": [{
        "entries": [{
            "type": "minecraft:alternatives",
            "children": [{
                "type": "minecraft:group",
                "children": [{
                    "type": "minecraft:sequence",
                    "children": [{
                        "type": "minecraft:item",
                        "name": "minecraft:diamond"
                    }]
                }]
            }]
        }]
    }]
}
```

**Format Voxel (plat) :**

```typescript
{
    items: [
        { id: "item_0", name: "minecraft:diamond", poolIndex: 0, entryIndex: 0 }
    ],
    groups: [
        { id: "group_0", type: "alternatives", items: ["group_1"], poolIndex: 0 },
        { id: "group_1", type: "group", items: ["group_2"], poolIndex: 0 },
        { id: "group_2", type: "sequence", items: ["item_0"], poolIndex: 0 }
    ]
}
```

## 📥 Parser : Minecraft → Voxel

### Fonction : `LootDataDrivenToVoxelFormat`

Transforme une LootTable Minecraft en format Voxel plat.

```typescript
const voxelLoot = LootDataDrivenToVoxelFormat({
    element: minecraftLootTable,
    configurator: "1.21",
});
```

### Algorithme de parsing

#### 1. **Parcours récursif des pools**

```typescript
clone.data.pools?.forEach((pool, poolIndex) => {
    pool.entries?.forEach((entry, entryIndex) => {
        processEntry(entry, poolIndex, entryIndex);
    });
});
```

#### 2. **Traitement par type d'entrée**

```typescript
const processEntry = (
    entry: MinecraftLootEntry,
    poolIndex: number,
    entryIndex: number,
) => {
    switch (entry.type) {
        case "minecraft:item":
        case "item": {
            // Créer un LootItem
            const itemId = `item_${itemCounter++}`;
            items.push({
                id: itemId,
                name: entry.name || "",
                weight: entry.weight,
                quality: entry.quality,
                poolIndex,
                entryIndex,
            });
            break;
        }

        case "minecraft:alternatives":
        case "alternatives": {
            // Créer un LootGroup et traiter les enfants
            const groupId = `group_${groupCounter++}`;
            const childItemIds: string[] = [];

            for (const child of entry.children || []) {
                // Traitement récursif des enfants
                processChildEntry(child);
            }

            groups.push({
                id: groupId,
                type: "alternatives",
                items: childItemIds,
                poolIndex,
                entryIndex,
            });
            break;
        }
            // ... autres types
    }
};
```

#### 3. **Gestion des types d'items**

Le parser détecte automatiquement le type d'item :

```typescript
// Item normal
if (entry.type === "minecraft:item") {
    name = entry.name; // "minecraft:diamond"
}

// Tag
if (entry.type === "minecraft:tag") {
    name = `#${entry.name}`; // "#minecraft:ores"
}

// LootTable référence
if (entry.type === "minecraft:loot_table") {
    name = entry.name; // "minecraft:chests/village_blacksmith"
}

// Dynamic (contenu de conteneur)
if (entry.type === "minecraft:dynamic") {
    name = "minecraft:contents";
}
```

#### 4. **Traitement récursif des groupes imbriqués**

```typescript
const processChildEntry = (childEntry: MinecraftLootEntry): string => {
    if (childEntry.type === "minecraft:item") {
        // Créer item et retourner son ID
        return createItem(childEntry);
    }

    if (childEntry.type?.includes("group")) {
        // Créer groupe imbriqué et retourner son ID
        const nestedGroupId = `group_${groupCounter++}`;
        const nestedChildIds: string[] = [];

        for (const grandChild of childEntry.children || []) {
            const grandChildId = processChildEntry(grandChild); // Récursion
            nestedChildIds.push(grandChildId);
        }

        groups.push({
            id: nestedGroupId,
            type: childEntry.type.replace("minecraft:", ""),
            items: nestedChildIds,
            poolIndex,
            entryIndex,
        });

        return nestedGroupId;
    }
};
```

### Structure de sortie

```typescript
interface LootTableProps {
    identifier: IdentifierObject;
    type?: string; // "minecraft:entity", "minecraft:chest", etc.
    items: LootItem[];
    groups: LootGroup[];
    randomSequence?: string;
}

interface LootItem {
    id: string; // "item_0", "item_1", etc.
    name: string; // "minecraft:diamond", "#minecraft:ores", etc.
    weight?: number;
    quality?: number;
    conditions?: string[];
    functions?: string[];
    poolIndex: number;
    entryIndex: number;
}

interface LootGroup {
    id: string; // "group_0", "group_1", etc.
    type: "alternatives" | "group" | "sequence";
    items: string[]; // IDs des items/groupes enfants
    conditions?: string[];
    poolIndex: number;
    entryIndex: number;
}
```

## 📤 Compiler : Voxel → Minecraft

### Fonction : `VoxelToLootDataDriven`

Reconstruit une LootTable Minecraft valide à partir du format Voxel.

```typescript
const result = VoxelToLootDataDriven(
    voxelLoot,
    "loot_table", // config key
    originalMinecraftLoot, // optionnel pour merge
);
```

### Algorithme de compilation

#### 1. **Reconstruction des pools**

```typescript
// Identifier tous les pools nécessaires
const maxPoolIndex = Math.max(
    ...props.items.map((i) => i.poolIndex),
    ...props.groups.map((g) => g.poolIndex),
    -1,
);

// Initialiser les pools
for (let i = 0; i <= maxPoolIndex; i++) {
    poolMap.set(i, {
        rolls: original?.pools?.[i]?.rolls || { min: 1, max: 1 },
        entries: [],
    });
}
```

#### 2. **Identification des items dans les groupes**

```typescript
// Éviter la duplication : items dans groupes ne vont pas directement dans pools
const itemsInGroups = new Set<string>();

for (const group of props.groups) {
    for (const itemId of group.items) {
        itemsInGroups.add(itemId);
    }
}
```

#### 3. **Ajout des items standalone**

```typescript
for (const item of props.items) {
    if (itemsInGroups.has(item.id)) continue; // Skip items in groups

    const pool = poolMap.get(item.poolIndex);
    if (!pool) continue;

    // Déterminer le type d'entrée
    let entryType = "minecraft:item";
    let entryName = item.name;

    if (item.name.startsWith("#")) {
        entryType = "minecraft:tag";
        entryName = item.name.substring(1);
    } else if (item.name.includes("/")) {
        entryType = "minecraft:loot_table";
    }

    pool.entries.push({
        type: entryType,
        name: entryName,
        weight: item.weight,
        quality: item.quality,
    });
}
```

#### 4. **Reconstruction récursive des groupes**

```typescript
const buildGroupEntry = (group: LootGroup): MinecraftLootEntry => {
    const children: MinecraftLootEntry[] = [];

    for (const itemId of group.items) {
        // Vérifier si c'est un groupe imbriqué
        const nestedGroup = props.groups.find((g) => g.id === itemId);
        if (nestedGroup) {
            children.push(buildGroupEntry(nestedGroup)); // Récursion
            continue;
        }

        // C'est un item normal
        const item = props.items.find((i) => i.id === itemId);
        if (!item) continue;

        children.push({
            type: determineEntryType(item.name),
            name: cleanItemName(item.name),
            weight: item.weight,
            quality: item.quality,
        });
    }

    return {
        type: `minecraft:${group.type}`,
        children,
    };
};
```

#### 5. **Ajout des groupes top-level**

```typescript
for (const group of props.groups) {
    // Ne traiter que les groupes qui ne sont pas enfants d'autres groupes
    const isChildGroup = props.groups.some((otherGroup) =>
        otherGroup.id !== group.id && otherGroup.items.includes(group.id)
    );

    if (isChildGroup) continue;

    const pool = poolMap.get(group.poolIndex);
    if (!pool) continue;

    const groupEntry = buildGroupEntry(group);
    pool.entries.push(groupEntry);
}
```

### Structure de sortie

```typescript
{
    element: {
        data: MinecraftLootTable, // Format Minecraft complet
        identifier: IdentifierObject
    },
    tags: IdentifierObject[] // Toujours vide pour LootTables
}
```

## 🔄 Round-trip : Intégrité des données

Le système garantit qu'une LootTable peut faire l'aller-retour sans perte :

```typescript
// Test d'intégrité
const original = minecraftLootTable;
const voxel = LootDataDrivenToVoxelFormat({ element: original });
const reconstructed = VoxelToLootDataDriven(voxel, "loot_table", original);

// reconstructed.element.data ≈ original.data (structure préservée)
```

## 🧩 Gestion des cas complexes

### 1. **Groupes imbriqués profonds**

```
alternatives
  └── group
      └── sequence
          └── item
```

Devient :

```typescript
groups: [
    { id: "group_0", type: "alternatives", items: ["group_1"] },
    { id: "group_1", type: "group", items: ["group_2"] },
    { id: "group_2", type: "sequence", items: ["item_0"] }
],
items: [
    { id: "item_0", name: "minecraft:diamond" }
]
```

### 2. **Multi-pools**

```typescript
// Pool 0: Armes
items: [
    { id: "item_0", name: "minecraft:sword", poolIndex: 0 }
],

// Pool 1: Armures  
items: [
    { id: "item_1", name: "minecraft:helmet", poolIndex: 1 }
],

// Pool 2: Outils
items: [
    { id: "item_2", name: "minecraft:pickaxe", poolIndex: 2 }
]
```

### 3. **Types d'entrées mixtes**

```typescript
items: [
    { id: "item_0", name: "minecraft:diamond" }, // item
    { id: "item_1", name: "#minecraft:ores" }, // tag
    { id: "item_2", name: "minecraft:chests/village" }, // loot_table
    { id: "item_3", name: "minecraft:contents" }, // dynamic
];
```

## 💡 Avantages du système

### 1. **Simplicité drastique**

- Structure plate vs arbre complexe
- IDs explicites pour les références
- Pas de navigation dans les enfants

### 2. **Manipulation facile**

- Ajouter/supprimer items : simple push/filter
- Réorganiser groupes : modifier les arrays `items`
- Changer types : modifier la propriété `type`

### 3. **Debugging simplifié**

- Structure visible d'un coup d'œil
- IDs traçables
- Pas de récursion pour lire

### 4. **UI-friendly**

- Parfait pour des interfaces drag & drop
- Facile de représenter visuellement
- Actions atomiques sur items/groupes

## 🧪 Exemples d'utilisation

### Parser une LootTable complexe

```typescript
const minecraftLoot = {
    data: {
        type: "minecraft:entity",
        pools: [{
            rolls: { min: 1, max: 3 },
            entries: [{
                type: "minecraft:alternatives",
                children: [{
                    type: "minecraft:item",
                    name: "minecraft:diamond",
                    weight: 1,
                }, {
                    type: "minecraft:group",
                    children: [{
                        type: "minecraft:item",
                        name: "minecraft:emerald",
                        weight: 5,
                    }, {
                        type: "minecraft:tag",
                        name: "minecraft:ores",
                        weight: 10,
                    }],
                }],
            }],
        }],
    },
    identifier: {
        namespace: "custom",
        registry: "loot_table",
        resource: "treasure",
    },
};

const voxel = LootDataDrivenToVoxelFormat({ element: minecraftLoot });
// voxel.items.length === 3 (diamond, emerald, #ores)
// voxel.groups.length === 2 (alternatives, group)
```

### Compiler vers Minecraft

```typescript
const voxelLoot = {
    identifier: {
        namespace: "custom",
        registry: "loot_table",
        resource: "simple",
    },
    type: "minecraft:chest",
    items: [
        {
            id: "item_0",
            name: "minecraft:gold_ingot",
            weight: 10,
            poolIndex: 0,
            entryIndex: 0,
        },
        {
            id: "item_1",
            name: "minecraft:iron_ingot",
            weight: 20,
            poolIndex: 0,
            entryIndex: 1,
        },
    ],
    groups: [{
        id: "group_0",
        type: "alternatives",
        items: ["item_0", "item_1"],
        poolIndex: 0,
        entryIndex: 0,
    }],
};

const result = VoxelToLootDataDriven(voxelLoot, "loot_table");
// result.element.data contient la LootTable Minecraft complète
```

## 🔧 Maintenance et évolution

### Ajouter un nouveau type d'entrée

1. **Parser** : Ajouter case dans `processEntry()`
2. **Compiler** : Ajouter logique dans `determineEntryType()`
3. **Tests** : Vérifier le round-trip

### Gérer de nouvelles propriétés

1. **Interface** : Ajouter à `LootItem` ou `LootGroup`
2. **Parser** : Extraire depuis l'entrée Minecraft
3. **Compiler** : Reconstruire vers Minecraft
4. **Actions** : Ajouter actions spécifiques si nécessaire

## 🔍 Gestion des items identiques

### Problème : Items avec même nom mais propriétés différentes

Un cas d'usage courant est d'avoir **plusieurs items identiques** dans une loot
table mais avec des **propriétés différentes** :

- Diamant rare (1% chance, quality 10) vs diamant commun (50% chance, quality 0)
- Épée endommagée vs épée parfaite
- Même item avec conditions différentes (killed_by_player vs random_chance)

### Solution VoxelBreeze : IDs uniques

VoxelBreeze résout ce problème en assignant un **ID unique** à chaque item, même
si le nom est identique :

```typescript
// Exemple : 3 diamants avec propriétés différentes
items: [
    {
        id: "item_0", // ID unique
        name: "minecraft:diamond",
        weight: 1, // Rare
        quality: 10, // Haute qualité
        poolIndex: 0,
        conditions: ["minecraft:random_chance"],
    },
    {
        id: "item_1", // ID unique différent
        name: "minecraft:diamond", // Même nom
        weight: 50, // Commun
        quality: 0, // Pas de qualité
        poolIndex: 0,
        conditions: ["minecraft:killed_by_player"],
    },
    {
        id: "item_2", // Troisième ID unique
        name: "minecraft:diamond", // Même nom
        weight: 25, // Moyen
        quality: 5, // Qualité moyenne
        poolIndex: 1, // Pool différent
        conditions: [], // Pas de conditions
    },
];
```

### Comportement du système

#### 1. **Parsing : Préservation des propriétés**

Lors du parsing d'une LootTable Minecraft complexe, chaque entrée devient un
item unique :

```typescript
// Minecraft JSON (complexe)
{
    "pools": [{
        "entries": [{
            "type": "minecraft:alternatives",
            "children": [
                {
                    "type": "minecraft:item",
                    "name": "minecraft:diamond",
                    "weight": 1,
                    "quality": 10
                },
                {
                    "type": "minecraft:item", 
                    "name": "minecraft:diamond",  // Même nom
                    "weight": 50,
                    "quality": 0                  // Propriétés différentes
                }
            ]
        }]
    }]
}

// Format Voxel (plat)
{
    items: [
        { id: "item_0", name: "minecraft:diamond", weight: 1, quality: 10 },
        { id: "item_1", name: "minecraft:diamond", weight: 50, quality: 0 }
    ],
    groups: [
        { id: "group_0", type: "alternatives", items: ["item_0", "item_1"] }
    ]
}
```

#### 2. **Compilation : Reconstruction fidèle**

Lors de la compilation vers Minecraft, chaque item unique est reconstruit avec
ses propriétés :

```typescript
// Le compilateur génère correctement :
{
    "type": "minecraft:alternatives",
    "children": [
        {
            "type": "minecraft:item",
            "name": "minecraft:diamond",
            "weight": 1,
            "quality": 10        // ✅ Propriétés préservées
        },
        {
            "type": "minecraft:item",
            "name": "minecraft:diamond",
            "weight": 50,
            "quality": 0         // ✅ Même avec quality: 0
        }
    ]
}
```

#### 3. **Actions : Manipulation individuelle**

Chaque item peut être modifié indépendamment grâce à son ID unique :

```typescript
// Modifier seulement le diamant rare
updateData(
    {
        type: "modify_loot_item",
        field: "items",
        itemId: "item_0", // ID spécifique
        property: "weight",
        value: 2, // Doubler la rareté
    },
    lootTable,
    1,
);

// Le diamant commun (item_1) reste inchangé
```

#### 4. **Groupes : Références par ID**

Les groupes peuvent contenir des items identiques mais avec propriétés
différentes :

```typescript
groups: [
    {
        id: "group_0",
        type: "alternatives",
        items: ["item_0", "item_1"], // Deux diamants différents
    },
    {
        id: "group_1",
        type: "sequence",
        items: ["item_2"], // Troisième diamant seul
    },
];
```

### Cas d'usage réels

#### 1. **Loot conditionnel**

```typescript
// Diamant pour joueur qui tue vs diamant aléatoire
items: [
    {
        id: "item_0",
        name: "minecraft:diamond",
        weight: 100,
        conditions: ["minecraft:killed_by_player"],
        functions: ["minecraft:enchant_randomly"],
    },
    {
        id: "item_1",
        name: "minecraft:diamond",
        weight: 1,
        conditions: ["minecraft:random_chance"],
        functions: ["minecraft:set_count"],
    },
];
```

#### 2. **Items endommagés vs parfaits**

```typescript
items: [
    {
        id: "item_0",
        name: "minecraft:iron_sword",
        functions: ["minecraft:set_damage"], // Endommagée
    },
    {
        id: "item_1",
        name: "minecraft:iron_sword",
        functions: ["minecraft:enchant_randomly"], // Parfaite + enchantée
    },
];
```

#### 3. **Pools multiples**

```typescript
// Pool 0: Loot principal
{ id: "item_0", name: "minecraft:gold_ingot", poolIndex: 0, weight: 10 },

// Pool 1: Loot bonus (même item, propriétés différentes)
{ id: "item_1", name: "minecraft:gold_ingot", poolIndex: 1, weight: 100 }
```

### Avantages de cette approche

1. **🎯 Précision** : Chaque item garde ses propriétés exactes
2. **🔧 Flexibilité** : Modification individuelle possible
3. **🏗️ Simplicité** : Pas de logique complexe de fusion/séparation
4. **✅ Fiabilité** : Round-trip parfait sans perte de données
5. **🎮 Réalisme** : Correspond aux besoins réels des créateurs de contenu

### Test de validation

Un test complet de 250+ lignes valide ce comportement :

```typescript
it("should handle identical items with different properties", () => {
    // Ajoute 3 diamants avec propriétés différentes
    // Vérifie que chacun garde ses propriétés
    // Teste la création de groupes avec items identiques
    // Valide la compilation fidèle

    expect(diamonds).toHaveLength(3);
    expect(new Set(diamondIds).size).toBe(3); // Tous IDs uniques
    expect(compiled.element.data.pools).toHaveLength(2); // Structure préservée
});
```

Le système LootTable est conçu pour gérer la complexité de Minecraft tout en
offrant une interface simple ! 🎯
