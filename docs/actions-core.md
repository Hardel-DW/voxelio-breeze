# Actions Core - Domaine de base

## Vue d'ensemble

Le domaine `core` fournit les actions de base pour manipuler les données des
éléments. Ces actions sont utilisées par tous les autres domaines et offrent des
opérations fondamentales sur les chemins d'objets.

## Actions disponibles

### `core.set_value`

Définit une valeur à un chemin spécifique dans l'élément.

**Signature** :

```typescript
{
    type: "core.set_value";
    path: string;
    value: unknown;
}
```

**Paramètres** :

- `path` : Chemin dot-separated vers la propriété (ex: "minCostBase",
  "effects.damage")
- `value` : Nouvelle valeur à assigner

**Exemples** :

```typescript
// Modification simple
const action = {
    type: "core.set_value",
    path: "maxLevel",
    value: 10,
};

// Modification imbriquée
const action = {
    type: "core.set_value",
    path: "effects.damage.value",
    value: 5.0,
};

// Création de nouvelle propriété
const action = {
    type: "core.set_value",
    path: "customData.myProperty",
    value: "myValue",
};
```

**Résultat** :

- Retourne un nouvel objet avec la valeur modifiée
- L'objet original reste inchangé (immutabilité)
- Crée automatiquement les objets intermédiaires si nécessaire

### `core.toggle_value`

Active/désactive une valeur en la définissant ou la supprimant.

**Signature** :

```typescript
{
    type: "core.toggle_value";
    path: string;
    value: unknown;
}
```

**Paramètres** :

- `path` : Chemin vers la propriété
- `value` : Valeur de référence pour le toggle

**Logique** :

- Si la valeur actuelle == `value` → Définie à `undefined`
- Sinon → Définie à `value`

**Exemples** :

```typescript
// Toggle d'un flag boolean
const action = {
    type: "core.toggle_value",
    path: "isEnabled",
    value: true,
};
// Si isEnabled === true → undefined
// Si isEnabled !== true → true

// Toggle d'un niveau d'enchantement
const action = {
    type: "core.toggle_value",
    path: "maxLevel",
    value: 5,
};
// Si maxLevel === 5 → undefined
// Si maxLevel !== 5 → 5
```

**Résultat** :

- Retourne un nouvel objet avec la valeur togglee
- Utile pour activer/désactiver des fonctionnalités

### `core.set_undefined`

Supprime une propriété en la définissant à `undefined`.

**Signature** :

```typescript
{
    type: "core.set_undefined";
    path: string;
}
```

**Paramètres** :

- `path` : Chemin vers la propriété à supprimer

**Exemples** :

```typescript
// Suppression d'une propriété
const action = {
    type: "core.set_undefined",
    path: "weight",
};

// Suppression d'un effet
const action = {
    type: "core.set_undefined",
    path: "effects.knockback",
};
```

**Résultat** :

- La propriété existe toujours mais avec la valeur `undefined`
- Conforme aux règles de linting (pas d'usage de `delete`)

### `core.invert_boolean`

Inverse une valeur booléenne.

**Signature** :

```typescript
{
    type: "core.invert_boolean";
    path: string;
}
```

**Paramètres** :

- `path` : Chemin vers la propriété booléenne

**Exemples** :

```typescript
// Inverser un flag
const action = {
    type: "core.invert_boolean",
    path: "isActive",
};
// true → false, false → true

// Inverser une option imbriquée
const action = {
    type: "core.invert_boolean",
    path: "config.showTooltips",
};
```

**Résultat** :

- `true` devient `false`
- `false` devient `true`
- Si la valeur n'est pas un boolean, l'objet reste inchangé

### `core.sequential`

Exécute plusieurs actions en séquence.

**Signature** :

```typescript
{
    type: "core.sequential";
    actions: Array<Action>;
}
```

**Paramètres** :

- `actions` : Tableau d'actions à exécuter dans l'ordre

**Exemples** :

```typescript
// Modification multiple
const action = {
    type: "core.sequential",
    actions: [
        {
            type: "core.set_value",
            path: "maxLevel",
            value: 10,
        },
        {
            type: "core.set_value",
            path: "weight",
            value: 1,
        },
        {
            type: "core.set_undefined",
            path: "anvilCost",
        },
    ],
};

// Mélange de domaines
const action = {
    type: "core.sequential",
    actions: [
        {
            type: "core.set_value",
            path: "type",
            value: "minecraft:crafting_shapeless",
        },
        {
            type: "recipe.add_ingredient",
            slot: "0",
            items: ["minecraft:diamond"],
        },
    ],
};
```

**Résultat** :

- Chaque action est appliquée sur le résultat de la précédente
- Si une action échoue, la séquence s'arrête
- Retourne le résultat final après toutes les actions

### `core.alternative`

Exécute une action conditionnellement selon une condition.

**Signature** :

```typescript
{
  type: "core.alternative";
  condition: boolean | Condition;
  ifTrue: Action;
  ifFalse?: Action;
}
```

**Paramètres** :

- `condition` : Boolean statique ou objet Condition structuré
- `ifTrue` : Action à exécuter si la condition est vraie
- `ifFalse` : Action optionnelle si la condition est fausse

**Exemples** :

```typescript
// Condition boolean statique
const action = {
    type: "core.alternative",
    condition: true,
    ifTrue: {
        type: "core.set_value",
        path: "maxLevel",
        value: 10,
    },
    ifFalse: {
        type: "core.set_value",
        path: "maxLevel",
        value: 5,
    },
};

// Vérifier si un champ est undefined
const action = {
    type: "core.alternative",
    condition: {
        condition: "if_field_is_undefined",
        field: "weight",
    },
    ifTrue: {
        type: "core.set_value",
        path: "weight",
        value: 10,
    },
};

// Comparer un champ à une valeur
const action = {
    type: "core.alternative",
    condition: {
        condition: "compare_to_value",
        compare: "mode",
        value: "creative",
    },
    ifTrue: {
        type: "core.set_undefined",
        path: "weight",
    },
    ifFalse: {
        type: "core.set_value",
        path: "weight",
        value: 10,
    },
};

// Conditions multiples (AND)
const action = {
    type: "core.alternative",
    condition: {
        condition: "all_of",
        terms: [
            {
                condition: "compare_to_value",
                compare: "weight",
                value: "10",
            },
            {
                condition: "compare_to_value",
                compare: "mode",
                value: "normal",
            },
        ],
    },
    ifTrue: {
        type: "core.set_value",
        path: "weight",
        value: 5,
    },
};
```

**Types de conditions** :

- `compare_to_value` : Compare un champ à une valeur string
- `compare_value_to_field_value` : Compare un champ à un autre champ
- `if_field_is_undefined` : Vérifie si un champ est undefined
- `contains` : Vérifie si un champ contient certaines valeurs
- `all_of` : ET logique (toutes les conditions)
- `any_of` : OU logique (au moins une condition)
- `inverted` : Inverse une condition
- `object` : Évalue une condition sur un sous-objet

## Cas d'usage pratiques

### Initialisation d'un élément

```typescript
const initAction = {
    type: "core.sequential",
    actions: [
        { type: "core.set_value", path: "maxLevel", value: 1 },
        { type: "core.set_value", path: "weight", value: 10 },
        { type: "core.set_value", path: "anvilCost", value: 1 },
        { type: "core.set_value", path: "mode", value: "normal" },
    ],
};
```

### Configuration conditionnelle

```typescript
const configAction = {
    type: "core.alternative",
    condition: {
        condition: "compare_to_value",
        compare: "mode",
        value: "expert",
    },
    ifTrue: {
        type: "core.sequential",
        actions: [
            { type: "core.set_value", path: "maxLevel", value: 255 },
            { type: "core.set_value", path: "showAdvanced", value: true },
        ],
    },
    ifFalse: {
        type: "core.set_value",
        path: "maxLevel",
        value: 10,
    },
};
```

### Réinitialisation sélective

```typescript
const resetAction = {
    type: "core.sequential",
    actions: [
        { type: "core.set_undefined", path: "customEffects" },
        { type: "core.set_undefined", path: "modData" },
        { type: "core.set_value", path: "mode", value: "normal" },
    ],
};
```

### Toggle d'état complexe

```typescript
const toggleModeAction = {
    type: "core.alternative",
    condition: {
        condition: "compare_to_value",
        compare: "mode",
        value: "creative",
    },
    ifTrue: {
        type: "core.sequential",
        actions: [
            { type: "core.set_value", path: "mode", value: "normal" },
            { type: "core.set_value", path: "weight", value: 10 },
        ],
    },
    ifFalse: {
        type: "core.sequential",
        actions: [
            { type: "core.set_value", path: "mode", value: "creative" },
            { type: "core.set_undefined", path: "weight" },
        ],
    },
};
```

## Bonnes pratiques

### Chemins de propriétés

```typescript
// ✅ Chemins valides
"maxLevel"              // Propriété directe
"effects.damage"        // Propriété imbriquée
"config.ui.showTips"    // Niveaux multiples

// ❌ À éviter
"effects["damage"]"     // Syntax bracket
"effects.damage.0"      // Index d'array (fragile)
```

### Actions séquentielles

```typescript
// ✅ Ordre logique
{
  type: "core.sequential",
  actions: [
    { type: "core.set_value", path: "mode", value: "creative" },
    { type: "core.set_undefined", path: "weight" },        // Supprime après avoir changé le mode
    { type: "core.set_undefined", path: "anvilCost" }
  ]
}

// ❌ Ordre problématique
{
  type: "core.sequential",
  actions: [
    { type: "core.set_undefined", path: "weight" },        // Supprime avant de changer le mode
    { type: "core.set_value", path: "mode", value: "creative" }
  ]
}
```

### Conditions alternatives

```typescript
// ✅ Conditions structurées
{
  condition: {
    condition: "compare_to_value",
    compare: "maxLevel",
    value: "5"
  },
  ifTrue: { ... },
  ifFalse: { ... }
}

// ✅ Sans else si pas nécessaire
{
  condition: {
    condition: "compare_to_value",
    compare: "mode",
    value: "debug"
  },
  ifTrue: { type: "core.set_value", path: "verbose", value: true }
  // Pas de ifFalse
}
```

Ces actions core forment la base de toutes les manipulations de données dans le
système Voxel Breeze.
