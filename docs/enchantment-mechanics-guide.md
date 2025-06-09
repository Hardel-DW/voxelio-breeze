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
const clampedBookshelves = Math.min(15, Math.max(0, bookshelves));
const base = randomInt(1, 8) + Math.floor(clampedBookshelves / 2) +
    randomInt(0, clampedBookshelves);

// Les 3 slots
const topSlot = Math.floor(Math.max(base / 3, 1)); // Minimum 1
const middleSlot = Math.floor((base * 2) / 3 + 1); // Intermédiaire
const bottomSlot = Math.floor(Math.max(base, clampedBookshelves * 2)); // Maximum
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
const isInTable = this.isEnchantmentInEnchantingTable(enchantmentId);

// 2. Il est compatible avec l'item
const isCompatible = this.checkItemCompatibility(enchantment, itemTagSet);

// 3. Son niveau de coût correspond au niveau de puissance
const applicableLevel = this.calculateApplicableLevel(
    enchantment,
    modifiedLevel,
);
```

### 2. Compatibilité avec les items

La compatibilité utilise cette logique **exclusive** avec optimisation par
mapping :

```typescript
// Construction du mapping item -> enchantements (optimisation)
private buildItemTagToEnchantmentsMap(): void {
    for (const [id, enchantment] of this.enchantments.entries()) {
        const items = enchantment.primary_items || enchantment.supported_items;
        const supportedItems = Array.isArray(items) ? items : [items];

        for (const supportedItem of supportedItems) {
            if (!this.itemTagToEnchantmentsMap.has(supportedItem)) {
                this.itemTagToEnchantmentsMap.set(supportedItem, []);
            }
            this.itemTagToEnchantmentsMap.get(supportedItem)?.push(id);
        }
    }
}

// Recherche des enchantements candidats
private findPossibleEnchantments(level: number, itemTagSet: Set<string>): Array<EnchantmentPossible> {
    const candidateEnchantmentIds = new Set<string>();
    
    for (const tag of itemTagSet) {
        // Support direct du tag
        const enchantments = this.itemTagToEnchantmentsMap.get(tag) ?? [];
        for (const enchId of enchantments) {
            candidateEnchantmentIds.add(enchId);
        }
        
        // Support du tag avec préfixe #
        const hashTag = `#${tag}`;
        const enchantmentsForHash = this.itemTagToEnchantmentsMap.get(hashTag) ?? [];
        for (const enchId of enchantmentsForHash) {
            candidateEnchantmentIds.add(enchId);
        }
    }
    
    // Filtrage et validation
    const possible: Array<EnchantmentPossible> = [];
    for (const id of candidateEnchantmentIds) {
        const enchantment = this.enchantments.get(id);
        if (!enchantment) continue;

        if (!this.isEnchantmentInEnchantingTable(id)) {
            continue;
        }

        const enchLevel = this.calculateApplicableLevel(enchantment, level);
        if (enchLevel > 0) {
            possible.push({
                id,
                enchantment,
                weight: enchantment.weight,
                applicableLevel: enchLevel
            });
        }
    }

    return possible;
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
private calculateEnchantmentCost(cost: { base: number; per_level_above_first: number }, level: number): number {
    return cost.base + Math.max(0, level - 1) * cost.per_level_above_first;
}
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
private calculateApplicableLevel(enchantment: Enchantment, powerLevel: number): number {
    // Optimisation : partir du niveau le plus élevé
    for (let level = enchantment.max_level; level >= 1; level--) {
        const minCost = this.calculateEnchantmentCost(enchantment.min_cost, level);
        const maxCost = this.calculateEnchantmentCost(enchantment.max_cost, level);
        
        if (powerLevel >= minCost && powerLevel <= maxCost) {
            return level; // Premier niveau trouvé = le plus élevé
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
private applyEnchantabilityModifiers(baseLevel: number, enchantability: number): number {
    // Deux modificateurs aléatoires
    const modifier1 = this.randomInt(0, Math.floor(enchantability / 4)) + 1;
    const modifier2 = this.randomInt(0, Math.floor(enchantability / 4)) + 1;
    let modifiedLevel = baseLevel + modifier1 + modifier2;

    // Bonus aléatoire (±15%) - formule améliorée
    const randomBonus = 1 + (Math.random() + Math.random() - 1) * 0.15;
    modifiedLevel = Math.round(modifiedLevel * randomBonus);

    return Math.max(1, modifiedLevel);
}
```

**Impact** : Plus l'enchantability est élevée, plus le niveau effectif peut être
augmenté, permettant des enchantements de plus haut niveau.

## Sélection et exclusivité

### 1. Algorithme de sélection

```typescript
private selectEnchantments(possibleEnchantments: Array<EnchantmentPossible>, level: number): Array<EnchantmentEntry> {
    if (possibleEnchantments.length === 0) return [];

    const selected: Array<EnchantmentEntry> = [];
    let remaining = [...possibleEnchantments];

    // 1. Sélection pondérée du premier enchantement
    const first = this.weightedRandomSelect(remaining);
    if (first) {
        selected.push({
            enchantment: first.id,
            level: first.applicableLevel,
            power: first.applicableLevel
        });
        remaining = remaining.filter((e) => e.id !== first.id);
    }

    // 2. Enchantements supplémentaires (probabilité décroissante)
    let extraChance = (level + 1) / 50.0;

    while (remaining.length > 0 && Math.random() < extraChance) {
        // Filtrer les enchantements incompatibles
        remaining = remaining.filter((e) =>
            this.areEnchantmentsCompatible(
                e.id,
                selected.map((s) => s.enchantment)
            )
        );

        if (remaining.length === 0) break;

        const next = this.weightedRandomSelect(remaining);
        if (next) {
            selected.push({
                enchantment: next.id,
                level: next.applicableLevel,
                power: next.applicableLevel
            });
            remaining = remaining.filter((e) => e.id !== next.id);
        }

        extraChance *= 0.5; // Réduire les chances
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

Le système vérifie les intersections de tags d'exclusivité avec support des
arrays :

```typescript
private areEnchantmentsCompatible(newEnchantmentId: string, existingEnchantmentIds: string[]): boolean {
    const newEnchant = this.enchantments.get(newEnchantmentId);
    if (!newEnchant || !newEnchant.exclusive_set) {
        return true;
    }

    // Support des arrays et valeurs simples
    const newSets = Array.isArray(newEnchant.exclusive_set) 
        ? newEnchant.exclusive_set 
        : [newEnchant.exclusive_set];

    for (const existingId of existingEnchantmentIds) {
        const existingEnchant = this.enchantments.get(existingId);
        if (!existingEnchant || !existingEnchant.exclusive_set) {
            continue;
        }

        const existingSets = Array.isArray(existingEnchant.exclusive_set)
            ? existingEnchant.exclusive_set
            : [existingEnchant.exclusive_set];

        // Vérifier si les tags d'exclusivité se chevauchent
        for (const newSet of newSets) {
            for (const existingSet of existingSets) {
                if (newSet === existingSet) {
                    return false;
                }
            }
        }
    }
    return true;
}
```

### 3. Sélection pondérée améliorée

```typescript
private weightedRandomSelect<T extends { weight: number }>(items: T[]): T | null {
    if (items.length === 0) return null;

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    
    // Gestion du cas où tous les poids sont 0
    if (totalWeight === 0) {
        return items[Math.floor(Math.random() * items.length)];
    }

    let random = Math.random() * totalWeight;
    for (const item of items) {
        if (random < item.weight) {
            return item;
        }
        random -= item.weight;
    }

    return null; // Fallback
}
```

## Gestion des tags et performance

### 1. TagsComparator intégré

Le simulateur utilise le système de tags intégré pour une gestion optimisée :

```typescript
constructor(enchantments: Map<string, Enchantment>, tags?: DataDrivenRegistryElement<TagType>[]) {
    this.enchantments = enchantments;

    if (tags && tags.length > 0) {
        this.tagsComparator = new TagsComparator(tags);
        this.initializeInEnchantingTableValues(tags);
    }
    this.buildItemTagToEnchantmentsMap();
}

private initializeInEnchantingTableValues(tags: DataDrivenRegistryElement<TagType>[]): void {
    const inEnchantingTableTag = tags.find(
        (tag) => tag.identifier.resource === "in_enchanting_table" && 
               tag.identifier.registry === "tags/enchantment"
    );

    if (inEnchantingTableTag && this.tagsComparator) {
        const values = this.tagsComparator.getRecursiveValues(inEnchantingTableTag.identifier);
        this.inEnchantingTableValues = new Set(values);
    }
}

private isEnchantmentInEnchantingTable(enchantmentId: string): boolean {
    if (this.inEnchantingTableValues.size === 0) return true;
    const normalizedId = Identifier.normalize(enchantmentId, "enchantment");
    return this.inEnchantingTableValues.has(normalizedId);
}
```

### 2. Optimisations de performance

- **Mapping pré-calculé** : `itemTagToEnchantmentsMap` évite les recherches
  répétées
- **Sets pour les candidats** : Élimination automatique des doublons
- **Recherche descendante** : `calculateApplicableLevel` commence par le niveau
  max
- **Filtrage précoce** : Vérification du tag `in_enchanting_table` avant les
  calculs coûteux

## Interfaces et types

### 1. Interfaces principales

```typescript
export interface ItemData {
    id: string;
    enchantability: number;
    tags: string[];
}

export interface EnchantmentOption {
    level: number; // Niveau de base du slot
    cost: number; // Coût en XP
    enchantments: Array<EnchantmentEntry>;
}

export interface EnchantmentStats {
    enchantmentId: string;
    probability: number; // Probabilité en %
    averageLevel: number; // Niveau moyen
    minLevel: number; // Niveau minimum observé
    maxLevel: number; // Niveau maximum observé
}
```

### 2. Interfaces internes

```typescript
interface EnchantmentEntry {
    enchantment: string; // ID de l'enchantement
    level: number; // Niveau applicable
    power: number; // Puissance (= level)
}

interface EnchantmentPossible {
    id: string;
    enchantment: Enchantment;
    weight: number;
    applicableLevel: number;
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

La classe `EnchantmentSimulator` permet de calculer les probabilités avec des
statistiques avancées :

```typescript
const simulator = new EnchantmentSimulator(enchantments, tags);

const stats = simulator.calculateEnchantmentProbabilities(
    15, // 15 étagères
    10, // Enchantability diamant
    ["minecraft:sword"], // Tags de l'item
    10000, // Nombre d'itérations
);

// Résultat : statistiques détaillées par enchantement
stats.forEach((stat) => {
    console.log(`${stat.enchantmentId}:`);
    console.log(`  Probabilité: ${stat.probability.toFixed(2)}%`);
    console.log(`  Niveau moyen: ${stat.averageLevel.toFixed(1)}`);
    console.log(`  Plage: ${stat.minLevel}-${stat.maxLevel}`);
});
```

### 2. Simulation de table

```typescript
const options = simulator.simulateEnchantmentTable(
    15, // Étagères
    10, // Enchantability
    ["minecraft:sword"], // Tags item
);

// Retourne un tuple de 3 options : [topSlot, middleSlot, bottomSlot]
options.forEach((option, i) => {
    console.log(
        `Option ${i + 1} (niveau ${option.level}, coût ${option.cost}):`,
    );
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

### Performance et optimisations

**Nouvelles optimisations dans le simulateur** :

1. **Pré-calcul des mappings** : Évite les recherches O(n) répétées
2. **Gestion intelligente des tags** : Support automatique des formats `tag` et
   `#tag`
3. **Filtrage précoce** : Élimination rapide des enchantements non-éligibles
4. **Statistics robustes** : Calculs de min/max/moyenne sur de gros échantillons

Ce système data-driven offre une flexibilité complète pour personnaliser les
mécaniques d'enchantement via des datapacks tout en maintenant la complexité du
système original avec des performances optimisées.
