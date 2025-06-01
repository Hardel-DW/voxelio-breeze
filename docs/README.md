# VoxelBreeze Documentation

VoxelBreeze est un moteur de transformation de données Minecraft qui convertit
les formats complexes et instables de Minecraft en formats propriétaires
simplifiés pour une meilleure gestion UI.

## 📚 Table des matières

### Actions System

- [**Actions Globales**](./actions-global.md) - Actions génériques utilisables
  sur tous les types de données
- [**Actions LootTable**](./actions-loottable.md) - Actions spécifiques aux
  tables de loot
- [**Actions Recipe**](./actions-recipe.md) - Actions spécifiques aux recettes
  avec système slot-based

### Parsers & Compilers

- [**Enchantment Parser/Compiler**](./enchantment-parser-compiler.md) - Comment
  les enchantements sont transformés
- [**LootTable Parser/Compiler**](./loottable-parser-compiler.md) - Comment les
  loot tables sont transformées

## 🎯 Principe général

VoxelBreeze suit un pattern simple :

1. **Parser** : `Minecraft JSON` → `Format Voxel simplifié`
2. **Actions** : Modifications sur le format Voxel via `updateData()`
3. **Compiler** : `Format Voxel` → `Minecraft JSON` reconstruit

Cette approche garantit :

- ✅ **Stabilité** : L'UI ne casse pas quand Minecraft change
- ✅ **Simplicité** : Structures plates au lieu d'arbres complexes
- ✅ **Extensibilité** : Facile d'ajouter de nouvelles propriétés
- ✅ **Reconstructabilité** : Peut parfaitement reconstruire le JSON Minecraft
  original

## 🚀 Démarrage rapide

```typescript
import { updateData } from "@/core/engine/actions";
import { EnchantmentDataDrivenToVoxelFormat } from "@/core/schema/EnchantmentProps";

// 1. Parser un enchantement Minecraft
const voxelEnchant = EnchantmentDataDrivenToVoxelFormat({
  element: minecraftEnchant,
});

// 2. Modifier avec une action
const modifiedEnchant = updateData(
  {
    type: "set_value",
    field: "maxLevel",
    value: 5,
  },
  voxelEnchant,
  1,
);

// 3. Compiler vers Minecraft
const result = VoxelToEnchantmentDataDriven(modifiedEnchant, "enchantment");
```
