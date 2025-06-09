# Guide d'ajout d'un nouveau concept dans Voxel-Breeze

## Vue d'ensemble

Ce guide explique comment ajouter un nouveau concept (ex: Structure,
Advancement, Dimension) dans voxel-breeze en suivant l'architecture établie. Il
se base sur l'implémentation des Structures comme exemple concret.

## Architecture générale

Voxel-breeze utilise une architecture de conversion bidirectionnelle :

- **Format DataDriven (Minecraft)** : JSON Minecraft natifs, complexes et
  hiérarchiques
- **Format Voxel** : Interfaces TypeScript simplifiées et aplaties pour l'UI
- **Actions** : Manipulations typées avec validation et conditions
- **unknownFields** : Préservation des champs de mods non standard
- **Tests** : Couverture complète avec templates TypeScript et benchmarks

## Utilitaires centralisés

Avant de commencer l'implémentation, familiarisez-vous avec les utilitaires
centralisés dans `src/core/schema/utils.ts` :

### Fonctions disponibles

```typescript
import {
    extractUnknownFields,
    mergeKnownFields,
    processElementTags,
} from "@/core/schema/utils";

// Préservation des champs de mods
const unknownFields = extractUnknownFields(data, KNOWN_FIELDS);

// Traitement automatique des tags
const tags = processElementTags(element.tags, config);

// Fusion de sets de champs connus
const allKnownFields = mergeKnownFields(SET1, SET2, SET3);
```

Ces utilitaires éliminent la duplication de code et garantissent une approche
cohérente entre tous les concepts.

## Étapes d'implémentation

### 1. 📋 Schema Core (`src/core/schema/{concept}/`)

#### `types.ts` - Interfaces et utilitaires

```typescript
// Interfaces principales
export interface {ConceptName}Props extends VoxelElement {
    // Propriétés simplifiées pour l'UI
    mainProperty: string;
    complexProperty?: SimplifiedType;
    
    // Propriétés aplaties (si concept hiérarchique)
    flattenedProp1?: string;
    flattenedProp2?: number;
    
    // Config spécifique stockée séparément
    typeSpecific?: Record<string, any>;
    
    // Métadonnées standard
    unknownFields?: Record<string, any>;
    tags: string[];
}

export interface Minecraft{ConceptName} extends DataDrivenElement {
    // Format Minecraft original
    main_property: string;
    complex_property?: ComplexMinecraftType;
    
    // Propriétés hiérarchiques (si applicable)
    nested_config?: {
        prop1?: string;
        prop2?: number;
    };
    
    // Propriétés legacy/variantes
    legacy_property?: any;
    
    // Champs mod-friendly
    [key: string]: any;
}

// Types helper et enums
export type SpecificType = "value1" | "value2" | "value3";

// Utilitaires pour les champs de mods
export function extractUnknownFields(obj: Record<string, any>, knownFields: Set<string>): Record<string, any> | undefined {
    const unknown: Record<string, any> = {};
    let hasUnknown = false;
    
    for (const [key, value] of Object.entries(obj)) {
        if (!knownFields.has(key)) {
            unknown[key] = value;
            hasUnknown = true;
        }
    }
    
    return hasUnknown ? unknown : undefined;
}

// Champs officiels Mojang (à adapter selon le concept)
export const KNOWN_{CONCEPT}_FIELDS = new Set([
    "type", "main_property", "complex_property", "nested_config",
    "description", "tags", "weight", "effects", "slots"
]);

// Constantes de détection des types
export const JIGSAW_TYPES = new Set(["minecraft:jigsaw"]);
export const LEGACY_TYPES = new Set(["minecraft:legacy"]);
```

**Points clés** :

- **{ConceptName}Props (Voxel)** : Interface simplifiée pour l'UI web
- **Minecraft{ConceptName} (DataDriven)** : Format JSON Minecraft natif
- **extractUnknownFields** : Importé de `@/core/schema/utils`, préservation des
  champs de mods
- **KNOWN_FIELDS** : Liste des champs officiels pour filtrer les champs inconnus
- **Constantes** : Détection automatique des types/variants

**Utilitaires centralisés** :

- `extractUnknownFields` : Préservation des champs de mods
- `processElementTags` : Traitement automatique des tags
- `mergeKnownFields` : Fusion de sets de champs connus

#### `Parser.ts` - Conversion Minecraft → Voxel

```typescript
import type { ParserParams } from "@/core/engine/Parser";
import type { {ConceptName}Parser, {ConceptName}Props, Minecraft{ConceptName} } from "./types";
import { KNOWN_{CONCEPT}_FIELDS, SPECIAL_TYPES } from "./types";
import { extractUnknownFields } from "@/core/schema/utils";

export const {ConceptName}DataDrivenToVoxelFormat: {ConceptName}Parser = ({
    element,
    tags = []
}: ParserParams<Minecraft{ConceptName}>): {ConceptName}Props => {
    const data = element.data;

    // 1. Normalisation des propriétés de base
    const mainProperty = normalizeMainProperty(data.main_property);
    
    // 2. Conversion des propriétés complexes
    const complexProperty = normalizeComplexProperty(data.complex_property);

    // 3. Aplatissement conditionnel selon le type
    const result: {ConceptName}Props = {
        identifier: element.identifier,
        mainProperty,
        complexProperty,
        tags
    };

    // 4. Gestion des types modernes vs legacy
    if (JIGSAW_TYPES.has(data.type)) {
        // Format moderne : Aplatir les propriétés hiérarchiques pour l'UI
        if (data.nested_config?.prop1) result.flattenedProp1 = data.nested_config.prop1;
        if (data.nested_config?.prop2) result.flattenedProp2 = data.nested_config.prop2;
    } else {
        // Format legacy : Stocker la configuration complexe séparément
        const typeSpecific: Record<string, any> = {};
        const legacyProps = ["legacy_property", "other_legacy"];
        
        for (const prop of legacyProps) {
            if (data[prop] !== undefined) {
                typeSpecific[prop] = data[prop];
            }
        }
        
        if (Object.keys(typeSpecific).length > 0) {
            result.typeSpecific = typeSpecific;
        }
    }

    // 5. Préservation des champs de mods (non-Mojang)
    const unknownFields = extractUnknownFields(data, KNOWN_{CONCEPT}_FIELDS);
    if (unknownFields) {
        result.unknownFields = unknownFields;
    }

    return result;
};

// Fonctions helper de normalisation
function normalizeMainProperty(prop: any): string {
    // Convertit le format Minecraft complexe vers format Voxel simple
    if (typeof prop === "string") return prop;
    if (Array.isArray(prop)) return prop.join(",");
    return String(prop);
}

function normalizeComplexProperty(prop: any): SimplifiedType | undefined {
    // Aplatit les structures hiérarchiques pour l'UI
    if (!prop) return undefined;
    return {
        simplified: true,
        value: prop.complex_value || prop.value
    };
}
```

**Points clés** :

- **Normalisation** : Conversion des JSON DataDriven vers interfaces Voxel
- **Aplatissement conditionnel** : Selon le type de concept (Jigsaw vs Legacy)
- **typeSpecific** : Stockage de la configuration legacy/non-standard
- **unknownFields** : Préservation des champs de mods pour compatibilité

#### `Compiler.ts` - Conversion Voxel → Minecraft

```typescript
import type {
    CompilerResult,
    {ConceptName}Compiler,
    {ConceptName}Props,
    Minecraft{ConceptName}
} from "./types";
import { SPECIAL_TYPES } from "./types";
import { processElementTags } from "@/core/schema/utils";

export const VoxelTo{ConceptName}DataDriven: {ConceptName}Compiler = (
    element: {ConceptName}Props,
    config: keyof Analysers,
    original?: Minecraft{ConceptName}
): CompilerResult => {
    const concept = original ? structuredClone(original) : ({} as Minecraft{ConceptName});
    let tags: IdentifierObject[] = processElementTags(element.tags, config);

    // 1. Propriétés de base
    concept.main_property = element.mainProperty;
    if (element.complexProperty) {
        concept.complex_property = denormalizeComplexProperty(element.complexProperty);
    }

    // 2. Reconstruction conditionnelle selon le type
    if (JIGSAW_TYPES.has(element.type)) {
        // Format moderne : Reconstruire la hiérarchie JSON
        if (element.flattenedProp1 || element.flattenedProp2) {
            concept.nested_config = {};
            if (element.flattenedProp1) concept.nested_config.prop1 = element.flattenedProp1;
            if (element.flattenedProp2) concept.nested_config.prop2 = element.flattenedProp2;
        }
    } else {
        // Format legacy : Restaurer la configuration stockée
        if (element.typeSpecific) {
            Object.assign(concept, element.typeSpecific);
        }
    }

    // 3. Restaurer champs inconnus
    if (element.unknownFields) {
        Object.assign(concept, element.unknownFields);
    }

    return {
        element: {
            data: concept,
            identifier: element.identifier
        },
        tags
    };
};

// Fonctions helper de dénormalisation
function denormalizeComplexProperty(prop: SimplifiedType): ComplexMinecraftType {
    // Reconstruit la hiérarchie JSON Minecraft à partir du format Voxel
    return {
        complex_value: prop.value,
        additional_data: prop.simplified ? {} : prop
    };
}
```

**Points clés** :

- **structuredClone** : Clone profond pour immutabilité
- **Reconstruction conditionnelle** : Hiérarchie vs legacy
- **processElementTags** : Génération automatique des tags (remplace
  tagsToIdentifiers)
- **Object.assign** : Restauration champs préservés

#### Mise à jour `Analyser.ts`

```typescript
// Dans src/core/engine/Analyser.ts
import type { {ConceptName}Parser, {ConceptName}Compiler } from "@/core/schema/{concept}/types";
import { {ConceptName}DataDrivenToVoxelFormat } from "@/core/schema/{concept}/Parser";
import { VoxelTo{ConceptName}DataDriven } from "@/core/schema/{concept}/Compiler";

export interface Analysers {
    // ... concepts existants
    {concept}: {
        parser: {ConceptName}Parser;
        compiler: {ConceptName}Compiler;
    };
}

export const analysers: Analysers = {
    // ... analysers existants
    {concept}: {
        parser: {ConceptName}DataDrivenToVoxelFormat,
        compiler: VoxelTo{ConceptName}DataDriven,
    },
};
```

### 2. ⚡ Actions (`src/core/engine/actions/domains/{concept}/`)

#### `types.ts` - Actions typées

```typescript
import { createHandlers, type AllExpectedHandlerKeys, type ValidateHandlerRegistry } from "../../types";

// Actions spécifiques au domaine
export interface {ConceptName}Actions {
    set_main_property: {
        value: string;
        options?: string[];
    };
    modify_complex_property: {
        operation: "add" | "remove" | "update";
        key: string;
        value?: any;
    };
    toggle_feature: {
        feature: string;
        enabled: boolean;
    };
    // ... autres actions spécifiques
}

// Export des actions typées
export type {ConceptName}Action = {
    [K in keyof {ConceptName}Actions]: {ConceptName}Actions[K] & { type: `{concept}.${K}` };
}[keyof {ConceptName}Actions];

// Le domaine est extrait automatiquement du préfixe de l'action
// Ex: "{concept}.set_main_property" → domaine = "{concept}"

// Validation avec système générique
export type {ConceptName}HandlerKeys = AllExpectedHandlerKeys<"{concept}", {ConceptName}Actions>;
export const create{ConceptName}Handlers = <T extends Record<{ConceptName}HandlerKeys, any>>(
    handlers: ValidateHandlerRegistry<T, {ConceptName}HandlerKeys>
): T => createHandlers(handlers);
```

#### Handlers individuels

```typescript
// SetMainPropertyHandler.ts
import type { ActionHandler } from "../../types";
import type { {ConceptName}Action } from "./types";

export class SetMainPropertyHandler implements ActionHandler<{ConceptName}Action> {
    execute(
        action: Extract<{ConceptName}Action, { type: "{concept}.set_main_property" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        return {
            ...element,
            mainProperty: action.value
        };
    }
}
```

#### `index.ts` - Registry des handlers

```typescript
import type { ActionHandler } from "../../types";
import type { {ConceptName}Action } from "./types";
import { create{ConceptName}Handlers } from "./types";
import { SetMainPropertyHandler } from "./SetMainPropertyHandler";
import { ModifyComplexPropertyHandler } from "./ModifyComplexPropertyHandler";
// ... imports autres handlers

export default function register(): Map<string, ActionHandler<{ConceptName}Action>> {
    const handlerDefinitions = create{ConceptName}Handlers({
        "{concept}.set_main_property": new SetMainPropertyHandler(),
        "{concept}.modify_complex_property": new ModifyComplexPropertyHandler(),
        "{concept}.toggle_feature": new ToggleFeatureHandler(),
        // ... autres handlers
    });

    return new Map(Object.entries(handlerDefinitions));
}

// Handlers simples inline si approprié
class ToggleFeatureHandler implements ActionHandler<{ConceptName}Action> {
    execute(
        action: Extract<{ConceptName}Action, { type: "{concept}.toggle_feature" }>,
        element: Record<string, unknown>
    ): Record<string, unknown> {
        return {
            ...element,
            [`${action.feature}Enabled`]: action.enabled
        };
    }
}
```

### 3. 🧪 Tests et Templates

#### Templates TypeScript (`test/template/concept/{concept}/`)

```typescript
// DataDriven.ts - JSON Minecraft natifs
import type { DataDrivenRegistryElement } from "@/core/Element";
import type { Minecraft{ConceptName} } from "@/core/schema/{concept}/types";

export const basic{ConceptName}: Minecraft{ConceptName} = {
    type: "minecraft:basic_type",
    main_property: "example_value",
    complex_property: {
        nested_prop: "value",
        array_prop: ["item1", "item2"]
    }
};

export const special{ConceptName}: Minecraft{ConceptName} = {
    type: "minecraft:special_type",
    main_property: "special_value",
    nested_config: {
        prop1: "config1",
        prop2: 42
    }
};

export const {concept}DataDriven: DataDrivenRegistryElement<Minecraft{ConceptName}>[] = [
    {
        identifier: { namespace: "minecraft", registry: "{concept}", resource: "basic" },
        data: basic{ConceptName}
    },
    {
        identifier: { namespace: "modded", registry: "{concept}", resource: "special" },
        data: special{ConceptName}
    }
];

// VoxelDriven.ts - Interfaces TypeScript Voxel
import type { {ConceptName}Props } from "@/core/schema/{concept}/types";
import type { VoxelRegistryElement } from "@/index";

export const createMock{ConceptName}Element = (data: Partial<{ConceptName}Props> = {}): VoxelRegistryElement<{ConceptName}Props> => ({
    identifier: "mock_{concept}",
    data: {
        identifier: { namespace: "minecraft", registry: "{concept}", resource: "basic" },
        mainProperty: "example_value",
        complexProperty: {
            nestedProp: "value",
            arrayProp: ["item1", "item2"]
        },
        tags: [],
        ...data
    }
});

export const VOXEL_ELEMENTS: {ConceptName}Props[] = [
    {
        identifier: { namespace: "minecraft", registry: "{concept}", resource: "basic" },
        mainProperty: "example_value",
        complexProperty: {
            nestedProp: "value",
            arrayProp: ["item1", "item2"]
        },
        tags: []
    }
];
```

#### Tests de parsing/compiling (`test/engine/concept/{concept}/`)

```typescript
// {concept}.test.ts
import { describe, it, expect } from "vitest";
import { {ConceptName}DataDrivenToVoxelFormat } from "@/core/schema/{concept}/Parser";
import { VoxelTo{ConceptName}DataDriven } from "@/core/schema/{concept}/Compiler";
import { basic{ConceptName}, special{ConceptName} } from "@/test/template/concept/{concept}/DataDriven";

describe("{ConceptName} Schema", () => {
    describe("Parser", () => {
        it("should parse basic {concept}", () => {
            const result = {ConceptName}DataDrivenToVoxelFormat({
                element: { data: basic{ConceptName}, identifier: { namespace: "minecraft", resource: "basic" } },
                tags: []
            });

            expect(result.mainProperty).toBe("example_value");
            expect(result.complexProperty).toBeDefined();
        });

        it("should handle special types", () => {
            const result = {ConceptName}DataDrivenToVoxelFormat({
                element: { data: special{ConceptName}, identifier: { namespace: "minecraft", resource: "special" } },
                tags: []
            });

            expect(result.flattenedProp1).toBe("config1");
            expect(result.flattenedProp2).toBe(42);
        });
    });

    describe("Compiler", () => {
        it("should compile to Minecraft format", () => {
            const voxel = {ConceptName}DataDrivenToVoxelFormat({
                element: { data: basic{ConceptName}, identifier: { namespace: "minecraft", resource: "basic" } },
                tags: []
            });

            const { element } = VoxelTo{ConceptName}DataDriven(voxel, "{concept}");
            
            expect(element.data.main_property).toBe("example_value");
        });

        it("should preserve round-trip integrity", () => {
            const original = basic{ConceptName};
            
            const voxel = {ConceptName}DataDrivenToVoxelFormat({
                element: { data: original, identifier: { namespace: "minecraft", resource: "test" } },
                tags: []
            });
            
            const { element } = VoxelTo{ConceptName}DataDriven(voxel, "{concept}", original);
            
            expect(element.data).toEqual(original);
        });
    });
});
```

#### Tests d'actions (`test/engine/actions/{concept}/`)

```typescript
// {concept}-actions.test.ts
import { describe, expect, it } from "vitest";
import register from "@/core/engine/actions/domains/{concept}";

describe("{ConceptName} Actions", () => {
    const handlers = register();

    it("should register all handlers", () => {
        expect(handlers.has("{concept}.set_main_property")).toBe(true);
        expect(handlers.has("{concept}.modify_complex_property")).toBe(true);
    });

    it("should execute set_main_property", () => {
        const handler = handlers.get("{concept}.set_main_property");
        const result = handler?.execute({
            type: "{concept}.set_main_property",
            value: "new_value",
        }, { mainProperty: "old_value" });

        expect(result?.mainProperty).toBe("new_value");
    });
});
```

#### Mise à jour des registries

```typescript
// Mise à jour test/template/datapack.ts
import { {concept}DataDriven } from "./concept/{concept}/DataDriven";
import { createFilesFromElements } from "./utils";

export const {concept}File = createFilesFromElements({concept}DataDriven);

// benchmark/{concept}/{concept}.bench.ts
import { bench, describe } from "vitest";
import { {ConceptName}DataDrivenToVoxelFormat } from "@/core/schema/{concept}/Parser";
import { {concept}DataDriven } from "@/test/template/concept/{concept}/DataDriven";

describe("{ConceptName} Benchmark", () => {
    bench("parse basic {concept}", () => {
        {ConceptName}DataDrivenToVoxelFormat({
            element: {concept}DataDriven[0],
            tags: []
        });
    });
    
    bench("parse {concept} with hierarchy", () => {
        {ConceptName}DataDrivenToVoxelFormat({
            element: {concept}DataDriven[1],
            tags: []
        });
    });
});
```

### 4. 📖 Documentation

#### Actions (`docs/actions-{concept}.md`)

````markdown
# Actions {ConceptName} - Domaine des {concept}s

## Vue d'ensemble

Le domaine `{concept}` fournit des actions spécialisées pour manipuler les
{concept}s Minecraft...

## Actions disponibles

### `{concept}.set_main_property`

Description de l'action...

**Signature** :

```typescript
{
    type: "{concept}.set_main_property";
    value: string;
}
```
````

**Exemples** :

```typescript
const action = {
    type: "{concept}.set_main_property",
    value: "new_value",
};
```

## Cas d'usage pratiques

### Exemple complexe

```typescript
const workflow = {
    type: "core.sequential",
    actions: [
        // ...
    ],
};
```

````
#### Guide parsing/compiling (`docs/{concept}-guide.md`)

```markdown
# Guide {ConceptName} - Parsing et Compiling

## Vue d'ensemble

Ce guide explique la conversion bidirectionnelle entre le format Minecraft et le format Voxel pour les {concept}s...

## Parsing : Minecraft → Voxel

### Exemple complet

**Entrée Minecraft** :
```json
{
    "type": "minecraft:example",
    "main_property": "value"
}
````

**Sortie Voxel** :

```typescript
{
    mainProperty: "value",
    // ...
}
```

## Compiling : Voxel → Minecraft

### Reconstruction

**Entrée Voxel** :

```typescript
{
    mainProperty: "value";
}
```

**Sortie Minecraft** :

```json
{
    "main_property": "value"
}
```

```
## Checklist d'implémentation

### ✅ Schema Core
- [ ] `types.ts` - Interfaces Voxel/Minecraft + utilitaires
- [ ] `Parser.ts` - Fonction {ConceptName}DataDrivenToVoxelFormat
- [ ] `Compiler.ts` - Fonction VoxelTo{ConceptName}DataDriven  
- [ ] Mise à jour `Analyser.ts` avec le nouveau concept

### ✅ Actions
- [ ] `types.ts` - Actions avec préfixe `{concept}.action_name`
- [ ] Handlers individuels avec validation TypeScript
- [ ] `index.ts` - Registry avec pattern create{ConceptName}Handlers
- [ ] Tests dans `test/engine/actions/{concept}/`

### ✅ Templates et Tests
- [ ] `test/template/concept/{concept}/DataDriven.ts` - Templates Minecraft
- [ ] `test/template/concept/{concept}/VoxelDriven.ts` - Templates Voxel
- [ ] `test/engine/concept/{concept}/{concept}.test.ts` - Tests parsing/compiling
- [ ] Mise à jour `test/template/concept/datapack.ts`

### ✅ Benchmarks et Performance
- [ ] `benchmark/{concept}/{concept}.bench.ts` - Tests de performance
- [ ] Optimisations parser/compiler si nécessaire

### ✅ Documentation
- [ ] `docs/actions-{concept}.md` - Documentation des actions
- [ ] `docs/{concept}-guide.md` - Guide parsing/compiling
- [ ] Mise à jour `docs/README.md`

## Bonnes pratiques

### 🎯 Design Patterns

1. **Format Voxel** : Simplifié, plat, orienté UI
2. **Format Minecraft** : Complexe, hiérarchique, optimisé jeu
3. **Préservation** : Champs inconnus, compatibilité mods
4. **Actions** : Préfixe domaine, validation TypeScript
5. **Tests** : Round-trip integrity, templates réalistes

### 🚀 Optimisations

1. **Parser** : Éviter clonages inutiles, cache constantes
2. **Compiler** : Assignations directes, création conditionnelle
3. **Actions** : Immutabilité, validation early return
4. **Types** : Interfaces spécifiques, éviter `any`

### 🛡️ Qualité

1. **Linting** : Éviter `delete`, utiliser `for..of`, pas `as any`
2. **Types** : Préférer `unknown` à `any`, type guards
3. **Tests** : Couverture complète, cas edge, performance
4. **Docs** : Exemples concrets, cas d'usage réels

Ce pattern garantit une intégration cohérente de nouveaux concepts dans l'écosystème voxel-breeze tout en maintenant la qualité et les performances.
```

## Prompt : (Inclure le markdown dans le prompt)

@adding-new-concept.md @actions-loot-table.md @loot-table-guide.md

Je veux que tu prenne connaissances de l'applications. Je vais te donner une
tache aprés, en rapport avec l'implémentation des structures set, dans un format
propriétaire pratique pour gérer le UI.

- Ont va faire le Compiler/ Parser avec les actions associés

Séparément voici un exemples avec Loot. @types.ts @Compiler.ts @Parser.ts
@Analyser.ts

Et ensuite faire les tests avec la structure suivante :

- Les Mocks dans test/template/concept/*.
- Les tests dans test/engine/concept/*
- Les tests pour les actions dans test/engine/actions/*
- Les benchmark dans dans benchmark

Informations spécifiques :

- Structure set auras la clef "worldgen/structure_set".
- Structure set posséde des tags associés.

Voici la documentation du concept en format mcdoc. Nous traitons que la 1.21.
N'inclus donc pas les versions antérieures.

IMPORTANT : Ne met rien dans le champ configurator, surtout pas "test" ou
autres. configurator: "test" C'est une fonctionnalités qui va être refactorer,
et qui permet a un datapacks/mods de fournir des infromations lors de la
compilation/parsing ou pour l'affichage UI.

- Cette valeur ne peut pas être modifier par le UI.
- Ou l'élement n'est pas afficher dans la sidebar...
