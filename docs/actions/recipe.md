# Actions Recipe - Domaine des recettes

## Vue d'ensemble

Le domaine `recipe` fournit des actions pour manipuler les recettes Minecraft
utilisant le système de slots unifié. Ces actions permettent de modifier les
ingrédients, convertir les types de recettes et gérer les slots.

**Format des slots** : Les slots peuvent contenir soit une chaîne unique
(`string`) pour un tag, soit un tableau (`string[]`) pour un ou plusieurs items
:

- `"#minecraft:logs"` : Tag unique
- `["minecraft:diamond"]` : Item unique
- `["minecraft:diamond", "minecraft:emerald"]` : Plusieurs items

> Attention, le format listes ne peut pas contenir de tag.

## Actions disponibles

### `recipe.add_ingredient`

Ajoute des items dans un slot spécifique. **Ne fonctionne pas sur les recettes
shapeless**.

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
- `items` : Liste des items à ajouter (toujours un tableau)
- `replace` : Si `true`, remplace le contenu, sinon l'ajoute (défaut: `false`)

**Comportement** :

- **Ignore les recettes shapeless** (utiliser `recipe.add_shapeless_ingredient`)
- Si `replace: true` : Le slot est remplacé par les nouveaux items
- Si `replace: false` : Les items sont ajoutés aux existants sans créer de
  doublons
- Si le slot n'existe pas, il est créé
- Le résultat final respecte le format Voxel : `string` pour un tag, `string[]`
  pour un ou plusieurs items

**Exemples** :

```typescript
// Ajouter un item (résultat : slot = ["minecraft:diamond"])
const action = {
    type: "recipe.add_ingredient",
    slot: "4",
    items: ["minecraft:diamond"],
};

// Remplacer avec plusieurs items (résultat : slot = ["minecraft:oak_log", "minecraft:birch_log"])
const action = {
    type: "recipe.add_ingredient",
    slot: "0",
    items: ["minecraft:oak_log", "minecraft:birch_log"],
    replace: true,
};

// Ajouter à un slot existant contenant "#minecraft:logs"
const action = {
    type: "recipe.add_ingredient",
    slot: "1",
    items: ["minecraft:stone"],
    replace: false,
};
// Résultat : slot = ["#minecraft:logs", "minecraft:stone"]
```

### `recipe.add_shapeless_ingredient`

Ajoute un ingrédient à une recette shapeless. **Fonctionne uniquement sur les
recettes shapeless**.

**Signature** :

```typescript
{
    type: "recipe.add_shapeless_ingredient";
    items: string | string[];
}
```

**Paramètres** :

- `items` : Tag (string) ou items (string[]) à ajouter

**Comportement** :

- **Fonctionne uniquement sur les recettes shapeless**
- Trouve automatiquement le prochain slot libre
- Respecte le format Voxel : garde le format original (tag=string,
  items=string[])
- Ignore les autres types de recettes

**Exemples** :

```typescript
// Ajouter un tag
const action = {
    type: "recipe.add_shapeless_ingredient",
    items: "#minecraft:logs",
};
// Résultat : nouveau slot = "#minecraft:logs"

// Ajouter un item unique
const action = {
    type: "recipe.add_shapeless_ingredient",
    items: ["minecraft:diamond"],
};
// Résultat : nouveau slot = ["minecraft:diamond"]

// Ajouter plusieurs items
const action = {
    type: "recipe.add_shapeless_ingredient",
    items: ["minecraft:oak_log", "minecraft:birch_log"],
};
// Résultat : nouveau slot = ["minecraft:oak_log", "minecraft:birch_log"]
```

### `recipe.remove_ingredient`

Retire des items d'un slot ou supprime le slot entier.

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

**Comportement** :

- Si `items` spécifié : Retire uniquement ces items du slot
- Si `items` omis : Supprime le slot entier
- Si le slot devient vide après suppression d'items, il est automatiquement
  supprimé
- Le résultat respecte le format Voxel : `string` pour un tag, `string[]` pour
  un ou plusieurs items

**Exemples** :

```typescript
// Retirer des items spécifiques d'un slot multiple
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

### `recipe.remove_item_everywhere`

Supprime toutes les occurrences des items spécifiés dans tous les slots de la
recette.

**Signature** :

```typescript
{
    type: "recipe.remove_item_everywhere";
    items: string[];
}
```

**Paramètres** :

- `items` : Liste des items/tags à supprimer de tous les slots

**Comportement** :

- Parcourt tous les slots de la recette
- Supprime les items correspondants des slots `string[]`
- Supprime complètement les slots `string` qui correspondent
- Si un slot devient vide, il est automatiquement supprimé
- Gère les tags et items selon le format Voxel

**Exemples** :

```typescript
// Supprimer toutes les occurrences de certains items
const action = {
    type: "recipe.remove_item_everywhere",
    items: ["minecraft:oak_log", "minecraft:birch_log"],
};

// Supprimer un tag partout
const action = {
    type: "recipe.remove_item_everywhere",
    items: ["#minecraft:logs"],
};
```

### `recipe.replace_item_everywhere`

Remplace toutes les occurrences d'un item/tag par un autre dans tous les slots.

**Signature** :

```typescript
{
    type: "recipe.replace_item_everywhere";
    from: string;
    to: string;
}
```

**Paramètres** :

- `from` : Item/tag à remplacer
- `to` : Item/tag de remplacement

**Comportement** :

- Parcourt tous les slots de la recette
- Remplace toutes les occurrences de `from` par `to`
- Gère automatiquement les doublons (supprime les duplicatas)
- Fonctionne sur les tags (`string`) et items (`string[]`)

**Exemples** :

```typescript
// Remplacer un item par un autre partout
const action = {
    type: "recipe.replace_item_everywhere",
    from: "minecraft:oak_log",
    to: "minecraft:spruce_log",
};

// Remplacer un tag par un item
const action = {
    type: "recipe.replace_item_everywhere",
    from: "#minecraft:logs",
    to: "minecraft:oak_log",
};

// Remplacer un item par un tag
const action = {
    type: "recipe.replace_item_everywhere",
    from: "minecraft:oak_log",
    to: "#minecraft:planks",
};
```

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

**Logique de conversion** :

- **`minecraft:crafting_shapeless`** : Supprime `gridSize`
- **`minecraft:crafting_shaped`** : Ajoute `gridSize` par défaut (3x3)
- **Smelting/Blasting/Smoking/Campfire** : Premier item trouvé → slot "0"
  (format string), supprime `gridSize`
- **`minecraft:stonecutting`** : Premier item → slot "0" (format string),
  supprime `gridSize` et `typeSpecific`

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

### Modification d'ingrédients avec gestion des formats

```typescript
const modifyIngredients = {
    type: "core.sequential",
    actions: [
        // Remplacer un item par un tag
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
        // Ajouter des alternatives (créera un tableau)
        {
            type: "recipe.add_ingredient",
            slot: "4",
            items: ["minecraft:birch_log", "minecraft:spruce_log"],
        },
    ],
};
```

### Nettoyage de slots

```typescript
const cleanupSlots = {
    type: "core.sequential",
    actions: [
        {
            type: "recipe.clear_slot",
            slot: "6",
        },
        {
            type: "recipe.clear_slot",
            slot: "7",
        },
        {
            type: "recipe.clear_slot",
            slot: "8",
        },
    ],
};
```

### Suppression d'items dans toute la recette

```typescript
const removeWoodItems = {
    type: "core.sequential",
    actions: [
        // Supprimer tous les types de bois
        {
            type: "recipe.remove_item_everywhere",
            items: [
                "minecraft:oak_log",
                "minecraft:birch_log",
                "minecraft:spruce_log",
            ],
        },
        // Supprimer aussi le tag des planches
        {
            type: "recipe.remove_item_everywhere",
            items: ["#minecraft:planks"],
        },
    ],
};
```

### Remplacement d'items dans toute la recette

```typescript
const upgradeRecipe = {
    type: "core.sequential",
    actions: [
        // Remplacer le fer par du diamant
        {
            type: "recipe.replace_item_everywhere",
            from: "minecraft:iron_ingot",
            to: "minecraft:diamond",
        },
        // Remplacer le tag bois par un bois spécifique
        {
            type: "recipe.replace_item_everywhere",
            from: "#minecraft:logs",
            to: "minecraft:oak_log",
        },
        // Remplacer un item par un tag
        {
            type: "recipe.replace_item_everywhere",
            from: "minecraft:stone",
            to: "#minecraft:stone",
        },
    ],
};
```

### Conversion vers smelting

```typescript
const convertToSmelting = {
    type: "core.sequential",
    actions: [
        // Convertir le type (premier item → slot "0")
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

### Format Voxel des slots

Les slots utilisent le format propriétaire Voxel :

```typescript
// Tag unique
{
    slots: {
        "0": "#minecraft:logs"  // string
    }
}

// Item unique  
{
    slots: {
        "0": ["minecraft:diamond"]  // string[] (toujours un tableau pour les items)
    }
}

// Plusieurs items
{
    slots: {
        "0": ["minecraft:oak_log", "minecraft:birch_log"]  // string[]
    }
}
```

### Crafting (Shaped/Shapeless)

```typescript
// Grille 3x3 :
// 0 1 2
// 3 4 5
// 6 7 8

const example = {
    slots: {
        "0": ["minecraft:stick"],
        "4": "#minecraft:planks",
        "8": ["minecraft:iron_ingot"],
    },
};
```

### Smelting/Blasting/Smoking

```typescript
// Un seul ingrédient dans le slot "0" (tag ou item selon le type)
const smeltingExample = {
    slots: {
        "0": "#minecraft:iron_ores", // Tag (string)
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
        "0": "#minecraft:stone", // Tag (string)
    },
};
```

## Comportements spéciaux

### Évitement des doublons

L'action `add_ingredient` avec `replace: false` évite automatiquement les
doublons :

```typescript
// Slot existant : "#minecraft:logs"
const action = {
    type: "recipe.add_ingredient",
    slot: "0",
    items: ["#minecraft:logs", "minecraft:stone"], // logs ignoré
    replace: false,
};
// Résultat : ["#minecraft:logs", "minecraft:stone"]
```

### Respect du format Voxel

Les actions respectent toujours le format Voxel :

```typescript
// Après suppression, le format reste cohérent
const action = {
    type: "recipe.remove_ingredient",
    slot: "0",
    items: ["minecraft:oak_log"], // Retire un item d'un tableau
};
// Résultat : slot reste ["minecraft:birch_log"] (toujours un tableau pour les items)
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

Le `convert_recipe_type` adapte automatiquement les propriétés et utilise le
premier item trouvé :

```typescript
// Shaped → Shapeless : supprime gridSize
// Crafting → Smelting : premier item → slot "0" (garde le format : tag=string, item=string[])
// Vers Stonecutting : supprime typeSpecific, premier item → slot "0"
```

Ces actions offrent un contrôle précis sur les recettes tout en maintenant la
cohérence des données et le respect du format propriétaire Voxel.
