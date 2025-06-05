# Migration System Usage

## Utilisation Simple

### 1. Logging des Changements Automatique

```typescript
import { getMigrationJson, globalLogger } from "@/core/engine/migrations";
import { updateData } from "@/core/engine/actions";

// Le logger track automatiquement les changements
const element = {
    identifier: {
        namespace: "minecraft",
        registry: "loot_table",
        resource: "blocks/diamond_ore",
    },
    name: "Diamond Ore Loot",
    pools: [],
};

// Les actions sont automatiquement loggées
const result = await globalLogger.trackChanges(element, async (el) => {
    return await updateData({
        type: "loot_table.add_loot_item",
        item: "minecraft:diamond",
        weight: 1,
    }, el);
});

// Récupérer le JSON pour le datapack
const migrationJson = getMigrationJson(); // Retourne le JSON
```

### 2. Sauvegarde dans le Datapack

```typescript
import { createDatapackMigrationFile } from "@/core/engine/migrations";

// Créer le fichier pour le datapack
const migrationFile = createDatapackMigrationFile(globalLogger);

// migrationFile.filename = "voxel_studio_changes.json"
// migrationFile.content = JSON complet des changements

// À ajouter dans le datapack avant téléchargement
```

### 3. Bouton "Sync Changes" - Détection Manuelle

```typescript
import {
    globalLogger,
    syncWithUploadedDatapack,
} from "@/core/engine/migrations";

// Quand l'utilisateur re-upload un datapack
async function handleDatapackUpload(
    datapackFiles: FileList,
    currentElements: any[],
) {
    let migrationJson = null;
    let snapshotJson = null;

    // Chercher les fichiers de migration dans le datapack
    for (const file of datapackFiles) {
        if (file.name === "voxel_studio_changes.json") {
            migrationJson = await file.text();
        }
        if (file.name === "voxel_studio_snapshot.json") {
            snapshotJson = await file.text();
        }
    }

    // Sync automatique
    const result = syncWithUploadedDatapack(
        migrationJson,
        snapshotJson,
        currentElements,
        globalLogger,
    );

    console.log(`Loaded ${result.loaded_changes} existing changes`);
    console.log(`Detected ${result.manual_changes.detected} manual changes`);
    console.log(`Total: ${result.total_changes} changes tracked`);
}

// Pour créer un snapshot avant téléchargement
function createSnapshotBeforeDownload(elements: any[]) {
    const snapshot = globalLogger.createSnapshot(elements);
    return {
        filename: "voxel_studio_snapshot.json",
        content: snapshot,
    };
}
```

### 4. Interface Utilisateur

```typescript
// Bouton "Sync Changes"
async function syncChangesButton() {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true; // Pour sélectionner le datapack folder

    input.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files) {
            await handleDatapackUpload(files, getCurrentDatapackElements());
            updateUI(); // Refresh l'interface avec les nouveaux changements
        }
    };

    input.click();
}
```

## Structure des Fichiers Générés

### voxel_studio_changes.json

```json
{
    "voxel_studio_metadata": {
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
                            "name": "minecraft:diamond",
                            "weight": 1
                        }
                    }
                ],
                "timestamp": "2023-01-01T00:00:00.000Z"
            }
        ]
    }
}
```

### voxel_studio_snapshot.json

```json
{
    "version": "1.0.0",
    "created_at": "2023-01-01T00:00:00.000Z",
    "elements": [
        {
            "id": "minecraft:diamond_ore",
            "type": "loot_table",
            "state": {
                "identifier": {
                    "namespace": "minecraft",
                    "registry": "loot_table",
                    "resource": "diamond_ore"
                },
                "pools": []
            }
        }
    ]
}
```

## Workflow Complet

1. **Utilisateur travaille dans l'outil** → Changements automatiquement loggés
2. **Téléchargement du datapack** → `voxel_studio_changes.json` +
   `voxel_studio_snapshot.json` inclus
3. **Utilisateur modifie à la main** → Changements externes au datapack
4. **Re-upload + "Sync Changes"** → Détection automatique des modifs manuelles
5. **Continue le travail** → Tous les changements (outil + manuel) sont trackés

Aucun code supplémentaire nécessaire - le système est 100% générique!
