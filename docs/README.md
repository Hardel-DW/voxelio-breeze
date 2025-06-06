# Documentation Voxel Breeze

## Vue d'ensemble du projet

Voxel Breeze est une bibliothèque TypeScript conçue pour créer des outils web
pour Minecraft. Elle fournit un framework robuste pour manipuler, parser et
compiler des données de jeu Minecraft dans différents formats.

## Architecture du projet

### Structure principale

```
voxel-breeze/
├── src/
│   ├── core/              # Cœur du système
│   │   ├── engine/        # Moteur de traitement
│   │   │   ├── actions/   # Système d'actions
│   │   │   ├── managers/  # Gestionnaires de ressources
│   │   │   └── migrations/# Système de migration
│   │   └── schema/        # Schémas de données
│   ├── converter/         # Convertisseurs de formats
│   ├── schema/           # Définitions de schémas
│   └── exports/          # Points d'export publics
├── test/                 # Tests unitaires
├── demo/                 # Démonstrations
├── benchmark/            # Benchmarks
└── docs/                 # Documentation
```

### Composants principaux

**🔧 Moteur d'actions** (`src/core/engine/actions/`)

- Système modulaire d'actions pour transformer les données
- Architecture basée sur des domaines (core, enchantment, loot_table, recipe)
- Registre d'actions avec chargement dynamique

**📊 Système de schémas** (`src/core/schema/`)

- Parsers pour convertir depuis les formats Minecraft
- Compilers pour générer les formats Minecraft
- Support pour enchantements, tables de loot et recettes

**🔄 Gestionnaires** (`src/core/engine/managers/`)

- Gestion des slots et des ressources
- Coordination entre les différents systèmes

**📝 Migrations et logging** (`src/core/engine/migrations/`)

- Suivi des changements avec système de différentiel
- Export des modifications en JSON
- Historique des opérations

## Concepts clés

### Format Voxel vs Format Minecraft

Le projet fait la distinction entre :

- **Format Minecraft** : Format JSON natif utilisé par le jeu
- **Format Voxel** : Format simplifié et optimisé pour les outils web

### Domaines d'actions

Le système d'actions est organisé en domaines :

- `core` : Actions de base (set_value, toggle, etc.)
- `enchantment` : Actions spécifiques aux enchantements
- `loot_table` : Actions pour les tables de loot
- `recipe` : Actions pour les recettes

### Cycle de vie des données

1. **Parsing** : Minecraft JSON → Format Voxel
2. **Actions** : Modifications via le système d'actions
3. **Compiling** : Format Voxel → Minecraft JSON

## Documentation

### 📋 Guides de parsing et compiling

- [**Guide Enchantement**](./enchantment-guide.md) - Conversion bidirectionnelle
  des enchantements
- [**Guide Loot Table**](./loot-table-guide.md) - Conversion des tables de loot
- [**Guide Recipe**](./recipe-guide.md) - Conversion des recettes de craft
- [**Guide Structure**](./structure-guide.md) - Conversion des structures et
  système Jigsaw

### ⚡ Documentation des actions

#### Actions par domaine

- [**Actions Core**](./actions-core.md) - Actions de base (set_value, toggle,
  etc.)
- [**Actions Enchantment**](./actions-enchantment.md) - Actions spécifiques aux
  enchantements
- [**Actions Loot Table**](./actions-loot-table.md) - Actions pour les tables de
  loot
- [**Actions Recipe**](./actions-recipe.md) - Actions pour les recettes
- [**Actions Structure**](./actions-structure.md) - Actions pour les structures
  et spawn overrides

#### Système d'actions

- [**Actions Utils**](./actions-utils.md) - Utilitaires pour les actions
- [**Actions Types**](./actions-types.md) - Système de types des actions
- [**Actions Registry**](./actions-registry.md) - Registre et chargement des
  actions
- [**Actions Index**](./actions-index.md) - Point d'entrée principal des actions

### 🔧 Documentation technique

- [**Parsing**](./parsing.md) - Architecture générale du parsing
- [**Compiling**](./compiling.md) - Architecture générale du compiling

### 🏗️ Guide de développement

- [**Ajout d'un nouveau concept**](./adding-new-concept.md) - Guide complet pour
  implémenter un nouveau concept depuis zéro

## Installation et utilisation

```bash
pnpm add @voxelio/breeze
```
