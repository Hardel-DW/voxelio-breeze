# Actions Recipe

Les actions Recipe sont des opérations spécifiques aux recettes Minecraft. Elles
permettent de manipuler les ingrédients, slots, et types de recettes de manière
intuitive avec le nouveau système basé sur les slots. Toutes ces actions passent
par `updateData()`.

## 🎯 Utilisation

```typescript
import { updateData } from "@/core/engine/actions";

const result = updateData(recipeAction, recipe, version);
```

## 🧩 Architecture des Recettes

### Format Voxel (slot-based)

Les recettes VoxelBreeze utilisent un système de slots simplifié :

```typescript
interface RecipeProps {
    identifier: IdentifierObject;
    type: "minecraft:crafting_shaped" | "minecraft:crafting_shapeless" | "minecraft:smelting" | etc.;
    slots: Record<string, string | string[]>; // Slot content
    result: { item: string; count: number };
    typeSpecific?: Record<string, unknown>; // Propriétés spécifiques au type
}
```

**Format des slots :**

- `string` : **Un seul ingrédient** - peut être un item (`"minecraft:diamond"`)
  ou un tag (`"#minecraft:logs"`)
- `string[]` : **Plusieurs items alternatifs** - seulement des items
  (`["minecraft:diamond", "minecraft:emerald"]`), **pas de tags**

**Avantages du système slot-based :**

- 🎯 **Simplicité** : Slots numérotés ("0", "1", "2"...) au lieu de pattern/key
  complexe
- 🔧 **Flexibilité** : Items alternatifs ou tags selon le besoin
- ⚡ **Performance** : Pas de parsing pattern/key à chaque modification
- 🎮 **UI-friendly** : Parfait pour interfaces drag & drop

## 📦 Actions sur les Ingrédients

### 1. `add_ingredient` - Ajouter un ingrédient

Ajoute des items à un slot spécifique, avec option de fusion ou remplacement.

```typescript
{
    type: "add_ingredient",
    field: "slots",
    slot: "0",
    items: ["minecraft:diamond", "minecraft:emerald"], // Seulement des items, pas de tags
    replace?: false // Si true, remplace les items existants
}
```

**Comportement détaillé :**

```typescript
// Ajouter à un slot vide
{
    slots: {}
}
// Action: add_ingredient slot="0", items=["minecraft:diamond"]
// Résultat: { slots: { "0": ["minecraft:diamond"] } }

// Fusionner avec un slot existant (replace=false par défaut)
{
    slots: { "0": ["minecraft:stick"] }
}
// Action: add_ingredient slot="0", items=["minecraft:diamond"]
// Résultat: { slots: { "0": ["minecraft:stick", "minecraft:diamond"] } }

// Remplacer un slot existant (replace=true)
{
    slots: { "0": ["minecraft:stick"] }
}
// Action: add_ingredient slot="0", items=["minecraft:diamond"], replace=true
// Résultat: { slots: { "0": ["minecraft:diamond"] } }

// Ajouter un tag (slot devient string, pas array)
{
    slots: {}
}
// Action: add_ingredient slot="0", items=["#minecraft:logs"], replace=true
// Résultat: { slots: { "0": "#minecraft:logs" } } // String, pas array
```

**Gestion des doublons :** Les items déjà présents ne sont pas ajoutés en
double.

### 2. `remove_ingredient` - Retirer un ingrédient

Retire des items spécifiques d'un slot ou vide complètement le slot.

```typescript
{
    type: "remove_ingredient",
    field: "slots",
    slot: "0",
    items?: ["minecraft:diamond"] // Si omis, vide tout le slot
}
```

**Comportement détaillé :**

```typescript
// Retirer des items spécifiques
{
    slots: { "0": ["minecraft:diamond", "minecraft:emerald", "minecraft:gold_ingot"] }
}
// Action: remove_ingredient slot="0", items=["minecraft:emerald"]
// Résultat: { slots: { "0": ["minecraft:diamond", "minecraft:gold_ingot"] } }

// Vider tout le slot (items non spécifié)
{
    slots: { "0": ["minecraft:diamond", "minecraft:emerald"] }
}
// Action: remove_ingredient slot="0"
// Résultat: { slots: {} } (slot supprimé)

// Auto-nettoyage des slots vides
{
    slots: { "0": ["minecraft:diamond"] }
}
// Action: remove_ingredient slot="0", items=["minecraft:diamond"]
// Résultat: { slots: {} } (slot supprimé car vide)
```

**Note :** Pour définir complètement le contenu d'un slot, utilisez
`add_ingredient` avec `replace: true`.

## 🔄 Actions de Manipulation des Slots

### 3. `swap_slots` - Échanger deux slots

Échange le contenu de deux slots.

```typescript
{
    type: "swap_slots",
    field: "slots",
    fromSlot: "0",
    toSlot: "4"
}
```

**Comportement détaillé :**

```typescript
// Échanger deux slots avec contenu
{
    slots: { "0": ["minecraft:diamond"], "4": ["minecraft:stick"] }
}
// Action: swap_slots fromSlot="0", toSlot="4"
// Résultat: { slots: { "0": ["minecraft:stick"], "4": ["minecraft:diamond"] } }

// Échanger avec un slot vide
{
    slots: { "0": ["minecraft:diamond"] }
}
// Action: swap_slots fromSlot="0", toSlot="1"
// Résultat: { slots: { "1": ["minecraft:diamond"] } } (slot 0 supprimé)

// Échanger deux slots vides (aucun effet)
{
    slots: { "2": ["minecraft:emerald"] }
}
// Action: swap_slots fromSlot="0", toSlot="1"
// Résultat: { slots: { "2": ["minecraft:emerald"] } } (inchangé)
```

### 4. `clear_slot` - Vider un slot

Supprime complètement un slot.

```typescript
{
    type: "clear_slot",
    field: "slots", 
    slot: "0"
}
```

## 🔄 Actions de Conversion

### 5. `convert_recipe_type` - Convertir le type de recette

Convertit une recette d'un type à un autre avec préservation intelligente des
ingrédients.

```typescript
{
    type: "convert_recipe_type",
    field: "type",
    newType: "minecraft:crafting_shapeless",
    preserveIngredients?: true // Par défaut true
}
```

**Conversions supportées :**

**Shaped → Shapeless :**

```typescript
// Pas de changement sur les slots pour shaped → shapeless
{
    type: "minecraft:crafting_shaped",
    slots: { "0": ["minecraft:diamond"], "4": ["minecraft:stick"] }
}
// Action: convert_recipe_type newType="minecraft:crafting_shapeless"
// Résultat: { 
//     type: "minecraft:crafting_shapeless",
//     slots: { "0": ["minecraft:diamond"], "4": ["minecraft:stick"] }
// }
```

**Shaped/Shapeless → Smelting :**

```typescript
// Convertit en ingrédient unique (premier item trouvé)
{
    type: "minecraft:crafting_shaped",
    slots: { "0": ["minecraft:diamond"], "1": ["minecraft:stick"], "4": ["minecraft:stick"] }
}
// Action: convert_recipe_type newType="minecraft:smelting"
// Résultat: {
//     type: "minecraft:smelting", 
//     slots: { "0": "minecraft:diamond" } // Premier item, format string
// }
```

**Vers Stonecutting :**

```typescript
// Ingrédient unique, pas de propriétés de cuisson
{
    type: "minecraft:smelting",
    slots: { "0": "minecraft:cobblestone" },
    typeSpecific: { cookingTime: 200 }
}
// Action: convert_recipe_type newType="minecraft:stonecutting"
// Résultat: {
//     type: "minecraft:stonecutting",
//     slots: { "0": "minecraft:cobblestone" },
//     typeSpecific: undefined
// }
```

**Types supportés :**

- `minecraft:crafting_shaped`
- `minecraft:crafting_shapeless`
- `minecraft:smelting`
- `minecraft:blasting`
- `minecraft:smoking`
- `minecraft:campfire_cooking`
- `minecraft:stonecutting`

## 🧪 Exemples pratiques

### Créer une recette d'épée

```typescript
// 1. Créer une recette shaped de base
const swordRecipe = {
    identifier: {
        namespace: "custom",
        registry: "recipe",
        resource: "diamond_sword",
    },
    type: "minecraft:crafting_shaped",
    slots: {},
    result: { item: "minecraft:diamond_sword", count: 1 },
};

// 2. Ajouter les ingrédients
const addDiamond1 = {
    type: "add_ingredient",
    field: "slots",
    slot: "1", // Centre haut
    items: ["minecraft:diamond"],
};

const addDiamond2 = {
    type: "add_ingredient",
    field: "slots",
    slot: "4", // Centre milieu
    items: ["minecraft:diamond"],
};

const addStick = {
    type: "add_ingredient",
    field: "slots",
    slot: "7", // Centre bas
    items: ["minecraft:stick"],
};

// 3. Exécuter en séquence
const complexAction = {
    type: "sequential",
    actions: [addDiamond1, addDiamond2, addStick],
};

const result = updateData(complexAction, swordRecipe, 1);
```

### Convertir une recette shaped en shapeless

```typescript
// Recette shaped complexe
const shapedRecipe = {
    type: "minecraft:crafting_shaped",
    slots: {
        "0": ["minecraft:diamond"],
        "1": ["minecraft:diamond"],
        "3": ["minecraft:stick"],
        "4": ["minecraft:stick"],
    },
};

// Conversion en shapeless (garde tous les ingrédients)
const convertAction = {
    type: "convert_recipe_type",
    field: "type",
    newType: "minecraft:crafting_shapeless",
};

const shapeless = updateData(convertAction, shapedRecipe, 1);
// Résultat: garde tous les slots
```

### Réorganiser une recette shaped

```typescript
// Recette avec pattern dispersé (slots 2, 6, 8)
const messyRecipe = {
    slots: {
        "2": ["minecraft:diamond"], // Slot 2
        "6": ["minecraft:stick"], // Slot 6
        "8": ["minecraft:stick"], // Slot 8
    },
};

// Compacter vers slots 0, 1, 3 (pattern compact)
const optimizeActions = {
    type: "sequential",
    actions: [
        // Déplacer slot 2 → slot 0
        {
            type: "add_ingredient",
            field: "slots",
            slot: "0",
            items: ["minecraft:diamond"],
            replace: true,
        },
        { type: "remove_ingredient", field: "slots", slot: "2" },
        // Déplacer slot 6 → slot 1
        {
            type: "add_ingredient",
            field: "slots",
            slot: "1",
            items: ["minecraft:stick"],
            replace: true,
        },
        { type: "remove_ingredient", field: "slots", slot: "6" },
        // Déplacer slot 8 → slot 3
        {
            type: "add_ingredient",
            field: "slots",
            slot: "3",
            items: ["minecraft:stick"],
            replace: true,
        },
        { type: "remove_ingredient", field: "slots", slot: "8" },
    ],
};

const optimized = updateData(optimizeActions, messyRecipe, 1);
// Résultat: { slots: { "0": ["minecraft:diamond"], "1": ["minecraft:stick"], "3": ["minecraft:stick"] } }
```

### Créer des recettes alternatives

```typescript
// Base : recette avec stick
const baseRecipe = {
    slots: { "4": ["minecraft:stick"] },
};

// Alternative 1 : avec bamboo
const bambooAlternative = updateData(
    {
        type: "add_ingredient",
        field: "slots",
        slot: "4",
        items: ["minecraft:bamboo"], // Ajoute à la liste existante
    },
    baseRecipe,
    1,
);
// Résultat: slots: { "4": ["minecraft:stick", "minecraft:bamboo"] }

// Alternative 2 : remplacer par tag
const tagAlternative = updateData(
    {
        type: "add_ingredient",
        field: "slots",
        slot: "4",
        items: ["#minecraft:wooden_sticks"], // Remplace complètement
        replace: true,
    },
    baseRecipe,
    1,
);
// Résultat: slots: { "4": "#minecraft:wooden_sticks" } // String, pas array
```

## 💡 Conseils d'utilisation

1. **Slots numérotés** : Utilisez des strings ("0", "1", "2"...) pour les slots
2. **Items vs Tags** : `string[]` pour items alternatifs, `string` pour un tag
   unique
3. **Tags** : Préfixez avec `#` pour les tags (`#minecraft:logs`)
4. **Slots shaped** : Pour crafting shaped, slots 0-8 représentent la grille 3x3
5. **Conversion intelligente** : `convert_recipe_type` preserve les ingrédients
   quand possible
6. **Actions séquentielles** : Combinez plusieurs actions avec `sequential`

## ⚠️ Limitations et gestion d'erreurs

### Actions qui retournent `undefined`

Certaines actions peuvent échouer silencieusement :

```typescript
// Slot inexistant pour remove_ingredient
updateData(
    {
        type: "remove_ingredient",
        field: "slots",
        slot: "999", // N'existe pas
        items: ["minecraft:diamond"],
    },
    recipe,
    1,
);
// Résultat: recipe inchangé (pas d'erreur)

// Action sur type non-supporté
updateData(
    {
        type: "convert_recipe_type",
        field: "type",
        newType: "invalid_type",
    },
    recipe,
    1,
);
// Résultat: recipe inchangé (type invalide)
```

### Validation des slots

Le système ne valide **pas** :

- Numéros de slots hors limites (ex: slot "15" pour crafting 3x3)
- Format des Resource Locations
- Items ou tags Minecraft valides

### Gestion des conflits

```typescript
// add_ingredient avec types incompatibles
{
    slots: { "0": "#minecraft:logs" } // String (tag)
}
// Action: add_ingredient slot="0", items=["minecraft:diamond"] (array)
// Résultat: slots remplacé par ["minecraft:diamond"] (array gagne)
```

### Compteurs de slots

Les actions préservent les numéros de slots existants :

```typescript
// Pas de renumérotation automatique
{
    slots: { "5": ["minecraft:diamond"], "12": ["minecraft:stick"] }
}
// Les actions gardent ces numéros, même s'ils semblent "vides"
```

## 🔗 Intégration avec les actions globales

Les actions Recipe peuvent être combinées avec les actions globales :

```typescript
const hybridAction = {
    type: "sequential",
    actions: [
        // Action Recipe
        {
            type: "add_ingredient",
            field: "slots",
            slot: "0",
            items: ["minecraft:diamond"],
        },
        // Action globale
        {
            type: "set_value",
            field: "result.count",
            value: 2,
        },
        // Autre action Recipe
        {
            type: "convert_recipe_type",
            field: "type",
            newType: "minecraft:crafting_shapeless",
        },
    ],
};
```

## 📊 Performance et optimisation

### Bonnes pratiques

1. **Grouper les modifications** : Utilisez `sequential` pour plusieurs actions
2. **Éviter les conversions répétées** : `convert_recipe_type` peut être coûteux
3. **Slots compacts** : Préférez slots 0,1,2... plutôt que 0,5,12...
4. **Types cohérents** : Utilisez `string` pour tags, `string[]` pour
   alternatives

### Cas d'usage optimaux

- ✅ **UI drag & drop** : Modification directe des slots
- ✅ **Templates** : Conversion entre types de recettes
- ✅ **Alternatives** : Ajout d'items dans slots existants
- ✅ **Réorganisation** : Déplacement manuel des ingrédients
