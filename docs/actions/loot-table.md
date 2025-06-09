# Actions Loot Table - Domaine des tables de loot

## Vue d'ensemble

Le domaine `loot_table` fournit des actions pour manipuler les tables de loot
Minecraft utilisant le format Voxel aplati. Ces actions permettent de gérer
items, groupes et pools avec des structures simplifiées.

## Actions pour les items

### `loot_table.add_loot_item`

Ajoute un nouvel item dans un pool spécifique.

**Signature** :

```typescript
{
    type: "loot_table.add_loot_item";
    poolIndex: number;
    item: {
        name: string;
        weight?: number;
        quality?: number;
        conditions?: string[];
        functions?: string[];
    };
}
```

**Exemples** :

```typescript
// Ajouter un item simple
const action = {
    type: "loot_table.add_loot_item",
    poolIndex: 0,
    item: {
        name: "minecraft:diamond",
        weight: 5,
    },
};

// Ajouter un item avec fonctions et conditions
const action = {
    type: "loot_table.add_loot_item",
    poolIndex: 0,
    item: {
        name: "minecraft:iron_ingot",
        weight: 10,
        quality: 2,
        functions: ["minecraft:set_count"],
        conditions: ["minecraft:killed_by_player"],
    },
};
```

**Résultat** :

- Génère automatiquement un ID unique (`item_0`, `item_1`, etc.)
- Place l'item dans le pool spécifié

### `loot_table.remove_loot_item`

Supprime un item par son ID.

**Signature** :

```typescript
{
    type: "loot_table.remove_loot_item";
    itemId: string;
}
```

**Exemples** :

```typescript
const action = {
    type: "loot_table.remove_loot_item",
    itemId: "item_5",
};
```

**Résultat** :

- Supprime l'item de tous les pools et groupes
- Nettoie les groupes vides automatiquement

### `loot_table.modify_loot_item`

Modifie une propriété spécifique d'un item.

**Signature** :

```typescript
{
    type: "loot_table.modify_loot_item";
    itemId: string;
    property: "name" | "weight" | "quality";
    value: unknown;
}
```

**Exemples** :

```typescript
// Changer le nom d'un item
const action = {
    type: "loot_table.modify_loot_item",
    itemId: "item_3",
    property: "name",
    value: "minecraft:emerald",
};

// Modifier le poids
const action = {
    type: "loot_table.modify_loot_item",
    itemId: "item_3",
    property: "weight",
    value: 15,
};

// Modifier la qualité
const action = {
    type: "loot_table.modify_loot_item",
    itemId: "item_3",
    property: "quality",
    value: 3,
};
```

### `loot_table.duplicate_loot_item`

Crée une copie d'un item existant.

**Signature** :

```typescript
{
    type: "loot_table.duplicate_loot_item";
    itemId: string;
    targetPoolIndex?: number;
}
```

**Exemples** :

```typescript
// Duplication dans le même pool
const action = {
    type: "loot_table.duplicate_loot_item",
    itemId: "item_2",
};

// Duplication vers un autre pool
const action = {
    type: "loot_table.duplicate_loot_item",
    itemId: "item_2",
    targetPoolIndex: 1,
};
```

**Résultat** :

- Crée une copie exacte avec un nouvel ID
- Peut être placée dans un pool différent

### `loot_table.bulk_modify_items`

Modifie plusieurs items en une seule opération.

**Signature** :

```typescript
{
    type: "loot_table.bulk_modify_items";
    itemIds: string[];
    property: "weight" | "quality";
    operation: "multiply" | "add" | "set";
    value: number;
}
```

**Exemples** :

```typescript
// Doubler le poids de plusieurs items
const action = {
    type: "loot_table.bulk_modify_items",
    itemIds: ["item_1", "item_2", "item_3"],
    property: "weight",
    operation: "multiply",
    value: 2,
};

// Définir une qualité fixe
const action = {
    type: "loot_table.bulk_modify_items",
    itemIds: ["item_4", "item_5"],
    property: "quality",
    operation: "set",
    value: 5,
};

// Ajouter du poids
const action = {
    type: "loot_table.bulk_modify_items",
    itemIds: ["item_6"],
    property: "weight",
    operation: "add",
    value: 10,
};
```

## Actions pour les groupes

### `loot_table.create_loot_group`

Crée un nouveau groupe avec des items existants.

**Signature** :

```typescript
{
    type: "loot_table.create_loot_group";
    groupType: "alternatives" | "group" | "sequence";
    itemIds: string[];
    poolIndex: number;
    entryIndex?: number;
}
```

**Exemples** :

```typescript
// Groupe d'alternatives
const action = {
    type: "loot_table.create_loot_group",
    groupType: "alternatives",
    itemIds: ["item_1", "item_2", "item_3"],
    poolIndex: 0,
};

// Groupe séquentiel avec position
const action = {
    type: "loot_table.create_loot_group",
    groupType: "sequence",
    itemIds: ["item_4", "item_5"],
    poolIndex: 1,
    entryIndex: 2,
};
```

**Résultat** :

- Génère un ID unique (`group_0`, `group_1`, etc.)
- Regroupe les items spécifiés

### `loot_table.modify_loot_group`

Modifie un groupe existant.

**Signature** :

```typescript
{
    type: "loot_table.modify_loot_group";
    groupId: string;
    operation: "add_item" | "remove_item" | "change_type";
    value: unknown;
}
```

**Exemples** :

```typescript
// Ajouter un item au groupe
const action = {
    type: "loot_table.modify_loot_group",
    groupId: "group_0",
    operation: "add_item",
    value: "item_6",
};

// Supprimer un item du groupe
const action = {
    type: "loot_table.modify_loot_group",
    groupId: "group_0",
    operation: "remove_item",
    value: "item_2",
};

// Changer le type de groupe
const action = {
    type: "loot_table.modify_loot_group",
    groupId: "group_0",
    operation: "change_type",
    value: "group",
};
```

### `loot_table.dissolve_loot_group`

Supprime un groupe en gardant ses items.

**Signature** :

```typescript
{
    type: "loot_table.dissolve_loot_group";
    groupId: string;
}
```

**Exemples** :

```typescript
const action = {
    type: "loot_table.dissolve_loot_group",
    groupId: "group_2",
};
```

**Résultat** :

- Supprime le groupe
- Garde tous les items qu'il contenait
- Nettoie les références dans d'autres groupes

### `loot_table.convert_item_to_group`

Convertit un item en groupe.

**Signature** :

```typescript
{
    type: "loot_table.convert_item_to_group";
    itemId: string;
    groupType: "alternatives" | "group" | "sequence";
    additionalItems?: string[];
}
```

**Exemples** :

```typescript
// Convertir un item seul
const action = {
    type: "loot_table.convert_item_to_group",
    itemId: "item_7",
    groupType: "alternatives",
};

// Convertir et ajouter d'autres items
const action = {
    type: "loot_table.convert_item_to_group",
    itemId: "item_7",
    groupType: "group",
    additionalItems: ["item_8", "item_9"],
};
```

### `loot_table.convert_group_to_item`

Convertit un groupe en gardant optionnellement le premier item.

**Signature** :

```typescript
{
    type: "loot_table.convert_group_to_item";
    groupId: string;
    keepFirstItem?: boolean;
}
```

**Exemples** :

```typescript
// Garder le premier item
const action = {
    type: "loot_table.convert_group_to_item",
    groupId: "group_1",
    keepFirstItem: true,
};

// Supprimer tous les items
const action = {
    type: "loot_table.convert_group_to_item",
    groupId: "group_1",
    keepFirstItem: false,
};
```

### `loot_table.nest_group_in_group`

Imbrique un groupe dans un autre.

**Signature** :

```typescript
{
    type: "loot_table.nest_group_in_group";
    childGroupId: string;
    parentGroupId: string;
    position?: number;
}
```

**Exemples** :

```typescript
// Imbriquer à la fin
const action = {
    type: "loot_table.nest_group_in_group",
    childGroupId: "group_2",
    parentGroupId: "group_0",
};

// Imbriquer à une position spécifique
const action = {
    type: "loot_table.nest_group_in_group",
    childGroupId: "group_3",
    parentGroupId: "group_1",
    position: 1,
};
```

### `loot_table.unnest_group`

Extrait un groupe de tous ses parents.

**Signature** :

```typescript
{
    type: "loot_table.unnest_group";
    groupId: string;
}
```

**Exemples** :

```typescript
const action = {
    type: "loot_table.unnest_group",
    groupId: "group_3",
};
```

## Actions de mouvement et organisation

### `loot_table.move_item_between_pools`

Déplace un item vers un autre pool.

**Signature** :

```typescript
{
    type: "loot_table.move_item_between_pools";
    itemId: string;
    targetPoolIndex: number;
}
```

**Exemples** :

```typescript
const action = {
    type: "loot_table.move_item_between_pools",
    itemId: "item_4",
    targetPoolIndex: 2,
};
```

### `loot_table.move_group_between_pools`

Déplace un groupe vers un autre pool.

**Signature** :

```typescript
{
    type: "loot_table.move_group_between_pools";
    groupId: string;
    targetPoolIndex: number;
}
```

**Exemples** :

```typescript
const action = {
    type: "loot_table.move_group_between_pools",
    groupId: "group_1",
    targetPoolIndex: 1,
};
```

### `loot_table.balance_weights`

Équilibre les poids des items dans un pool.

**Signature** :

```typescript
{
    type: "loot_table.balance_weights";
    poolIndex: number;
    targetTotal?: number;
}
```

**Exemples** :

```typescript
// Équilibrage avec total par défaut (100)
const action = {
    type: "loot_table.balance_weights",
    poolIndex: 0,
};

// Équilibrage avec total personnalisé
const action = {
    type: "loot_table.balance_weights",
    poolIndex: 1,
    targetTotal: 50,
};
```

**Résultat** :

- Distribue le poids total équitablement entre tous les items du pool
- Par défaut, utilise un total de 100

### `loot_table.conditional_loot`

Exécute des actions basées sur des conditions.

**Signature** :

```typescript
{
    type: "loot_table.conditional_loot";
    condition: {
        type: "pool_empty" | "item_count" | "group_exists";
        poolIndex?: number;
        itemId?: string;
        groupId?: string;
        count?: number;
    };
    thenAction: any;
    elseAction?: any;
}
```

**Exemples** :

```typescript
// Condition de pool vide
const action = {
    type: "loot_table.conditional_loot",
    condition: {
        type: "pool_empty",
        poolIndex: 0,
    },
    thenAction: {
        type: "loot_table.add_loot_item",
        poolIndex: 0,
        item: { name: "minecraft:dirt" },
    },
};

// Condition de nombre d'items
const action = {
    type: "loot_table.conditional_loot",
    condition: {
        type: "item_count",
        count: 10,
    },
    thenAction: {
        type: "loot_table.balance_weights",
        poolIndex: 0,
    },
    elseAction: {
        type: "loot_table.add_loot_item",
        poolIndex: 0,
        item: { name: "minecraft:stone" },
    },
};

// Condition d'existence de groupe
const action = {
    type: "loot_table.conditional_loot",
    condition: {
        type: "group_exists",
        groupId: "group_0",
    },
    thenAction: {
        type: "loot_table.dissolve_loot_group",
        groupId: "group_0",
    },
};
```

## Cas d'usage pratiques

### Création d'une table de base

```typescript
const createBasicTable = {
    type: "core.sequential",
    actions: [
        // Ajouter des items de base
        {
            type: "loot_table.add_loot_item",
            poolIndex: 0,
            item: {
                name: "minecraft:diamond",
                weight: 1,
            },
        },
        {
            type: "loot_table.add_loot_item",
            poolIndex: 0,
            item: {
                name: "minecraft:iron_ingot",
                weight: 5,
            },
        },
        {
            type: "loot_table.add_loot_item",
            poolIndex: 0,
            item: {
                name: "minecraft:coal",
                weight: 10,
            },
        },
        // Équilibrer les poids
        {
            type: "loot_table.balance_weights",
            poolIndex: 0,
            targetTotal: 100,
        },
    ],
};
```

### Restructuration avec groupes

```typescript
const restructureWithGroups = {
    type: "core.sequential",
    actions: [
        // Créer un groupe d'alternatives pour les métaux
        {
            type: "loot_table.create_loot_group",
            groupType: "alternatives",
            itemIds: ["item_0", "item_1"], // diamond et iron
            poolIndex: 0,
        },
        // Convertir coal en groupe pour futurs ajouts
        {
            type: "loot_table.convert_item_to_group",
            itemId: "item_2", // coal
            groupType: "group",
        },
        // Ajouter charcoal au groupe du coal
        {
            type: "loot_table.add_loot_item",
            poolIndex: 0,
            item: {
                name: "minecraft:charcoal",
                weight: 8,
            },
        },
        {
            type: "loot_table.modify_loot_group",
            groupId: "group_1", // coal group
            operation: "add_item",
            value: "item_3", // charcoal
        },
    ],
};
```

### Duplication et modification en masse

```typescript
const bulkOperations = {
    type: "core.sequential",
    actions: [
        // Dupliquer un item rare vers d'autres pools
        {
            type: "loot_table.duplicate_loot_item",
            itemId: "item_0", // diamond
            targetPoolIndex: 1,
        },
        {
            type: "loot_table.duplicate_loot_item",
            itemId: "item_0",
            targetPoolIndex: 2,
        },
        // Réduire le poids des copies
        {
            type: "loot_table.bulk_modify_items",
            itemIds: ["item_4", "item_5"], // copies
            property: "weight",
            operation: "multiply",
            value: 0.5,
        },
        // Augmenter la qualité de tous les diamants
        {
            type: "loot_table.bulk_modify_items",
            itemIds: ["item_0", "item_4", "item_5"],
            property: "quality",
            operation: "set",
            value: 10,
        },
    ],
};
```

### Nettoyage conditionnel

```typescript
const conditionalCleanup = {
    type: "core.sequential",
    actions: [
        // Si pool vide, ajouter item par défaut
        {
            type: "loot_table.conditional_loot",
            condition: {
                type: "pool_empty",
                poolIndex: 2,
            },
            thenAction: {
                type: "loot_table.add_loot_item",
                poolIndex: 2,
                item: {
                    name: "minecraft:dirt",
                    weight: 1,
                },
            },
        },
        // Si trop d'items, équilibrer
        {
            type: "loot_table.conditional_loot",
            condition: {
                type: "item_count",
                count: 20,
            },
            thenAction: {
                type: "loot_table.balance_weights",
                poolIndex: 0,
            },
        },
    ],
};
```

## Gestion des IDs

Les actions génèrent automatiquement des IDs séquentiels :

- **Items** : `item_0`, `item_1`, `item_2`, ...
- **Groupes** : `group_0`, `group_1`, `group_2`, ...

Ces IDs sont persistants et permettent de référencer les éléments dans les
actions suivantes.

## Limitations

- `conditional_loot` : Les actions imbriquées ne sont pas encore pleinement
  implémentées (retourne l'élément inchangé)
- Les pools doivent exister avant d'y ajouter des items
- La suppression de groupes nettoie automatiquement les références, mais pas les
  items orphelins

Ces actions offrent un contrôle fin sur les tables de loot avec une approche
simple et prévisible.
