# Actions Enchantment - Domaine des enchantements

## Vue d'ensemble

Le domaine `enchantment` fournit des actions spécialisées pour manipuler les
enchantements Minecraft. Il étend les actions core avec des opérations
spécifiques aux slots d'enchantement.

## Actions disponibles

### `enchantment.set_computed_slot`

Toggle (ajoute ou supprime) un slot dans un tableau de slots d'enchantement.

**Signature** :

```typescript
{
    type: "enchantment.set_computed_slot";
    path: string;
    slot: SlotRegistryType;
}
```

**Paramètres** :

- `path` : Chemin vers le tableau de slots à modifier (ex: "slots")
- `slot` : Type de slot à toggle ("mainhand", "offhand", "armor", etc.)

**Types de slots disponibles** :

- `"any"` : Tous les slots (mainhand, offhand, armor)
- `"mainhand"` : Main principale
- `"offhand"` : Main secondaire
- `"hand"` : Les deux mains (mainhand + offhand)
- `"head"` : Casque
- `"chest"` : Plastron
- `"legs"` : Jambières
- `"feet"` : Bottes
- `"armor"` : Toutes les pièces d'armure (head, chest, legs, feet)
- `"body"` : Corps (pour les entités)
- `"saddle"` : Selle (pour les montures)

**Logique de toggle** :

- Si le slot est présent → Le supprime
- Si le slot n'est pas présent → L'ajoute
- Gère automatiquement les groupes (ex: si on ajoute tous les slots d'armure →
  devient "armor")

**Exemples** :

```typescript
// Toggle mainhand
const action = {
    type: "enchantment.set_computed_slot",
    path: "slots",
    slot: "mainhand",
};

// Toggle armor (toutes les pièces d'armure)
const action = {
    type: "enchantment.set_computed_slot",
    path: "slots",
    slot: "armor",
};

// Toggle offhand
const action = {
    type: "enchantment.set_computed_slot",
    path: "slots",
    slot: "offhand",
};
```

**Résultat** :

- Si `slots = ["mainhand"]` et on toggle "offhand" → `["mainhand", "offhand"]` →
  simplifié en `["hand"]`
- Si `slots = ["hand"]` et on toggle "mainhand" → `["offhand"]`
- Si `slots = ["head", "chest", "legs"]` et on toggle "feet" → `["armor"]`
- Si `slots = ["armor"]` et on toggle "head" → `["chest", "legs", "feet"]`

## Cas d'usage pratiques

### Activation/désactivation de slots

```typescript
// Enchantement initialement pour mainhand seulement
const enchantment = {
    slots: ["mainhand"],
    // ... autres propriétés
};

// Ajouter offhand
const addOffhandAction = {
    type: "enchantment.set_computed_slot",
    path: "slots",
    slot: "offhand",
};
// Résultat: slots = ["hand"] (optimisé automatiquement)

// Supprimer mainhand
const removeMainhandAction = {
    type: "enchantment.set_computed_slot",
    path: "slots",
    slot: "mainhand",
};
// Résultat: slots = ["offhand"]
```

### Gestion d'armure

```typescript
// Enchantement pour casque seulement
const armorEnchantment = {
    slots: ["head"],
};

// Ajouter tout l'armor
const addArmorAction = {
    type: "enchantment.set_computed_slot",
    path: "slots",
    slot: "armor",
};
// Résultat: slots = ["armor"] (toutes les pièces)

// Retirer juste le plastron
const removeChestAction = {
    type: "enchantment.set_computed_slot",
    path: "slots",
    slot: "chest",
};
// Résultat: slots = ["head", "legs", "feet"]
```

## Optimisations automatiques

Le système optimise automatiquement les tableaux de slots :

### Groupement par type

```typescript
// Avant: ["mainhand", "offhand"]
// Après: ["hand"]

// Avant: ["head", "chest", "legs", "feet"]
// Après: ["armor"]

// Avant: ["hand", "armor"]
// Après: ["any"]
```

### Dégroupement intelligent

```typescript
// Si on a ["armor"] et qu'on toggle "head"
// Résultat: ["chest", "legs", "feet"] (armor sans head)

// Si on a ["hand"] et qu'on toggle "mainhand"
// Résultat: ["offhand"] (hand sans mainhand)
```

## Gestion des erreurs

```typescript
// Slot invalide
const invalidAction = {
    type: "enchantment.set_computed_slot",
    path: "slots",
    slot: "invalid_slot", // ❌ Erreur
};

// Path vers un non-array
const wrongPathAction = {
    type: "enchantment.set_computed_slot",
    path: "description", // ❌ Erreur si description n'est pas un array
    slot: "mainhand",
};
```

## Intégration avec les versions

L'action nécessite un numéro de version pour déterminer le SlotManager approprié
:

```typescript
// Utilisation dans le contexte d'action
await updateData(action, element, 48); // Version requise
```

Cette action permet une gestion fine et intelligente des slots d'enchantement
avec optimisation automatique des groupes de slots.
