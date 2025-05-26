# Actions Globales

Les actions globales sont des opérations génériques qui peuvent être appliquées
sur n'importe quel type de données dans VoxelBreeze. Elles passent toutes par la
fonction `updateData()`.

## 🎯 Utilisation

```typescript
import { updateData } from "@/core/engine/actions";

const result = updateData(action, element, version, value?);
```

## 📋 Liste des actions

### 1. `set_value` - Définir une valeur

Définit une valeur simple sur un champ.

```typescript
{
    type: "set_value",
    field: "maxLevel",
    value: 5
}
```

**Exemple :**

```typescript
// Changer le niveau max d'un enchantement
updateData(
    {
        type: "set_value",
        field: "maxLevel",
        value: 3,
    },
    enchantment,
    1,
);
```

### 2. `toggle_value` - Basculer une valeur

Bascule entre deux valeurs (utile pour les booléens).

```typescript
{
    type: "toggle_value",
    field: "enabled",
    value: true
}
```

### 3. `set_undefined` - Supprimer un champ

Supprime complètement un champ en le définissant à `undefined`.

```typescript
{
    type: "set_undefined",
    field: "exclusiveSet"
}
```

### 4. `set_computed_slot` - Slot calculé

**Action spécifique aux slots Minecraft.** Gère intelligemment les slots
d'équipement avec des règles de regroupement automatique selon la version de
Minecraft.

```typescript
{
    type: "set_computed_slot",
    field: "slots",
    value: "mainhand" // ou "offhand", "head", "chest", "legs", "feet", "armor", "hand", "any"
}
```

**Fonctionnement intelligent :**

- **Toggle** : Ajoute le slot s'il n'existe pas, le retire s'il existe
- **Regroupement automatique** :
  - `["mainhand", "offhand"]` → `["hand"]`
  - `["head", "chest", "legs", "feet"]` → `["armor"]`
  - `["hand", "armor"]` → `["any"]`
- **Expansion intelligente** : Retirer `"hand"` quand `"any"` est présent donne
  `["armor", "mainhand"]` ou `["armor", "offhand"]`

**Exemples :**

```typescript
// Ajouter mainhand à un enchantement vide
updateData(
    { type: "set_computed_slot", field: "slots", value: "mainhand" },
    enchant,
    48,
);
// Résultat: slots = ["mainhand"]

// Ajouter offhand quand mainhand existe déjà
updateData(
    { type: "set_computed_slot", field: "slots", value: "offhand" },
    enchant,
    48,
);
// Résultat: slots = ["hand"] (regroupement automatique)

// Retirer mainhand quand "any" est présent
updateData({ type: "set_computed_slot", field: "slots", value: "mainhand" }, {
    slots: ["any"],
}, 48);
// Résultat: slots = ["armor", "offhand"] (expansion intelligente)
```

**Versions supportées :** Minecraft 1.21+ (version ≥ 48)

### 5. `toggle_multiple_values` - Basculer plusieurs valeurs

Bascule plusieurs valeurs en même temps.

```typescript
{
    type: "toggle_multiple_values",
    field: "tags",
    value: ["#minecraft:treasure", "#minecraft:curse"]
}
```

### 6. `toggle_value_in_list` - Basculer dans une liste

Ajoute ou retire une valeur d'une liste.

```typescript
{
    type: "toggle_value_in_list",
    field: "tags",
    mode: ["remove_if_empty"],
    value: "#minecraft:treasure"
}
```

**Modes disponibles :**

- `remove_if_empty` : **APRÈS** avoir retiré la valeur, si la liste devient
  vide, supprime complètement le champ (le définit à `undefined`)
- `override` : Si le champ n'est pas un array, le convertit en array avec la
  valeur

**Comportement détaillé de `remove_if_empty` :**

```typescript
// Cas 1: Liste avec plusieurs éléments
{
    tags: ["#minecraft:treasure", "#minecraft:curse"];
}
// Action: toggle "#minecraft:curse" avec remove_if_empty
// Résultat: { tags: ["#minecraft:treasure"] } (liste conservée)

// Cas 2: Liste avec un seul élément
{
    tags: ["#minecraft:treasure"];
}
// Action: toggle "#minecraft:treasure" avec remove_if_empty
// Résultat: {} (champ complètement supprimé)

// Cas 3: Valeur pas dans la liste
{
    tags: ["#minecraft:treasure"];
}
// Action: toggle "#minecraft:curse" avec remove_if_empty
// Résultat: { tags: ["#minecraft:treasure", "#minecraft:curse"] } (valeur ajoutée)
```

### 7. `remove_key` - Supprimer une clé

Supprime une clé spécifique d'un objet.

```typescript
{
    type: "remove_key",
    field: "effects",
    value: "minecraft:damage"
}
```

### 8. `remove_value_from_list` - Retirer d'une liste

Retire une valeur spécifique d'une liste.

```typescript
{
    type: "remove_value_from_list",
    field: "tags",
    mode: ["remove_if_empty", "if_type_string"],
    value: "#minecraft:curse"
}
```

**Modes disponibles :**

- `remove_if_empty` : **APRÈS** avoir retiré la valeur, si la liste devient
  vide, supprime complètement le champ (le définit à `undefined`)
- `if_type_string` : **AVANT** de traiter, vérifie que la valeur à retirer est
  une string. Si ce n'est pas le cas, l'action est ignorée

**Comportement détaillé :**

```typescript
// Mode if_type_string avec valeur non-string
{
    tags: ["#minecraft:treasure"];
}
// Action: remove_value_from_list avec value: 123 et mode: ["if_type_string"]
// Résultat: { tags: ["#minecraft:treasure"] } (action ignorée, élément inchangé)

// Mode remove_if_empty - retire le dernier élément
{
    tags: ["#minecraft:treasure"];
}
// Action: remove_value_from_list avec value: "#minecraft:treasure" et mode: ["remove_if_empty"]
// Résultat: {} (champ complètement supprimé)

// Combinaison des deux modes
{
    tags: ["#minecraft:treasure"];
}
// Action: remove_value_from_list avec value: "#minecraft:treasure" et mode: ["if_type_string", "remove_if_empty"]
// Résultat: {} (valeur string → retire → liste vide → supprime champ)
```

### 9. `list_operation` - Opérations sur les listes

Ajoute des éléments au début ou à la fin d'une liste.

```typescript
{
    type: "list_operation",
    field: "tags",
    mode: "append", // ou "prepend"
    flag: ["not_duplicate"],
    value: "#minecraft:new_tag"
}
```

**Modes :**

- `append` : Ajoute à la fin
- `prepend` : Ajoute au début

**Flags :**

- `not_duplicate` : N'ajoute pas si déjà présent

### 10. `set_value_from_computed_value` - Valeur calculée

Définit une valeur calculée par le **frontend**. L'action utilise le 4ème
paramètre `value` de `updateData()` qui contient la valeur pré-calculée côté
interface.

```typescript
{
    type: "set_value_from_computed_value",
    field: "weight"
}
```

**Utilisation :**

```typescript
// Le frontend calcule la valeur optimale
const computedWeight = calculateOptimalWeight(enchantment);

// Puis l'envoie via updateData
const result = updateData(
    {
        type: "set_value_from_computed_value",
        field: "weight",
    },
    enchantment,
    version,
    computedWeight, // ← Valeur calculée par le frontend
);
```

**Comportement :**

1. **Frontend** : Analyse l'élément et calcule la valeur optimale
2. **Action** : Applique directement la valeur reçue (pas de calcul côté engine)
3. **Résultat** : `element[field] = value`

**Exemples de calculs frontend :**

```typescript
// Calcul du poids selon la rareté
function calculateOptimalWeight(enchant: EnchantmentProps): number {
    if (enchant.tags.includes("#minecraft:treasure")) return 1;
    if (enchant.maxLevel > 3) return 5;
    if (hasStrongEffects(enchant.effects)) return 2;
    return 10; // Normal
}

// Calcul du coût d'enclume
function calculateAnvilCost(enchant: EnchantmentProps): number {
    const multiplier = enchant.weight <= 2 ? 4 : 2;
    return Math.max(1, enchant.maxLevel * multiplier);
}

// Calcul des slots appropriés
function calculateOptimalSlots(enchant: EnchantmentProps): string[] {
    if (hasProtectionEffect(enchant.effects)) return ["armor"];
    if (hasWeaponEffect(enchant.effects)) return ["mainhand"];
    if (hasToolEffect(enchant.effects)) return ["mainhand"];
    return ["any"];
}
```

**Avantages de cette approche :**

- **Flexibilité** : Le frontend peut implémenter des logiques complexes
- **Performance** : Pas de calcul lourd côté engine
- **Réactivité** : Calculs en temps réel selon l'état UI
- **Extensibilité** : Facile d'ajouter de nouvelles règles de calcul

### 11. `toggle_value_from_computed_value` - Basculer valeur calculée

Bascule entre la valeur actuelle et une valeur calculée par le **frontend**.
Utilise le 4ème paramètre `value` de `updateData()` pour recevoir la valeur
alternative pré-calculée.

```typescript
{
    type: "toggle_value_from_computed_value",
    field: "weight"
}
```

**Utilisation :**

```typescript
// Le frontend calcule la valeur alternative
const currentWeight = enchantment.weight;
const alternativeWeight = calculateAlternativeWeight(
    enchantment,
    currentWeight,
);

// Puis l'envoie via updateData
const result = updateData(
    {
        type: "toggle_value_from_computed_value",
        field: "weight",
    },
    enchantment,
    version,
    alternativeWeight, // ← Valeur alternative calculée par le frontend
);
```

**Comportement :**

1. **Frontend** : Analyse l'élément et calcule la valeur alternative appropriée
2. **Action** : Applique directement la valeur reçue (toggle simple)
3. **Résultat** : `element[field] = value`

**Exemples de logiques frontend :**

```typescript
// Toggle intelligent du poids
function calculateAlternativeWeight(
    enchant: EnchantmentProps,
    current: number,
): number {
    const optimal = calculateOptimalWeight(enchant); // 10 pour normal

    if (current === optimal) {
        // Si déjà optimal, proposer une alternative
        return enchant.tags.includes("#minecraft:treasure") ? 1 : 5;
    } else {
        // Sinon, revenir à l'optimal
        return optimal;
    }
}

// Toggle cyclique du niveau max
function toggleMaxLevel(enchant: EnchantmentProps, current: number): number {
    const cycle = [1, 3, 5];
    const currentIndex = cycle.indexOf(current);
    const nextIndex = (currentIndex + 1) % cycle.length;
    return cycle[nextIndex];
}

// Toggle des slots avec logique contextuelle
function toggleSlots(enchant: EnchantmentProps, current: string[]): string[] {
    const currentStr = current.join(",");

    switch (currentStr) {
        case "mainhand":
            return ["any"];
        case "armor":
            return ["mainhand"];
        case "any":
            return ["armor"];
        default:
            return ["mainhand"]; // Fallback
    }
}
```

**Patterns de toggle courants :**

**Toggle binaire :**

```typescript
// Entre deux valeurs fixes
function toggleBinary(current: boolean): boolean {
    return !current;
}
```

**Toggle cyclique :**

```typescript
// Cycle entre plusieurs valeurs
function toggleCyclic<T>(current: T, options: T[]): T {
    const index = options.indexOf(current);
    return options[(index + 1) % options.length];
}
```

**Toggle contextuel :**

```typescript
// Selon l'état de l'élément
function toggleContextual(element: any, current: any): any {
    if (isOptimal(element, current)) {
        return getAlternative(element);
    } else {
        return getOptimal(element);
    }
}
```

**Avantages de cette approche :**

- **Contrôle total** : Le frontend décide de la logique de toggle
- **Flexibilité** : Peut implémenter des cycles complexes
- **Réactivité** : Toggle en temps réel selon l'état UI
- **Simplicité** : L'engine fait juste `element[field] = value`

### 12. `sequential` - Actions séquentielles

Exécute plusieurs actions dans l'ordre.

```typescript
{
    type: "sequential",
    actions: [
        { type: "set_value", field: "maxLevel", value: 5 },
        { type: "set_value", field: "weight", value: 10 }
    ]
}
```

### 13. `alternative` - Actions conditionnelles

Exécute différentes actions selon des conditions.

```typescript
{
    type: "alternative",
    field: "mode",
    cases: [
        {
            when: "normal",
            do: { type: "set_value", field: "weight", value: 10 }
        },
        {
            when: "treasure",
            do: { type: "set_value", field: "weight", value: 1 }
        }
    ]
}
```

## 🔧 Types de valeurs

### ActionValue

```typescript
type ActionValue = string | number | boolean | IdentifierObject | GetValueField;
```

### GetValueField

Pour récupérer une valeur depuis un autre champ :

```typescript
{
    type: "get_value_from_field",
    field: "maxLevel"
}
```

## 💡 Conseils d'utilisation

1. **Chaînage** : Utilisez `sequential` pour enchaîner plusieurs modifications
2. **Conditions** : Utilisez `alternative` pour des logiques conditionnelles
3. **Listes** : Préférez `toggle_value_in_list` pour gérer les tags
4. **Nettoyage** : Utilisez `set_undefined` pour supprimer complètement des
   champs
5. **Performance** : Les actions sont optimisées, n'hésitez pas à les chaîner

## 🧪 Exemple complet

```typescript
// Action complexe qui modifie plusieurs aspects d'un enchantement
const complexAction = {
    type: "sequential",
    actions: [
        // Changer le niveau max
        { type: "set_value", field: "maxLevel", value: 3 },

        // Ajouter un tag
        {
            type: "toggle_value_in_list",
            field: "tags",
            value: "#minecraft:treasure",
        },

        // Supprimer un effet si c'est un trésor
        {
            type: "alternative",
            field: "mode",
            cases: [{
                when: "treasure",
                do: {
                    type: "remove_key",
                    field: "effects",
                    value: "minecraft:damage",
                },
            }],
        },
    ],
};

const result = updateData(complexAction, enchantment, 1);
```
