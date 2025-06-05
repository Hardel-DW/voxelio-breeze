# Migration System - Usage Simple

## API Minimale

```typescript
import { Logger } from "@/core/engine/migrations";

// Tool operations (auto-tracked)
const logger = new Logger();

await logger.trackChanges(element, async (el) => {
    return await updateData(action, el);
});

// Manual changes detection
logger.sync(beforeState, afterState, "element_id", "element_type");

// Export pour datapack
const json = logger.exportJson(); // Un seul fichier

// Import depuis datapack
logger.importJson(json);

// Utils
logger.getChanges();
logger.clearChanges();
```

## Workflow

### 1. **Outil - Tracking Automatique**

```typescript
// Chaque action est automatiquement trackée
const result = await logger.trackChanges(lootTable, async (table) => {
    return await updateData({
        type: "loot_table.add_loot_item",
        item: "minecraft:diamond",
    }, table);
});
```

### 2. **Téléchargement - Export JSON**

```typescript
// Générer le fichier pour le datapack
const migrationJson = logger.exportJson();

// À sauvegarder dans: datapack/voxel_studio_log.json
downloadDatapack({
    ...otherFiles,
    "voxel_studio_log.json": migrationJson,
});
```

### 3. **Re-upload - Bouton "Sync Changes"**

```typescript
// Quand utilisateur re-upload le datapack
function syncChangesButton() {
    // 1. Charger les logs existants
    if (migrationFile) {
        logger.importJson(migrationFile.content);
    }

    // 2. Détecter les changements manuels
    savedElements.forEach((saved, index) => {
        const current = currentElements[index];
        logger.sync(saved, current);
    });

    // 3. Tous les changements sont maintenant trackés
    updateUI();
}
```

## Format JSON Généré

```json
{
    "voxel_studio_log": {
        "version": "1.0.0",
        "generated_at": "2023-01-01T00:00:00.000Z",
        "changes": [
            {
                "element_id": "minecraft:diamond_ore",
                "element_type": "loot_table",
                "differences": [
                    {
                        "type": "add",
                        "path": "pools[0].entries[0]",
                        "value": {
                            "type": "minecraft:item",
                            "name": "minecraft:diamond"
                        }
                    }
                ],
                "timestamp": "2023-01-01T00:00:00.000Z"
            }
        ]
    }
}
```

## Avantages

- **Un seul fichier** au lieu de 2
- **API unifiée** : `trackChanges()` + `sync()`
- **Système unique** : même mécanisme de diff pour tout
- **~200 lignes** au lieu de 600
- **Aucune distinction** manuel/tool

## Implémentation Frontale

```typescript
// Global logger pour toute l'app
import { logger } from "voxel-breeze/migrations";

// Dans chaque action d'outil
async function addLootItem(table, item) {
    return await logger.trackChanges(table, async (t) => {
        return await updateData({ type: "loot_table.add_loot_item", item }, t);
    });
}

// Bouton sync changes
async function handleSyncChanges() {
    const datapack = await selectDatapackFolder();

    // Import existing logs
    const logFile = datapack.files["voxel_studio_log.json"];
    if (logFile) logger.importJson(logFile);

    // Detect manual changes
    // (compare saved state vs current state)
    for (const element of getCurrentElements()) {
        const saved = getSavedState(element.id);
        if (saved) {
            logger.sync(saved, element);
        }
    }

    refreshUI();
}
```
