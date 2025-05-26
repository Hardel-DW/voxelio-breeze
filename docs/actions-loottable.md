# Actions LootTable

Les actions LootTable sont des opérations spécifiques aux tables de loot. Elles
permettent de manipuler les items, groupes, et pools de manière intuitive.
Toutes ces actions passent par `updateData()`.

## 🎯 Utilisation

```typescript
import { updateData } from "@/core/engine/actions";

const result = updateData(lootAction, lootTable, version);
```

## 📦 Actions sur les Items

### 1. `add_loot_item` - Ajouter un item

Ajoute un nouvel item à un pool spécifique.

```typescript
{
    type: "add_loot_item",
    field: "items",
    poolIndex: 0,
    item: {
        name: "minecraft:diamond",
        weight: 10,
        quality: 5,
        conditions: ["minecraft:random_chance"],
        functions: ["minecraft:set_count"]
    }
}
```

### 2. `remove_loot_item` - Supprimer un item

Supprime un item et le retire de tous les groupes qui le contiennent.
**Nettoyage automatique** : supprime aussi les groupes qui deviennent vides.

```typescript
{
    type: "remove_loot_item",
    field: "items",
    itemId: "item_0"
}
```

**Comportement en cascade :**

```typescript
// État initial
{
    items: [
        { id: "item_0", name: "minecraft:diamond" },
        { id: "item_1", name: "minecraft:emerald" }
    ],
    groups: [
        { id: "group_0", type: "alternatives", items: ["item_0"] },        // Seul item_0
        { id: "group_1", type: "group", items: ["item_0", "item_1"] }      // item_0 + item_1
    ]
}

// Action: remove_loot_item avec itemId: "item_0"
// Résultat:
{
    items: [
        { id: "item_1", name: "minecraft:emerald" }                       // item_0 supprimé
    ],
    groups: [
        // group_0 supprimé car il devient vide (items: [])
        { id: "group_1", type: "group", items: ["item_1"] }               // item_0 retiré de la liste
    ]
}
```

**Règle de nettoyage :** Un groupe est supprimé si `group.items.length === 0`
après retrait de l'item.

### 3. `modify_loot_item` - Modifier un item

Modifie une propriété spécifique d'un item.

```typescript
{
    type: "modify_loot_item",
    field: "items",
    itemId: "item_0",
    property: "weight", // "name" | "weight" | "quality"
    value: 50
}
```

### 4. `duplicate_loot_item` - Dupliquer un item

Crée une copie d'un item existant, optionnellement dans un autre pool.

```typescript
{
    type: "duplicate_loot_item",
    field: "items",
    itemId: "item_0",
    targetPoolIndex: 1 // optionnel
}
```

## 👥 Actions sur les Groupes

### 5. `create_loot_group` - Créer un groupe

Crée un nouveau groupe avec des items existants.

```typescript
{
    type: "create_loot_group",
    field: "groups",
    groupType: "alternatives", // "alternatives" | "group" | "sequence"
    itemIds: ["item_0", "item_1"],
    poolIndex: 0,
    entryIndex: 0
}
```

### 6. `modify_loot_group` - Modifier un groupe

Modifie un groupe existant (ajouter/retirer items, changer type).

```typescript
{
    type: "modify_loot_group",
    field: "groups",
    groupId: "group_0",
    operation: "add_item", // "add_item" | "remove_item" | "change_type"
    value: "item_2" // ou "alternatives" pour change_type
}
```

**Opérations détaillées :**

**`add_item`** - Ajoute un item/groupe au groupe (évite les doublons)

```typescript
// Groupe initial: { id: "group_0", items: ["item_0"] }
{ operation: "add_item", value: "item_1" }
// Résultat: { id: "group_0", items: ["item_0", "item_1"] }

// Tentative d'ajout d'un item déjà présent
{ operation: "add_item", value: "item_0" }  
// Résultat: { id: "group_0", items: ["item_0"] } (pas de doublon)
```

**`remove_item`** - Retire un item/groupe du groupe

```typescript
// Groupe initial: { id: "group_0", items: ["item_0", "item_1", "item_2"] }
{ operation: "remove_item", value: "item_1" }
// Résultat: { id: "group_0", items: ["item_0", "item_2"] }
```

**`change_type`** - Change le type du groupe

```typescript
// Groupe initial: { id: "group_0", type: "alternatives", items: [...] }
{ operation: "change_type", value: "sequence" }
// Résultat: { id: "group_0", type: "sequence", items: [...] }
```

**Types de groupes Minecraft :**

- `"alternatives"` : Un seul item du groupe sera choisi
- `"group"` : Tous les items du groupe seront évalués
- `"sequence"` : Items évalués en séquence jusqu'à échec

### 7. `dissolve_loot_group` - Dissoudre un groupe

Supprime un groupe mais garde ses items. **Nettoyage automatique** : retire
aussi toutes les références à ce groupe dans d'autres groupes.

```typescript
{
    type: "dissolve_loot_group",
    field: "groups",
    groupId: "group_0"
}
```

**Comportement détaillé :**

```typescript
// État initial
{
    items: [
        { id: "item_0", name: "minecraft:diamond" },
        { id: "item_1", name: "minecraft:emerald" }
    ],
    groups: [
        { id: "group_0", type: "alternatives", items: ["item_0", "item_1"] },
        { id: "group_1", type: "group", items: ["group_0", "item_0"] }  // Référence group_0
    ]
}

// Action: dissolve_loot_group avec groupId: "group_0"
// Résultat:
{
    items: [
        { id: "item_0", name: "minecraft:diamond" },     // Items conservés
        { id: "item_1", name: "minecraft:emerald" }      // Items conservés
    ],
    groups: [
        { id: "group_1", type: "group", items: ["item_0"] }  // Référence à group_0 supprimée
    ]
}
```

**Cas particulier - Nettoyage des groupes vides :** Si après dissolution, un
groupe parent n'a plus d'items, il n'est **pas** automatiquement supprimé.
Utilisez `dissolve_loot_group` récursivement si nécessaire.

### 8. `nest_group_in_group` - Imbriquer des groupes

Place un groupe à l'intérieur d'un autre groupe.

```typescript
{
    type: "nest_group_in_group",
    field: "groups",
    childGroupId: "group_1",
    parentGroupId: "group_0",
    position: 0 // optionnel
}
```

### 9. `unnest_group` - Désimbriquer un groupe

Retire un groupe de tous ses parents mais le garde.

```typescript
{
    type: "unnest_group",
    field: "groups",
    groupId: "group_1"
}
```

## 🏊 Actions sur les Pools

### Actions manquantes dans l'implémentation actuelle

**Note :** Les actions `add_pool`, `remove_pool` et `reorder_items_in_pool` sont
définies dans les types mais pas encore implémentées dans `LootTableModifier`.
Elles seront ajoutées dans une future version.

```typescript
// Actions futures (non implémentées)
interface AddPoolAction {
    type: "add_pool";
    rolls?: { min: number; max: number };
    bonus_rolls?: number;
}

interface RemovePoolAction {
    type: "remove_pool";
    poolIndex: number;
}

interface ReorderItemsInPoolAction {
    type: "reorder_items_in_pool";
    poolIndex: number;
    itemOrder: string[]; // Array of item/group IDs in desired order
}
```

### 10. `move_item_between_pools` - Déplacer un item

Déplace un item d'un pool à un autre en modifiant ses propriétés `poolIndex` et
`entryIndex`.

```typescript
{
    type: "move_item_between_pools",
    field: "items",
    itemId: "item_0",
    targetPoolIndex: 1
}
```

**Comportement détaillé :**

L'action modifie les propriétés de l'item pour le faire "appartenir" au nouveau
pool :

- `poolIndex` : Mis à jour avec la nouvelle valeur
- `entryIndex` : Recalculé automatiquement (prochain index disponible dans le
  pool cible)

```typescript
// État initial
{
    items: [
        {
            id: "item_0",
            name: "minecraft:diamond",
            poolIndex: 0,
            entryIndex: 0,
            weight: 1,
        },
        {
            id: "item_1",
            name: "minecraft:emerald",
            poolIndex: 0,
            entryIndex: 1,
            weight: 5,
        },
        {
            id: "item_2",
            name: "minecraft:gold_ingot",
            poolIndex: 1,
            entryIndex: 0,
            weight: 10,
        },
    ];
}

// Action: move_item_between_pools avec itemId: "item_0", targetPoolIndex: 1
// Résultat:
{
    items: [
        {
            id: "item_0",
            name: "minecraft:diamond",
            poolIndex: 1,
            entryIndex: 1,
            weight: 1,
        }, // Déplacé vers pool 1
        {
            id: "item_1",
            name: "minecraft:emerald",
            poolIndex: 0,
            entryIndex: 1,
            weight: 5,
        }, // Reste dans pool 0
        {
            id: "item_2",
            name: "minecraft:gold_ingot",
            poolIndex: 1,
            entryIndex: 0,
            weight: 10,
        }, // Reste dans pool 1
    ];
}
```

**Calcul automatique de `entryIndex` :**

- Le système trouve automatiquement le prochain `entryIndex` disponible dans le
  pool cible
- Si le pool cible a déjà des items avec `entryIndex` 0, 1, 2, le nouvel item
  aura `entryIndex: 3`

**Cas particuliers :**

- Si `itemId` n'existe pas : retourne `undefined`
- Si `targetPoolIndex` est le même que l'actuel : aucun changement
- Si le pool cible n'existe pas encore : l'item sera le premier du nouveau pool
  (`entryIndex: 0`)

### 11. `move_group_between_pools` - Déplacer un groupe

Déplace un groupe d'un pool à un autre en modifiant ses propriétés `poolIndex`
et `entryIndex`.

```typescript
{
    type: "move_group_between_pools",
    field: "groups",
    groupId: "group_0",
    targetPoolIndex: 1
}
```

**Comportement détaillé :**

Similaire à `move_item_between_pools`, mais pour les groupes :

- `poolIndex` : Mis à jour avec la nouvelle valeur
- `entryIndex` : Recalculé automatiquement dans le pool cible

```typescript
// État initial
{
    items: [
        { id: "item_0", name: "minecraft:diamond", poolIndex: 0, entryIndex: 0 },
        { id: "item_1", name: "minecraft:emerald", poolIndex: 0, entryIndex: 1 }
    ],
    groups: [
        { id: "group_0", type: "alternatives", items: ["item_0", "item_1"], poolIndex: 0, entryIndex: 2 },
        { id: "group_1", type: "group", items: ["item_0"], poolIndex: 1, entryIndex: 0 }
    ]
}

// Action: move_group_between_pools avec groupId: "group_0", targetPoolIndex: 1
// Résultat:
{
    items: [
        { id: "item_0", name: "minecraft:diamond", poolIndex: 0, entryIndex: 0 },  // Items inchangés
        { id: "item_1", name: "minecraft:emerald", poolIndex: 0, entryIndex: 1 }   // Items inchangés
    ],
    groups: [
        { id: "group_0", type: "alternatives", items: ["item_0", "item_1"], poolIndex: 1, entryIndex: 1 }, // Déplacé vers pool 1
        { id: "group_1", type: "group", items: ["item_0"], poolIndex: 1, entryIndex: 0 }  // Reste dans pool 1
    ]
}
```

**Points importants :**

1. **Items du groupe non affectés** : Seul le groupe change de pool, pas ses
   items membres
2. **Références conservées** : Les références `items: ["item_0", "item_1"]`
   restent identiques
3. **Calcul d'entryIndex** : Même logique que pour les items (prochain index
   disponible)

**Cas particuliers :**

- Si `groupId` n'existe pas : retourne `undefined`
- Si `targetPoolIndex` est le même que l'actuel : aucun changement
- **Groupes imbriqués** : Si le groupe contient d'autres groupes, seul le groupe
  parent change de pool

**Exemple avec groupes imbriqués :**

```typescript
// État initial
{
    groups: [
        {
            id: "group_0",
            type: "alternatives",
            items: ["group_1"],
            poolIndex: 0,
            entryIndex: 0,
        },
        {
            id: "group_1",
            type: "group",
            items: ["item_0"],
            poolIndex: 0,
            entryIndex: 1,
        },
    ];
}

// Action: move_group_between_pools avec groupId: "group_0", targetPoolIndex: 1
// Résultat:
{
    groups: [
        {
            id: "group_0",
            type: "alternatives",
            items: ["group_1"],
            poolIndex: 1,
            entryIndex: 0,
        }, // Déplacé
        {
            id: "group_1",
            type: "group",
            items: ["item_0"],
            poolIndex: 0,
            entryIndex: 1,
        }, // Reste en pool 0
    ];
}
```

**Note importante :** Le groupe enfant `group_1` reste dans son pool d'origine.
Si vous voulez déplacer toute la hiérarchie, vous devez faire plusieurs actions
séparées.

## 🔄 Actions de Conversion

### 12. `convert_item_to_group` - Item vers Groupe

Convertit un item en groupe, optionnellement avec d'autres items.

```typescript
{
    type: "convert_item_to_group",
    field: "groups",
    itemId: "item_0",
    groupType: "alternatives",
    additionalItems: ["item_1", "item_2"] // optionnel
}
```

### 13. `convert_group_to_item` - Groupe vers Item

Convertit un groupe en item (garde le premier ou supprime tout).

```typescript
{
    type: "convert_group_to_item",
    field: "groups",
    groupId: "group_0",
    keepFirstItem: true // optionnel
}
```

## 📊 Actions Avancées

### 14. `bulk_modify_items` - Modification en masse

Modifie plusieurs items en une fois.

```typescript
{
    type: "bulk_modify_items",
    field: "items",
    itemIds: ["item_0", "item_1", "item_2"],
    property: "weight", // "weight" | "quality"
    operation: "multiply", // "multiply" | "add" | "set"
    value: 2
}
```

### 15. `balance_weights` - Équilibrer les poids

Équilibre automatiquement les poids des items d'un pool.

```typescript
{
    type: "balance_weights",
    field: "items",
    poolIndex: 0,
    targetTotal: 100 // optionnel, défaut: 100
}
```

### 16. `conditional_loot` - Loot conditionnel

Exécute des actions selon des conditions sur la loot table. **Action récursive**
: les actions `thenAction` et `elseAction` peuvent elles-mêmes être des
`conditional_loot`.

```typescript
{
    type: "conditional_loot",
    field: "items",
    condition: {
        type: "pool_empty", // "pool_empty" | "item_count" | "group_exists"
        poolIndex: 0,
        // count: 5, // pour item_count
        // groupId: "group_0" // pour group_exists
    },
    thenAction: {
        type: "add_loot_item",
        field: "items",
        poolIndex: 0,
        item: { name: "minecraft:dirt" }
    },
    elseAction: { // optionnel
        type: "remove_loot_item",
        field: "items", 
        itemId: "item_0"
    }
}
```

**Types de conditions détaillés :**

**`pool_empty`** - Vérifie si un pool spécifique est vide

```typescript
condition: {
    type: "pool_empty",
    poolIndex: 0  // REQUIS: index du pool à vérifier
}
// Retourne true si aucun item n'a poolIndex === 0
```

**`item_count`** - Vérifie le nombre total d'items dans la loot table

```typescript
condition: {
    type: "item_count",
    count: 5  // REQUIS: seuil minimum
}
// Retourne true si lootTable.items.length >= count
```

**`group_exists`** - Vérifie si un groupe spécifique existe

```typescript
condition: {
    type: "group_exists", 
    groupId: "group_0"  // REQUIS: ID du groupe à chercher
}
// Retourne true si un groupe avec cet ID existe
```

**Exemple complexe avec conditions imbriquées :**

```typescript
{
    type: "conditional_loot",
    field: "items",
    condition: { type: "pool_empty", poolIndex: 0 },
    thenAction: {
        // Si pool 0 vide, vérifier le nombre total d'items
        type: "conditional_loot",
        field: "items", 
        condition: { type: "item_count", count: 3 },
        thenAction: {
            // Si ≥3 items total, ajouter item rare
            type: "add_loot_item",
            field: "items",
            poolIndex: 0,
            item: { name: "minecraft:diamond", weight: 1 }
        },
        elseAction: {
            // Sinon, ajouter item commun
            type: "add_loot_item", 
            field: "items",
            poolIndex: 0,
            item: { name: "minecraft:dirt", weight: 100 }
        }
    }
}
```

## 🧪 Exemples pratiques

### Créer une loot table complexe

```typescript
// 1. Ajouter des items de base
const addDiamond = {
    type: "add_loot_item",
    field: "items",
    poolIndex: 0,
    item: {
        name: "minecraft:diamond",
        weight: 1,
        quality: 10,
    },
};

const addEmerald = {
    type: "add_loot_item",
    field: "items",
    poolIndex: 0,
    item: {
        name: "minecraft:emerald",
        weight: 5,
        quality: 8,
    },
};

// 2. Créer un groupe alternatives
const createGroup = {
    type: "create_loot_group",
    field: "groups",
    groupType: "alternatives",
    itemIds: ["item_0", "item_1"], // diamond et emerald
    poolIndex: 0,
};

// 3. Exécuter en séquence
const complexAction = {
    type: "sequential",
    actions: [addDiamond, addEmerald, createGroup],
};

const result = updateData(complexAction, lootTable, 1);
```

### Équilibrer une loot table

```typescript
// Équilibrer tous les poids du pool 0 pour un total de 100
const balanceAction = {
    type: "balance_weights",
    field: "items",
    poolIndex: 0,
    targetTotal: 100,
};

const balanced = updateData(balanceAction, lootTable, 1);
```

### Loot conditionnel intelligent

```typescript
// Si le pool est vide, ajouter un item par défaut
const smartLoot = {
    type: "conditional_loot",
    field: "items",
    condition: {
        type: "pool_empty",
        poolIndex: 0,
    },
    thenAction: {
        type: "add_loot_item",
        field: "items",
        poolIndex: 0,
        item: {
            name: "minecraft:dirt",
            weight: 100,
        },
    },
};

const smartTable = updateData(smartLoot, lootTable, 1);
```

## 💡 Conseils d'utilisation

1. **IDs automatiques** : Les IDs des items/groupes sont générés automatiquement
   (`item_${counter}`, `group_${counter}`)
2. **Références** : Quand vous supprimez un item, il est retiré de tous les
   groupes
3. **Pools** : Les poolIndex commencent à 0
4. **Groupes imbriqués** : Vous pouvez imbriquer des groupes dans d'autres
   groupes
5. **Conditions** : Utilisez `conditional_loot` pour des logiques complexes
6. **Performance** : `bulk_modify_items` est plus efficace que plusieurs
   `modify_loot_item`

## ⚠️ Limitations et gestion d'erreurs

### Actions qui retournent `undefined`

Certaines actions peuvent échouer silencieusement et retourner `undefined` :

```typescript
// Item inexistant
updateData(
    {
        type: "modify_loot_item",
        field: "items",
        itemId: "item_999", // N'existe pas
        property: "weight",
        value: 50,
    },
    lootTable,
    1,
);
// Résultat: undefined (action ignorée)

// Groupe inexistant
updateData(
    {
        type: "modify_loot_group",
        field: "groups",
        groupId: "group_999", // N'existe pas
        operation: "add_item",
        value: "item_0",
    },
    lootTable,
    1,
);
// Résultat: undefined (action ignorée)
```

### Compteurs globaux

**Important :** Les compteurs `globalItemCounter` et `globalGroupCounter` sont
partagés entre toutes les actions. Cela peut créer des IDs non séquentiels :

```typescript
// Premier appel
updateData({ type: "add_loot_item", ... }, lootTable, 1);
// Crée "item_0"

// Deuxième appel sur une autre loot table
updateData({ type: "add_loot_item", ... }, otherLootTable, 1); 
// Crée "item_1" (pas "item_0")
```

### Références circulaires

Le système ne détecte **pas** les références circulaires dans les groupes :

```typescript
// DANGER: Référence circulaire possible
groups: [
    { id: "group_0", items: ["group_1"] },
    { id: "group_1", items: ["group_0"] }, // Référence circulaire !
];
// Peut causer des boucles infinies lors de la compilation
```

## 🔗 Intégration avec les actions globales

Les actions LootTable peuvent être combinées avec les actions globales :

```typescript
const hybridAction = {
    type: "sequential",
    actions: [
        // Action LootTable
        {
            type: "add_loot_item",
            field: "items",
            poolIndex: 0,
            item: { name: "minecraft:gold_ingot" },
        },
        // Action globale
        {
            type: "set_value",
            field: "type",
            value: "minecraft:chest",
        },
    ],
};
```
