# Guide des mécaniques d'enchantement - Minecraft Java 1.21

## Vue d'ensemble

Depuis la version 1.21, Minecraft utilise un système **data-driven** pour les
enchantements, remplaçant le code hardcodé par des fichiers JSON configurables.
Ce guide explique comment fonctionne la table d'enchantement et comment le
système détermine les enchantements disponibles.

## Architecture data-driven

### Ressources utilisées

Le système d'enchantement utilise trois types de ressources :

1. **`data/enchantment/`** : Définitions des enchantements
2. **`data/tags/enchantment/`** : Tags d'enchantements (ex:
   `in_enchanting_table`)
3. **`data/tags/item/`** : Tags d'items pour la compatibilité

### Structure d'un enchantement

```json
{
  "description": { "translate": "enchantment.minecraft.sharpness" },
  "max_level": 5,
  "weight": 10,
  "min_cost": { "base": 1, "per_level_above_first": 11 },
  "max_cost": { "base": 21, "per_level_above_first": 11 },
  "supported_items": "#minecraft:weapon",
  "primary_items": "#minecraft:sword",
  "exclusive_set": "#minecraft:damage",
  "effects": { "minecraft:damage": { ... } },
  "slots": ["mainhand"]
}
```

## Mécaniques de la table d'enchantement

### 1. Génération des niveaux d'enchantement

La table d'enchantement génère 3 options selon ces formules :

```typescript
// Niveau de base (affecté par les étagères)
const base = randomInt(1, 8) + floor(bookshelves / 2) +
    randomInt(0, bookshelves);

// Les 3 slots
const topSlot = floor(max(base / 3, 1)); // Minimum 1
const middleSlot = floor((base * 2) / 3 + 1); // Intermédiaire
const bottomSlot = floor(max(base, bookshelves * 2)); // Maximum
```

**Exemple avec 15 étagères** :

- Base possible : 9 à 38
- Top slot : 3 à 12
- Middle slot : 7 à 26
- Bottom slot : 30 (fixe)

### 2. Impact des étagères

| Étagères | Niveau min (top) | Niveau max (bottom) |
| -------- | ---------------- | ------------------- |
| 0        | 1                | 8                   |
| 5        | 1                | 15                  |
| 10       | 2                | 23                  |
| 15       | 2                | 30                  |

**Configuration optimale** : 15 étagères placées à exactement 2 blocs de
distance de la table.

## Sélection des enchantements

### 1. Enchantements disponibles

Un enchantement est disponible dans la table si :

```typescript
// 1. Il est dans le tag "in_enchanting_table"
const isInTable = inEnchantingTableTags.has(enchantmentId);

// 2. Il est compatible avec l'item
const isCompatible = checkItemCompatibility(enchantment, itemTags);

// 3. Son niveau de coût correspond au niveau de puissance
const applicableLevel = calculateApplicableLevel(enchantment, powerLevel);
```

### 2. Compatibilité avec les items

La compatibilité utilise cette logique **exclusive** :

```typescript
// Si primary_items est défini, on utilise SEULEMENT primary_items
// Sinon, on utilise supported_items
const items = enchantment.primary_items || enchantment.supported_items;

// Support des tags et items directs
if (supportedItem.startsWith("#")) {
    // Tag d'item (ex: "#minecraft:weapon")
    const tagName = supportedItem.substring(1);
    return itemTags.includes(tagName);
} else {
    // Item direct (ex: "minecraft:diamond_sword")
    return itemTags.includes(supportedItem);
}
```

**⚠️ Contraintes importantes** :

- **`supported_items`** : **Obligatoire** - Doit toujours exister
- **`primary_items`** : **Optionnel** - Remplace `supported_items` s'il existe
- **Si seul `primary_items` existe** → **CRASH** (supported_items requis)

**💡 Différence d'usage** :

- **`supported_items`** : Utilisé par les **commandes `/enchant`** et les
  **enclumes**
- **`primary_items`** : Utilisé par la **table d'enchantement** (si défini)

**Cas possibles** :

1. **`supported_items` seulement** :
   - ✅ Table d'enchantement : Utilise `supported_items`
   - ✅ Commande `/enchant` : Utilise `supported_items`
   - ✅ Enclume : Utilise `supported_items`

2. **`supported_items` + `primary_items`** :
   - ✅ Table d'enchantement : Utilise `primary_items` (ignore
     `supported_items`)
   - ✅ Commande `/enchant` : Utilise `supported_items`
   - ✅ Enclume : Utilise `supported_items`

3. **`primary_items` seulement** : ❌ **CRASH** (configuration invalide)

**Exemple concret** :

Sharpness : `primary_items: "#minecraft:sword"`,
`supported_items: "#minecraft:weapon"`

**Épée de diamant** :

- ✅ **Table d'enchantement** : Compatible (tag "sword" ∈ primary_items)
- ✅ **Commande `/enchant`** : Compatible (tag "weapon" ∈ supported_items)
- ✅ **Enclume** : Compatible (tag "weapon" ∈ supported_items)

**Hache de diamant** :

- ❌ **Table d'enchantement** : **Incompatible** (tag "sword" ∉ primary_items)
- ✅ **Commande `/enchant`** : Compatible (tag "weapon" ∈ supported_items)
- ✅ **Enclume** : Compatible (tag "weapon" ∈ supported_items)

**💡 Utilité** : Cela permet de limiter certains enchantements dans la table
d'enchantement tout en gardant la flexibilité pour les commandes et enclumes.

## Système de coût et niveaux

### 1. Fonctionnement des coûts

Chaque enchantement définit des plages de coût par niveau :

```json
{
    "min_cost": { "base": 1, "per_level_above_first": 11 },
    "max_cost": { "base": 21, "per_level_above_first": 11 }
}
```

**Calcul pour chaque niveau** :

```typescript
const minCost = base + (level - 1) * perLevelAboveFirst;
const maxCost = base + (level - 1) * perLevelAboveFirst;
```

**Exemple Sharpness** :

- Niveau 1 : coût 1-21
- Niveau 2 : coût 12-32
- Niveau 3 : coût 23-43
- Niveau 4 : coût 34-54
- Niveau 5 : coût 45-65

### 2. Détermination du niveau applicable

Le système trouve le **niveau le plus élevé** possible pour le niveau de
puissance :

```typescript
function calculateApplicableLevel(enchantment, powerLevel) {
    for (let level = 1; level <= enchantment.max_level; level++) {
        const minCost = calculateCost(enchantment.min_cost, level);
        const maxCost = calculateCost(enchantment.max_cost, level);

        if (powerLevel >= minCost && powerLevel <= maxCost) {
            // Chercher le niveau le plus élevé possible
            let applicableLevel = level;
            for (
                let higher = level + 1;
                higher <= enchantment.max_level;
                higher++
            ) {
                const higherMin = calculateCost(enchantment.min_cost, higher);
                const higherMax = calculateCost(enchantment.max_cost, higher);
                if (powerLevel >= higherMin && powerLevel <= higherMax) {
                    applicableLevel = higher;
                } else break;
            }
            return applicableLevel;
        }
    }
    return 0; // Aucun niveau applicable
}
```

## Enchantability et modificateurs

### 1. Valeurs d'enchantability par matériau

| Matériau  | Enchantability |
| --------- | -------------- |
| Bois      | 15             |
| Cuir      | 15             |
| Pierre    | 5              |
| Fer       | 14             |
| Maille    | 12             |
| Or        | 22             |
| Diamant   | 10             |
| Netherite | 15             |

### 2. Application des modificateurs

Le niveau de base est modifié par l'enchantability :

```typescript
function applyEnchantabilityModifiers(baseLevel, enchantability) {
    // Deux modificateurs aléatoires
    const modifier1 = randomInt(0, floor(enchantability / 4)) + 1;
    const modifier2 = randomInt(0, floor(enchantability / 4)) + 1;

    // Niveau modifié
    let modifiedLevel = baseLevel + modifier1 + modifier2;

    // Bonus aléatoire (±15%)
    const randomBonus = 1 + (random() + random() - 1) * 0.15;
    modifiedLevel = round(modifiedLevel * randomBonus);

    return max(1, modifiedLevel);
}
```

**Impact** : Plus l'enchantability est élevée, plus le niveau effectif peut être
augmenté, permettant des enchantements de plus haut niveau.

## Sélection et exclusivité

### 1. Algorithme de sélection

```typescript
function selectEnchantments(possibleEnchantments, level) {
    const selected = [];

    // 1. Sélection pondérée du premier enchantement
    const first = weightedRandomSelect(possibleEnchantments);
    selected.push(first);

    // 2. Enchantements supplémentaires (probabilité décroissante)
    let extraChance = (level + 1) / 50.0;

    while (remaining.length > 0 && random() < extraChance) {
        // Filtrer les enchantements incompatibles
        remaining = remaining.filter((e) =>
            areEnchantmentsCompatible(e.id, selected.map((s) => s.enchantment))
        );

        const next = weightedRandomSelect(remaining);
        if (next) {
            selected.push(next);
            extraChance *= 0.5; // Réduire les chances
        }
    }

    return selected;
}
```

### 2. Système d'exclusivité

Les enchantements peuvent être mutuellement exclusifs via `exclusive_set` :

```json
{
    "exclusive_set": "#minecraft:damage" // Incompatible avec autres enchantements de dégâts
}
```

Le système vérifie les intersections de tags d'exclusivité :

```typescript
function areEnchantmentsCompatible(newId, existingIds) {
    const newExclusiveSet = getExclusiveSet(newId);

    for (const existingId of existingIds) {
        const existingExclusiveSet = getExclusiveSet(existingId);

        // Vérifier si les tags d'exclusivité se chevauchent
        if (shareExclusiveTag(newExclusiveSet, existingExclusiveSet)) {
            return false;
        }
    }
    return true;
}
```

## Champs sans impact sur la table

Certains champs de l'enchantement **n'affectent pas** la génération dans la
table :

- **`slots`** : Détermine **comment l'effet se déclenche** selon l'emplacement
  - `["mainhand", "offhand"]` : Effet actif quand on **utilise** l'objet en main
  - `["armor"]` : Effet actif quand on **porte** la pièce d'armure (même en
    frappant avec autre chose)
- **`anvil_cost`** : Coût de réparation/combinaison sur l'enclume
- **`description`** : Texte affiché (traduction)
- **`effects`** : Effets de gameplay (dégâts, protection, etc.)

**Exemple `slots`** :

- Fire Aspect sur épée (`["mainhand"]`) : Brûlure quand on **frappe avec
  l'épée**
- Fire Aspect sur armure (`["armor"]`) : Brûlure quand on **frappe avec
  n'importe quoi** (l'armure est équipée)

Ces champs sont utilisés **après** l'obtention de l'enchantement, pas pendant la
sélection.

## Simulation et probabilités

### 1. Calcul de probabilités

La classe `EnchantmentSimulator` permet de calculer les probabilités :

```typescript
const simulator = new EnchantmentSimulator(enchantments, tags);

const stats = simulator.calculateEnchantmentProbabilities(
    15, // 15 étagères
    10, // Enchantability diamant
    ["minecraft:sword"], // Tags de l'item
    10000, // Nombre d'itérations
);

// Résultat : probabilité de chaque enchantement
stats.forEach((stat) => {
    console.log(`${stat.enchantmentId}: ${stat.probability.toFixed(2)}%`);
});
```

### 2. Simulation de table

```typescript
const options = simulator.simulateEnchantmentTable(
    15, // Étagères
    10, // Enchantability
    ["minecraft:sword"], // Tags item
);

// 3 options : [topSlot, middleSlot, bottomSlot]
options.forEach((option, i) => {
    console.log(`Option ${i + 1} (coût ${option.cost}):`);
    option.enchantments.forEach((ench) => {
        console.log(`  ${ench.enchantment} ${ench.level}`);
    });
});
```

## Exemples pratiques

### Épée en diamant avec 15 étagères

**Setup** :

- Item : `minecraft:diamond_sword`
- Tags : `["minecraft:sword", "minecraft:weapon"]`
- Enchantability : 10
- Étagères : 15

**Enchantements possibles** :

- Sharpness (poids 10) - dégâts
- Smite (poids 5) - vs morts-vivants
- Bane of Arthropods (poids 5) - vs arthropodes
- Knockback (poids 5) - recul
- Fire Aspect (poids 2) - feu
- Looting (poids 2) - butin
- Sweeping Edge (poids 2) - attaque en zone
- Unbreaking (poids 5) - durabilité
- Mending (poids 2) - réparation

**Exclusivités** :

- Sharpness ⚔️ Smite ⚔️ Bane of Arthropods (damage)
- Mending ⚔️ Infinity (si applicable)

### Livre avec 0 étagère

**Setup** :

- Item : `minecraft:book`
- Tags : `[]` (tous enchantements applicables)
- Enchantability : 1
- Étagères : 0

**Résultat** :

- Niveaux possibles : 1-8
- Modificateurs enchantability : +1 à +1 (très faible)
- Enchantements de bas niveau uniquement
- Probabilité d'enchantements multiples très faible

Ce système data-driven offre une flexibilité complète pour personnaliser les
mécaniques d'enchantement via des datapacks tout en maintenant la complexité du
système original.
