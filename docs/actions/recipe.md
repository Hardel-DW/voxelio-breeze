# Actions Recipe - Domaine des recettes

## Vue d'ensemble

Le domaine `recipe` fournit des actions pour manipuler les recettes Minecraft
utilisant le système de slots unifié. Ces actions permettent de modifier les
ingrédients, convertir les types de recettes et gérer les slots.

## Actions disponibles

### `recipe.add_ingredient`

Ajoute des items dans un slot spécifique.

**Signature** :

```typescript
{
    type: "recipe.add_ingredient";
    slot: string;
    items: string[];
    replace?: boolean;
}
```

**Paramètres** :

- `slot` : Identifiant du slot ("0" à "8" pour crafting)
- `items` : Liste des items à ajouter
- `replace` : Si `true`, remplace le contenu, sinon l'ajoute (défaut: `false`)

**Exemples** :

```typescript
// Ajouter un item
const action = {
    type: "recipe.add_ingredient",
    slot: "4",
    items: ["minecraft:diamond"],
};

// Remplacer le contenu avec plusieurs items
const action = {
    type: "recipe.add_ingredient",
    slot: "0",
    items: ["minecraft:oak_log", "minecraft:birch_log"],
    replace: true,
};

// Ajouter sans doublons
const action = {
    type: "recipe.add_ingredient",
    slot: "1",
    items: ["#minecraft:planks"],
    replace: false,
};
```

**Résultat** :

- Si `replace: true` : Le slot est remplacé par les nouveaux items
- Si `replace: false` : Les items sont ajoutés sans créer de doublons
- Si le slot n'existe pas, il est créé

### `recipe.remove_ingredient`

Retire des items d'un slot ou vide le slot.

**Signature** :

```typescript
{
    type: "recipe.remove_ingredient";
    slot: string;
    items?: string[];
}
```

**Paramètres** :

- `slot` : Identifiant du slot à modifier
- `items` : Items à retirer. Si omis, supprime le slot entier

**Exemples** :

```typescript
// Retirer des items spécifiques
const action = {
    type: "recipe.remove_ingredient",
    slot: "0",
    items: ["minecraft:oak_log"],
};

// Supprimer le slot entier
const action = {
    type: "recipe.remove_ingredient",
    slot: "4",
};
```

**Résultat** :

- Si `items` spécifié : Retire uniquement ces items du slot
- Si `items` omis : Supprime le slot entier
- Si le slot devient vide après suppression d'items, il est supprimé

### `recipe.convert_recipe_type`

Convertit une recette vers un autre type.

**Signature** :

```typescript
{
    type: "recipe.convert_recipe_type";
    newType: string;
    preserveIngredients?: boolean;
}
```

**Paramètres** :

- `newType` : Nouveau type de recette
- `preserveIngredients` : Conserver les ingrédients (défaut: `true`)

**Exemples** :

```typescript
// Shaped vers Shapeless
const action = {
    type: "recipe.convert_recipe_type",
    newType: "minecraft:crafting_shapeless",
};

// Crafting vers Smelting
const action = {
    type: "recipe.convert_recipe_type",
    newType: "minecraft:smelting",
    preserveIngredients: true,
};

// Conversion complète sans ingrédients
const action = {
    type: "recipe.convert_recipe_type",
    newType: "minecraft:stonecutting",
    preserveIngredients: false,
};
```

**Logique de conversion** :

- **`minecraft:crafting_shapeless`** : Supprime `gridSize`
- **`minecraft:crafting_shaped`** : Ajoute `gridSize` par défaut (3x3)
- **Smelting/Blasting/Smoking/Campfire** : Premier item → slot "0", supprime
  `gridSize`
- **`minecraft:stonecutting`** : Premier item → slot "0", supprime `gridSize` et
  `typeSpecific`

### `recipe.swap_slots`

Échange le contenu de deux slots.

**Signature** :

```typescript
{
    type: "recipe.swap_slots";
    fromSlot: string;
    toSlot: string;
}
```

**Exemples** :

```typescript
// Échanger deux slots
const action = {
    type: "recipe.swap_slots",
    fromSlot: "0",
    toSlot: "4",
};
```

**Résultat** :

- Le contenu de `fromSlot` va dans `toSlot`
- Le contenu de `toSlot` va dans `fromSlot`
- Si un slot est vide, l'autre devient vide après l'échange

### `recipe.clear_slot`

Supprime un slot entier.

**Signature** :

```typescript
{
    type: "recipe.clear_slot";
    slot: string;
}
```

**Exemples** :

```typescript
// Supprimer un slot
const action = {
    type: "recipe.clear_slot",
    slot: "4",
};
```

**Résultat** :

- Le slot est supprimé de la recette
- Équivalent à `recipe.remove_ingredient` sans `items`

## Cas d'usage pratiques

### Création de recette shaped

```typescript
const createShapedSword = {
    type: "core.sequential",
    actions: [
        // Définir le type
        {
            type: "core.set_value",
            path: "type",
            value: "minecraft:crafting_shaped",
        },
        // Ajouter les ingrédients
        {
            type: "recipe.add_ingredient",
            slot: "1",
            items: ["minecraft:diamond"],
        },
        {
            type: "recipe.add_ingredient",
            slot: "4",
            items: ["minecraft:diamond"],
        },
        {
            type: "recipe.add_ingredient",
            slot: "7",
            items: ["minecraft:stick"],
        },
    ],
};
```

### Conversion shaped vers shapeless

```typescript
const convertToShapeless = {
    type: "recipe.convert_recipe_type",
    newType: "minecraft:crafting_shapeless",
    preserveIngredients: true,
};
```

### Modification d'ingrédients

```typescript
const modifyIngredients = {
    type: "core.sequential",
    actions: [
        // Remplacer par un tag
        {
            type: "recipe.remove_ingredient",
            slot: "0",
            items: ["minecraft:oak_log"],
        },
        {
            type: "recipe.add_ingredient",
            slot: "0",
            items: ["#minecraft:logs"],
        },
        // Ajouter des alternatives
        {
            type: "recipe.add_ingredient",
            slot: "4",
            items: ["minecraft:birch_log", "minecraft:spruce_log"],
        },
    ],
};
```

### Réorganisation de slots

```typescript
const reorganizeSlots = {
    type: "core.sequential",
    actions: [
        // Décaler vers la droite
        {
            type: "recipe.swap_slots",
            fromSlot: "0",
            toSlot: "1",
        },
        {
            type: "recipe.swap_slots",
            fromSlot: "3",
            toSlot: "4",
        },
        // Nettoyer les slots vides
        {
            type: "recipe.clear_slot",
            slot: "8",
        },
    ],
};
```

### Conversion vers smelting

```typescript
const convertToSmelting = {
    type: "core.sequential",
    actions: [
        // Convertir le type
        {
            type: "recipe.convert_recipe_type",
            newType: "minecraft:smelting",
            preserveIngredients: true,
        },
        // Ajouter les propriétés de cuisson
        {
            type: "core.set_value",
            path: "typeSpecific.experience",
            value: 0.7,
        },
        {
            type: "core.set_value",
            path: "typeSpecific.cookingTime",
            value: 200,
        },
    ],
};
```

## Système de slots

### Crafting (Shaped/Shapeless)

```typescript
// Grille 3x3 :
// 0 1 2
// 3 4 5
// 6 7 8

const example = {
    slots: {
        "0": ["minecraft:stick"],
        "4": ["#minecraft:planks"],
        "8": ["minecraft:iron_ingot"],
    },
};
```

### Smelting/Blasting/Smoking

```typescript
// Un seul ingrédient dans le slot "0"
const smeltingExample = {
    slots: {
        "0": ["minecraft:iron_ore"],
    },
    typeSpecific: {
        experience: 0.7,
        cookingTime: 200,
    },
};
```

### Stonecutting

```typescript
// Un ingrédient, pas de propriétés spéciales
const stonecuttingExample = {
    slots: {
        "0": ["#minecraft:stone"],
    },
};
```

## Comportements spéciaux

### Évitement des doublons

L'action `add_ingredient` avec `replace: false` évite automatiquement les
doublons :

```typescript
// Slot existant : ["minecraft:oak_log"]
const action = {
    type: "recipe.add_ingredient",
    slot: "0",
    items: ["minecraft:oak_log", "minecraft:birch_log"], // oak_log ignoré
    replace: false,
};
// Résultat : ["minecraft:oak_log", "minecraft:birch_log"]
```

### Nettoyage automatique

Les slots vides sont automatiquement supprimés :

```typescript
// Si après remove_ingredient un slot devient vide, il est supprimé
const action = {
    type: "recipe.remove_ingredient",
    slot: "0",
    items: ["minecraft:diamond"], // Dernier item du slot
};
// Le slot "0" disparaît complètement
```

### Conversion intelligente

Le `convert_recipe_type` adapte automatiquement les propriétés :

```typescript
// Shaped → Shapeless : supprime gridSize
// Crafting → Smelting : premier item → slot "0"
// Vers Stonecutting : supprime typeSpecific
```

Ces actions offrent un contrôle précis sur les recettes tout en maintenant la
cohérence des données.
