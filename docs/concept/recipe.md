# Guide Recipe - Parsing et Compiling

## Vue d'ensemble

Ce guide explique comment convertir les recettes entre les formats Minecraft
variés et le format Voxel unifié basé sur un système de slots. Le système Voxel
simplifie la gestion des recettes en utilisant une approche unifiée.

## Format Minecraft → Format Voxel (Parsing)

### Fonction de parsing

```typescript
import { RecipeDataDrivenToVoxelFormat } from "@voxelio/breeze/core";

const voxelRecipe = RecipeDataDrivenToVoxelFormat({
    element: minecraftElement,
    configurator: "my_tool",
});
```

## Types de recettes supportés

### 1. Crafting Shaped (Pattern + Key)

**Entrée Minecraft** :

```json
{
    "type": "minecraft:crafting_shaped",
    "pattern": [
        "XXX",
        "XYX",
        "XXX"
    ],
    "key": {
        "X": { "item": "minecraft:diamond" },
        "Y": { "tag": "minecraft:logs" }
    },
    "result": {
        "item": "minecraft:diamond_block",
        "count": 1
    }
}
```

**Sortie Voxel** :

```typescript
{
  identifier: { namespace: "minecraft", resource: "diamond_block" },
  type: "minecraft:crafting_shaped",
  slots: {
    "0": ["minecraft:diamond"], "1": ["minecraft:diamond"], "2": ["minecraft:diamond"],
    "3": ["minecraft:diamond"], "4": ["#minecraft:logs"], "5": ["minecraft:diamond"],
    "6": ["minecraft:diamond"], "7": ["minecraft:diamond"], "8": ["minecraft:diamond"]
  },
  gridSize: { width: 3, height: 3 },
  result: {
    item: "minecraft:diamond_block",
    count: 1
  }
}
```

### 2. Crafting Shapeless

**Entrée Minecraft** :

```json
{
    "type": "minecraft:crafting_shapeless",
    "ingredients": [
        { "item": "minecraft:iron_ingot" },
        { "item": "minecraft:iron_ingot" },
        { "tag": "minecraft:planks" }
    ],
    "result": { "item": "minecraft:iron_axe" }
}
```

**Sortie Voxel** :

```typescript
{
  type: "minecraft:crafting_shapeless",
  slots: {
    "0": ["minecraft:iron_ingot"],
    "1": ["minecraft:iron_ingot"],
    "2": ["#minecraft:planks"]
  },
  result: {
    item: "minecraft:iron_axe",
    count: 1
  }
}
```

### 3. Smelting (et variants)

**Entrée Minecraft** :

```json
{
    "type": "minecraft:smelting",
    "ingredient": { "item": "minecraft:iron_ore" },
    "result": { "item": "minecraft:iron_ingot" },
    "experience": 0.7,
    "cookingtime": 200
}
```

**Sortie Voxel** :

```typescript
{
  type: "minecraft:smelting",
  slots: {
    "0": ["minecraft:iron_ore"]
  },
  result: {
    item: "minecraft:iron_ingot",
    count: 1
  },
  typeSpecific: {
    experience: 0.7,
    cookingTime: 200
  }
}
```

### 4. Smithing Transform

**Entrée Minecraft** :

```json
{
    "type": "minecraft:smithing_transform",
    "template": { "item": "minecraft:netherite_upgrade_smithing_template" },
    "base": { "item": "minecraft:diamond_sword" },
    "addition": { "item": "minecraft:netherite_ingot" },
    "result": { "item": "minecraft:netherite_sword" }
}
```

**Sortie Voxel** :

```typescript
{
  type: "minecraft:smithing_transform",
  slots: {
    "0": ["minecraft:netherite_upgrade_smithing_template"], // template
    "1": ["minecraft:diamond_sword"],                       // base
    "2": ["minecraft:netherite_ingot"]                      // addition
  },
  result: {
    item: "minecraft:netherite_sword",
    count: 1
  },
  typeSpecific: {
    templateSlot: "0",
    baseSlot: "1",
    additionSlot: "2"
  }
}
```

### 5. Stonecutting

**Entrée Minecraft** :

```json
{
    "type": "minecraft:stonecutting",
    "ingredient": { "item": "minecraft:stone" },
    "result": { "item": "minecraft:stone_bricks" },
    "count": 1
}
```

**Sortie Voxel** :

```typescript
{
  type: "minecraft:stonecutting",
  slots: {
    "0": ["minecraft:stone"]
  },
  result: {
    item: "minecraft:stone_bricks",
    count: 1
  }
}
```

### 6. Crafting Transmute (1.21.5+)

**Entrée Minecraft** :

```json
{
    "type": "minecraft:crafting_transmute",
    "input": { "item": "minecraft:potion" },
    "material": { "item": "minecraft:gunpowder" },
    "result": { "item": "minecraft:splash_potion" }
}
```

**Sortie Voxel** :

```typescript
{
  type: "minecraft:crafting_transmute",
  slots: {
    "0": ["minecraft:potion"],    // input
    "1": ["minecraft:gunpowder"]  // material
  },
  result: {
    item: "minecraft:splash_potion",
    count: 1
  },
  typeSpecific: {
    inputSlot: "0",
    materialSlot: "1"
  }
}
```

## Format Voxel → Format Minecraft (Compiling)

### Fonction de compiling

```typescript
import { VoxelToRecipeDataDriven } from "@voxelio/breeze/core";

const { element } = VoxelToRecipeDataDriven(
    voxelRecipe,
    "recipe", // config
    originalMinecraftElement, // optionnel
);
```

## Compilation par type

### 1. Shaped Crafting - Réutilisation du pattern original

```typescript
// Le compiler tente de réutiliser le pattern original si possible
const voxelRecipe = {
    type: "minecraft:crafting_shaped",
    slots: {
        "0": ["minecraft:stick"],
        "1": [],
        "2": [],
        "3": ["minecraft:stick"],
        "4": [],
        "5": [],
        "6": ["minecraft:stick"],
        "7": [],
        "8": [],
    },
    gridSize: { width: 3, height: 3 },
};

// Si l'original avait:
// pattern: ["X", "X", "X"], key: { "X": { "item": "minecraft:stick" }}
// → Le pattern original est conservé

// Sinon, génération automatique:
// pattern: ["X  ", "X  ", "X  "], key: { "X": { "item": "minecraft:stick" }}
```

### 2. Gestion des formats de résultat

**Legacy (Stonecutting)** :

```typescript
// Entrée Voxel
{ result: { item: "minecraft:stone_bricks", count: 4 } }

// Sortie Minecraft (format legacy)
{
  "result": "minecraft:stone_bricks",
  "count": 4
}
```

**Modern ItemStack (1.20.5+)** :

```typescript
// Entrée Voxel
{
  result: {
    item: "minecraft:diamond_sword",
    count: 1,
    components: {
      "minecraft:enchantments": {
        "levels": { "minecraft:sharpness": 1 }
      }
    }
  }
}

// Sortie Minecraft
{
  "result": {
    "item": "minecraft:diamond_sword",
    "count": 1,
    "components": {
      "minecraft:enchantments": {
        "levels": { "minecraft:sharpness": 1 }
      }
    }
  }
}
```

### 3. Préservation des champs inconnus (mods)

```typescript
// Entrée Voxel avec champs custom
{
  type: "modded:custom_recipe",
  slots: { "0": ["mod:special_item"] },
  unknownFields: {
    "custom_property": "value",
    "mod_specific_data": { ... }
  }
}

// Sortie Minecraft - Champs préservés
{
  "type": "modded:custom_recipe",
  "ingredient": { "item": "mod:special_item" },
  "custom_property": "value",
  "mod_specific_data": { ... }
}
```

## Système de slots unifié

### Position dans la grille 3x3

```
Positions:  Slots:
0 1 2       "0" "1" "2"
3 4 5   →   "3" "4" "5"
6 7 8       "6" "7" "8"
```

### Fonctions utilitaires

```typescript
import { positionToSlot, slotToPosition } from "@voxelio/breeze/core";

// Position vers slot
const slot = positionToSlot(1, 2, 3); // → "5" (row=1, col=2, width=3)

// Slot vers position
const { row, col } = slotToPosition("5", 3); // → { row: 1, col: 2 }
```

### Normalisation des ingrédients

```typescript
// Minecraft format → Voxel format
normalizeIngredient({ "item": "minecraft:diamond" }); // → ["minecraft:diamond"]
normalizeIngredient({ "tag": "minecraft:logs" }); // → ["#minecraft:logs"]
normalizeIngredient(["minecraft:oak_log", "minecraft:birch_log"]); // → ["minecraft:oak_log", "minecraft:birch_log"]

// Voxel format → Minecraft format
denormalizeIngredient(["minecraft:diamond"]); // → { "item": "minecraft:diamond" }
denormalizeIngredient(["#minecraft:logs"]); // → { "tag": "minecraft:logs" }
denormalizeIngredient(["minecraft:oak_log", "minecraft:birch_log"]); // → [{"item": "minecraft:oak_log"}, {"item": "minecraft:birch_log"}]
```

## Cas d'usage pratiques

### Conversion de type de recette

```typescript
// Shaped vers Shapeless
const shapedRecipe = {
    type: "minecraft:crafting_shaped",
    slots: { "0": ["minecraft:diamond"], "4": ["minecraft:stick"] },
    gridSize: { width: 3, height: 3 },
};

const shapelessRecipe = {
    ...shapedRecipe,
    type: "minecraft:crafting_shapeless",
    gridSize: undefined, // Supprimé pour shapeless
};
```

### Modification d'ingrédients

```typescript
// Ajouter une alternative dans un slot
const originalSlots = { "0": ["minecraft:oak_log"] };
const modifiedSlots = {
    "0": ["minecraft:oak_log", "minecraft:birch_log", "minecraft:spruce_log"],
};
```

### Création de recette custom

```typescript
const customRecipe = {
    identifier: { namespace: "mymod", resource: "super_sword" },
    type: "minecraft:crafting_shaped",
    group: "mymod:weapons",
    category: "equipment",
    slots: {
        "1": ["mymod:super_crystal"],
        "4": ["minecraft:diamond_sword"],
        "7": ["minecraft:netherite_ingot"],
    },
    gridSize: { width: 3, height: 3 },
    result: {
        item: "mymod:super_sword",
        count: 1,
        components: {
            "minecraft:enchantments": {
                "levels": { "minecraft:sharpness": 10 },
            },
        },
    },
};

const minecraft = VoxelToRecipeDataDriven(customRecipe, "recipe");
```

### Gestion des versions Minecraft

**1.20.4 et antérieur** :

```typescript
// Résultat simple
{
    result: {
        item: "minecraft:diamond_sword";
    }
}
// → "result": { "item": "minecraft:diamond_sword" }
```

**1.20.5+** :

```typescript
// Résultat avec composants
{
  result: {
    item: "minecraft:diamond_sword",
    components: { "minecraft:damage": 10 }
  }
}
// → "result": { "item": "minecraft:diamond_sword", "components": {...} }
```

### Optimisation de la grille

```typescript
import { optimizeGridSize } from "@voxelio/breeze/core";

const slots = { "0": ["minecraft:stick"], "3": ["minecraft:stick"] };
const optimized = optimizeGridSize(slots, 3);
// → { width: 1, height: 2 } (taille minimale requise)
```

Ce système unifié permet de gérer tous les types de recettes Minecraft avec une
interface cohérente tout en préservant les spécificités de chaque format.
