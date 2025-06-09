# Guide Enchantement - Parsing et Compiling

## Vue d'ensemble

Ce guide explique la conversion bidirectionnelle entre le format Minecraft natif
et le format Voxel simplifié pour les enchantements.

## Parsing : Minecraft → Voxel

### Fonction principale

```typescript
import { EnchantmentDataDrivenToVoxelFormat } from "@voxelio/breeze/core";

const voxelEnchantment = EnchantmentDataDrivenToVoxelFormat({
  element: minecraftElement,
  tags: ["minecraft:curse"],
  configurator: "my_tool",
});
```

### Transformation des propriétés

Le parser effectue ces conversions automatiques :

```typescript
// Minecraft → Voxel
data.max_level → maxLevel
data.weight → weight
data.anvil_cost → anvilCost
data.min_cost.base → minCostBase
data.min_cost.per_level_above_first → minCostPerLevelAboveFirst
data.max_cost.base → maxCostBase
data.max_cost.per_level_above_first → maxCostPerLevelAboveFirst
data.supported_items → supportedItems
data.primary_items → primaryItems
data.exclusive_set → exclusiveSet
data.effects → effects
data.slots → slots
```

### Détection automatique du mode

Le parser détermine automatiquement le mode selon ces règles :

**Mode "soft_delete"** :

- Aucun effet (`!hasEffects`)
- Aucun tag (hors exclusive_set)

**Mode "only_creative"** :

- Tous les tags sont des tags de fonctionnalité

**Mode "normal"** :

- Tous les autres cas

```typescript
// Exemple soft_delete
{
  effects: undefined, // ou {}
  tags: [] // après filtrage exclusive_set
} // → mode: "soft_delete"

// Exemple only_creative  
{
  effects: { "minecraft:damage": {...} },
  tags: ["minecraft:curse", "minecraft:tooltip_order"] // tous fonctionnels
} // → mode: "only_creative"
```

### Tags de fonctionnalité

Ces tags sont automatiquement reconnus comme fonctionnels :

- `minecraft:curse`
- `minecraft:double_trade_price`
- `minecraft:prevents_bee_spawns_when_mining`
- `minecraft:prevents_decorated_pot_shattering`
- `minecraft:prevents_ice_melting`
- `minecraft:prevents_infested_spawns`
- `minecraft:smelts_loot`
- `minecraft:tooltip_order`

### Exemple complet

**Entrée Minecraft** :

```json
{
  "data": {
    "description": { "translate": "enchantment.minecraft.sharpness" },
    "max_level": 5,
    "weight": 10,
    "anvil_cost": 1,
    "min_cost": { "base": 1, "per_level_above_first": 11 },
    "max_cost": { "base": 21, "per_level_above_first": 11 },
    "supported_items": "#minecraft:weapon",
    "exclusive_set": "#minecraft:damage",
    "effects": {
      "minecraft:damage": {
        "type": "minecraft:add",
        "value": { "base": 1.0, "per_level": 0.5 }
      }
    },
    "slots": ["mainhand"]
  },
  "identifier": { "namespace": "minecraft", "resource": "sharpness" }
}
```

**Sortie Voxel** :

```typescript
{
  identifier: { namespace: "minecraft", resource: "sharpness" },
  description: { translate: "enchantment.minecraft.sharpness" },
  maxLevel: 5,
  weight: 10,
  anvilCost: 1,
  minCostBase: 1,
  minCostPerLevelAboveFirst: 11,
  maxCostBase: 21,
  maxCostPerLevelAboveFirst: 11,
  supportedItems: "#minecraft:weapon",
  primaryItems: undefined,
  exclusiveSet: "#minecraft:damage",
  effects: {
    "minecraft:damage": {
      type: "minecraft:add",
      value: { base: 1.0, per_level: 0.5 }
    }
  },
  slots: ["mainhand"],
  tags: [], // exclusive_set filtré des tags d'entrée
  mode: "normal",
  disabledEffects: [],
  override: "my_tool"
}
```

## Compiling : Voxel → Minecraft

### Fonction principale

```typescript
import { VoxelToEnchantmentDataDriven } from "@voxelio/breeze/core";

const { element, tags } = VoxelToEnchantmentDataDriven(
  voxelEnchantment,
  "enchantment", // config pour le registry des tags
  originalMinecraftElement, // optionnel
);
```

### Transformation inverse

```typescript
// Voxel → Minecraft
maxLevel → data.max_level
weight → data.weight
anvilCost → data.anvil_cost
minCostBase → data.min_cost.base
minCostPerLevelAboveFirst → data.min_cost.per_level_above_first
maxCostBase → data.max_cost.base
maxCostPerLevelAboveFirst → data.max_cost.per_level_above_first
supportedItems → data.supported_items
primaryItems → data.primary_items (si défini)
exclusiveSet → data.exclusive_set (si défini)
effects → data.effects
slots → data.slots
```

### Gestion des modes spéciaux

**Mode "soft_delete"** :

```typescript
// Supprime les propriétés clés
enchantment.exclusive_set = undefined;
enchantment.effects = undefined;
tags = []; // Vide les tags
```

**Mode "only_creative"** :

```typescript
// Filtre les tags pour ne garder que les fonctionnels
tags = tags.filter((tag) => FUNCTIONALITY_TAGS_CACHE.has(tag.toString()));
```

### Gestion des effets désactivés

```typescript
// Si disabledEffects contient des effets
if (element.disabledEffects.length > 0 && enchantment.effects) {
  for (const effect of element.disabledEffects) {
    delete enchantment.effects[effect];
  }
}
```

### Génération des tags

Le compiler génère automatiquement les tags :

1. **Tags de base** : Convertis depuis `element.tags`
2. **Tag exclusive_set** : Ajouté si `exclusiveSet` est défini
3. **Filtrage par mode** : Tags fonctionnels uniquement pour "only_creative"

```typescript
// Exemple avec exclusive_set
{
  exclusiveSet: "custom:fire_enchants",
  tags: ["minecraft:curse"]
}
// Génère :
// - minecraft:curse
// - custom:fire_enchants (depuis exclusiveSet)
```

## Optimisations de performance

### Cache des tags de fonctionnalité

```typescript
// Pré-calculé pour éviter les créations répétées
export const FUNCTIONALITY_TAGS_CACHE = new Set(
  tags_related_to_functionality.map((tag) => new Identifier(tag).toString()),
);
```

### Assignations directes

```typescript
// Pas de clonage inutile - assignation directe
enchantment.max_level = element.maxLevel;
enchantment.weight = element.weight;
// Plus rapide que destructuring/spread
```

### Création conditionnelle

```typescript
// Objets créés seulement si nécessaire
if (element.primaryItems) {
  enchantment.primary_items = element.primaryItems;
}
```

## Cas d'usage pratiques

### Modification d'enchantement

```typescript
// 1. Parser
const voxel = EnchantmentDataDrivenToVoxelFormat({
  element: minecraftSharpness,
  tags: ["minecraft:in_enchanting_table"],
  configurator: "editor",
});

// 2. Modifier
const modified = {
  ...voxel,
  maxLevel: 10,
  weight: 1,
};

// 3. Compiler
const { element, tags } = VoxelToEnchantmentDataDriven(
  modified,
  "enchantment",
);
```

### Désactivation d'enchantement

```typescript
const disabled = {
  ...voxelEnchantment,
  mode: "soft_delete" as const,
};

// Résultat : enchantement sans effets ni exclusive_set
const { element } = VoxelToEnchantmentDataDriven(disabled, "enchantment");
```

### Enchantement créatif seulement

```typescript
const creativeOnly = {
  ...voxelEnchantment,
  mode: "only_creative" as const,
  tags: ["minecraft:curse", "custom:special"], // "custom:special" sera filtré
};
```

### Suppression d'effets spécifiques

```typescript
const withDisabledEffects = {
  ...voxelEnchantment,
  disabledEffects: ["minecraft:fire_aspect", "minecraft:knockback"],
};

// Ces effets seront supprimés du résultat final
```

## Comportements importants

### Filtrage des tags

- Les tags dans `exclusive_set` sont automatiquement filtrés de la liste des
  tags d'entrée
- En mode "only_creative", seuls les tags de fonctionnalité sont conservés

### Gestion de supportedItems

```typescript
// Si supportedItems n'est pas défini mais primaryItems l'est
if (!element.supportedItems && element.primaryItems) {
  enchantment.supported_items = element.primaryItems;
}
```

### Element original

```typescript
// Si un élément original est fourni, il est cloné et modifié
// Sinon, un nouvel objet vide est créé
const enchantment = original ? structuredClone(original) : ({} as Enchantment);
```

Ce système garantit une conversion bidirectionnelle cohérente avec optimisations
pour les performances.
