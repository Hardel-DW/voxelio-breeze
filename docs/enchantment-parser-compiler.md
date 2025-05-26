# Enchantment Parser/Compiler

Le système Enchantment transforme les enchantements Minecraft complexes en
format Voxel simplifié et vice-versa. C'est le premier système implémenté dans
VoxelBreeze et sert de modèle pour les autres.

## 🎯 Vue d'ensemble

```
Minecraft JSON ←→ Format Voxel
     ↑                ↓
  Compiler         Parser
```

- **Parser** : `EnchantmentDataDrivenToVoxelFormat` - Minecraft → Voxel
- **Compiler** : `VoxelToEnchantmentDataDriven` - Voxel → Minecraft

## 📥 Parser : Minecraft → Voxel

### Fonction : `EnchantmentDataDrivenToVoxelFormat`

Transforme un enchantement Minecraft complexe en format Voxel plat et simple.

```typescript
const voxelEnchant = EnchantmentDataDrivenToVoxelFormat({
    element: minecraftEnchant,
    tags: ["#minecraft:treasure", "#minecraft:curse"],
    configurator: "1.21",
});
```

### Transformations effectuées

#### 1. **Aplatissement des structures**

**Minecraft (complexe) :**

```json
{
    "min_cost": {
        "base": 20,
        "per_level_above_first": 9
    },
    "max_cost": {
        "base": 65,
        "per_level_above_first": 9
    }
}
```

**Voxel (plat) :**

```typescript
{
    minCostBase: 20,
    minCostPerLevelAboveFirst: 9,
    maxCostBase: 65,
    maxCostPerLevelAboveFirst: 9
}
```

#### 2. **Détection automatique du mode**

Le parser analyse l'enchantement et détermine automatiquement son mode :

```typescript
let mode: "normal" | "soft_delete" | "only_creative" = "normal";

// Si pas d'effets ET pas de tags → soft_delete
if (!hasEffects && tagsWithoutExclusiveSet.length === 0) {
    mode = "soft_delete";
}

// Si que des tags fonctionnels → only_creative
if (
    tagsWithoutExclusiveSet.every((tag) =>
        tagsRelatedToFunctionality.includes(tag)
    )
) {
    mode = "only_creative";
}
```

#### 3. **Gestion des tags**

- Filtre les tags d'exclusive_set pour éviter les doublons
- Identifie les tags purement fonctionnels
- Conserve la liste des tags utilisateur

#### 4. **Extraction des propriétés**

```typescript
const description = data.description;
const maxLevel = data.max_level;
const weight = data.weight;
const anvilCost = data.anvil_cost;
// ... etc
```

### Structure de sortie

```typescript
interface EnchantmentProps {
    identifier: IdentifierObject;
    description: TextComponentType;
    exclusiveSet: string | undefined;
    supportedItems: string;
    primaryItems: string | undefined;
    maxLevel: number;
    weight: number;
    anvilCost: number;
    minCostBase: number;
    minCostPerLevelAboveFirst: number;
    maxCostBase: number;
    maxCostPerLevelAboveFirst: number;
    effects: Record<string, unknown> | undefined;
    slots: SlotRegistryType[];
    tags: string[];
    mode: "normal" | "soft_delete" | "only_creative";
    disabledEffects: string[];
}
```

## 📤 Compiler : Voxel → Minecraft

### Fonction : `VoxelToEnchantmentDataDriven`

Reconstruit un enchantement Minecraft valide à partir du format Voxel.

```typescript
const result = VoxelToEnchantmentDataDriven(
    voxelEnchant,
    "enchantment", // config key
    originalMinecraftEnchant, // optionnel pour merge
);
```

### Transformations effectuées

#### 1. **Reconstruction des structures complexes**

**Voxel (plat) :**

```typescript
{
    minCostBase: 20,
    minCostPerLevelAboveFirst: 9,
    maxCostBase: 65,
    maxCostPerLevelAboveFirst: 9
}
```

**Minecraft (complexe) :**

```json
{
    "min_cost": {
        "base": 20,
        "per_level_above_first": 9
    },
    "max_cost": {
        "base": 65,
        "per_level_above_first": 9
    }
}
```

#### 2. **Gestion intelligente des modes**

```typescript
// Mode soft_delete : supprime tout
if (enchant.mode === "soft_delete") {
    enchantment.exclusive_set = undefined;
    enchantment.effects = undefined;
    tags = [];
}

// Mode only_creative : garde que les tags fonctionnels
if (enchant.mode === "only_creative") {
    tags = tags.filter((tag) =>
        tags_related_to_functionality.some((t) =>
            new Identifier(t).equalsObject(tag)
        )
    );
}
```

#### 3. **Reconstruction des tags**

- Convertit les tags string en IdentifierObject
- Ajoute automatiquement l'exclusive_set aux tags si nécessaire
- Filtre selon le mode

#### 4. **Gestion des effets désactivés**

```typescript
if (enchant.disabledEffects.length > 0 && enchantment.effects) {
    for (const effect of enchant.disabledEffects) {
        delete enchantment.effects[effect];
    }
}
```

#### 5. **Fallbacks intelligents**

```typescript
// Si pas de supportedItems mais primaryItems existe
if (!enchant.supportedItems && enchant.primaryItems) {
    enchantment.supported_items = enchant.primaryItems;
}
```

### Structure de sortie

```typescript
{
    element: {
        data: Enchantment, // Format Minecraft complet
        identifier: IdentifierObject
    },
    tags: IdentifierObject[] // Tags à appliquer
}
```

## 🔄 Round-trip : Intégrité des données

Le système garantit qu'un enchantement peut faire l'aller-retour sans perte :

```typescript
// Test d'intégrité
const original = minecraftEnchantment;
const voxel = EnchantmentDataDrivenToVoxelFormat({ element: original });
const reconstructed = VoxelToEnchantmentDataDriven(
    voxel,
    "enchantment",
    original,
);

// reconstructed.element.data ≈ original.data (avec améliorations)
```

## 🏷️ Gestion des tags spéciaux

### Tags fonctionnels

Ces tags sont considérés comme purement fonctionnels :

```typescript
const tags_related_to_functionality = [
    { namespace: "minecraft", registry: "tags/enchantment", resource: "curse" },
    {
        namespace: "minecraft",
        registry: "tags/enchantment",
        resource: "double_trade_price",
    },
    {
        namespace: "minecraft",
        registry: "tags/enchantment",
        resource: "prevents_bee_spawns_when_mining",
    },
    // ... etc
];
```

### Exclusive sets

Les exclusive sets sont gérés automatiquement :

- Ajoutés aux tags lors de la compilation
- Filtrés lors du parsing pour éviter les doublons

## 💡 Avantages du système

### 1. **Stabilité entre versions**

- L'UI travaille toujours avec le même format Voxel
- Les changements Minecraft n'affectent que le parser/compiler

### 2. **Simplicité d'utilisation**

- Propriétés plates au lieu de structures imbriquées
- Noms explicites (`minCostBase` vs `min_cost.base`)

### 3. **Modes intelligents**

- Détection automatique du comportement de l'enchantement
- Gestion simplifiée des cas spéciaux

### 4. **Extensibilité**

- Facile d'ajouter de nouvelles propriétés
- Backward compatibility garantie

## 🧪 Exemples d'utilisation

### Parser un enchantement

```typescript
const minecraftEnchant = {
    data: {
        description: { translate: "enchantment.minecraft.sharpness" },
        max_level: 5,
        weight: 10,
        anvil_cost: 1,
        min_cost: { base: 1, per_level_above_first: 11 },
        max_cost: { base: 21, per_level_above_first: 11 },
        supported_items: "#minecraft:enchantable/sword",
        effects: {
            "minecraft:damage": [{
                amount: { type: "linear", base: 1, per_level_above_first: 0.5 },
            }],
        },
    },
    identifier: {
        namespace: "minecraft",
        registry: "enchantment",
        resource: "sharpness",
    },
};

const voxel = EnchantmentDataDrivenToVoxelFormat({ element: minecraftEnchant });
// voxel.maxLevel === 5
// voxel.minCostBase === 1
// voxel.mode === "normal"
```

### Compiler vers Minecraft

```typescript
const voxelEnchant = {
    identifier: {
        namespace: "custom",
        registry: "enchantment",
        resource: "super_sharp",
    },
    description: { translate: "enchantment.custom.super_sharp" },
    maxLevel: 10,
    weight: 1,
    anvilCost: 5,
    minCostBase: 30,
    minCostPerLevelAboveFirst: 15,
    maxCostBase: 80,
    maxCostPerLevelAboveFirst: 15,
    supportedItems: "#minecraft:enchantable/sword",
    effects: { "minecraft:damage": [{ amount: 5 }] },
    tags: ["#minecraft:treasure"],
    mode: "normal",
    slots: ["mainhand"],
    disabledEffects: [],
};

const result = VoxelToEnchantmentDataDriven(voxelEnchant, "enchantment");
// result.element.data contient l'enchantement Minecraft complet
// result.tags contient [{ namespace: "minecraft", registry: "tags/enchantment", resource: "treasure" }]
```

## 🔧 Maintenance et évolution

### Ajouter une nouvelle propriété

1. **Ajouter à l'interface** `EnchantmentProps`
2. **Parser** : Extraire depuis `data.nouvelle_propriete`
3. **Compiler** : Reconstruire vers `enchantment.nouvelle_propriete`
4. **Tests** : Vérifier le round-trip

### Gérer une nouvelle version Minecraft

1. **Identifier les changements** dans le format Minecraft
2. **Adapter le parser** pour les nouvelles structures
3. **Adapter le compiler** pour générer le bon format
4. **Maintenir la compatibilité** avec les anciennes versions

Le système est conçu pour être robuste et évolutif ! 🚀
