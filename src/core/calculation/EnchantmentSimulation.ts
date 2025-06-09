import type { DataDrivenRegistryElement } from "@/core/Element";
import { Identifier } from "@/core/Identifier";
import TagsComparator from "@/core/TagComparator";
import type { Enchantment } from "@/schema/Enchantment";
import type { TagType } from "@/schema/TagType";

export interface ItemData {
    id: string;
    enchantability: number;
    tags: string[];
}

interface EnchantmentEntry {
    enchantment: string;
    level: number;
    power: number;
}

interface EnchantmentPossible {
    id: string;
    enchantment: Enchantment;
    weight: number;
    applicableLevel: number;
}

export interface EnchantmentOption {
    level: number;
    cost: number;
    enchantments: Array<EnchantmentEntry>;
}

export interface EnchantmentStats {
    enchantmentId: string;
    probability: number;
    averageLevel: number;
    minLevel: number;
    maxLevel: number;
}

/**
 * Simulation correcte du système d'enchantement Minecraft
 * Basée sur les vraies formules de la documentation officielle
 */
export class EnchantmentSimulator {
    private enchantments: Map<string, Enchantment>;
    private tagsComparator?: TagsComparator;
    private inEnchantingTableValues: Set<string> = new Set();

    constructor(enchantments: Map<string, Enchantment>, tags?: DataDrivenRegistryElement<TagType>[]) {
        this.enchantments = enchantments;

        if (tags && tags.length > 0) {
            this.tagsComparator = new TagsComparator(tags);
            this.initializeInEnchantingTableValues(tags);
        }
    }

    /**
     * Simule les options d'enchantement disponibles
     * @param bookshelves Nombre d'étagères (0-15)
     * @param enchantability Enchantabilité de l'item
     * @param itemTags Tags de l'item pour vérifier la compatibilité
     * @returns Les 3 options d'enchantement (haut, milieu, bas)
     */
    public simulateEnchantmentTable(
        bookshelves: number,
        enchantability: number,
        itemTags: string[] = []
    ): [EnchantmentOption, EnchantmentOption, EnchantmentOption] {
        const clampedBookshelves = Math.min(15, Math.max(0, bookshelves));

        // Formule Minecraft officielle
        const base = this.randomInt(1, 8) + Math.floor(clampedBookshelves / 2) + this.randomInt(0, clampedBookshelves);

        const topSlot = Math.floor(Math.max(base / 3, 1));
        const middleSlot = Math.floor((base * 2) / 3 + 1);
        const bottomSlot = Math.floor(Math.max(base, clampedBookshelves * 2));

        return [
            this.generateEnchantmentOption(topSlot, enchantability, itemTags),
            this.generateEnchantmentOption(middleSlot, enchantability, itemTags),
            this.generateEnchantmentOption(bottomSlot, enchantability, itemTags)
        ];
    }

    /**
     * Calcule les statistiques de probabilité pour chaque enchantement
     * @param bookshelves Nombre d'étagères
     * @param enchantability Enchantabilité de l'item
     * @param itemTags Tags de l'item
     * @param iterations Nombre d'itérations pour le calcul statistique
     * @returns Statistiques pour chaque enchantement
     */
    public calculateEnchantmentProbabilities(
        bookshelves: number,
        enchantability: number,
        itemTags: string[] = [],
        iterations = 10000
    ): EnchantmentStats[] {
        const results = new Map<string, { occurrences: number; levels: number[] }>();

        // Initialiser les résultats
        for (const [id] of this.enchantments) {
            results.set(id, { occurrences: 0, levels: [] });
        }

        // Simulation
        for (let i = 0; i < iterations; i++) {
            const options = this.simulateEnchantmentTable(bookshelves, enchantability, itemTags);

            // Analyser chaque option
            for (const option of options) {
                for (const ench of option.enchantments) {
                    const result = results.get(ench.enchantment);
                    if (result) {
                        result.occurrences++;
                        result.levels.push(ench.level);
                    }
                }
            }
        }

        // Calculer les statistiques
        return Array.from(results.entries())
            .map(([id, data]) => ({
                enchantmentId: id,
                probability: (data.occurrences / (iterations * 3)) * 100, // 3 options par simulation
                averageLevel: data.levels.length > 0 ? data.levels.reduce((a, b) => a + b, 0) / data.levels.length : 0,
                minLevel: data.levels.length > 0 ? Math.min(...data.levels) : 0,
                maxLevel: data.levels.length > 0 ? Math.max(...data.levels) : 0
            }))
            .filter((stat) => stat.probability > 0)
            .sort((a, b) => b.probability - a.probability);
    }

    private generateEnchantmentOption(baseLevel: number, enchantability: number, itemTags: string[]): EnchantmentOption {
        // Étape 1: Appliquer les modificateurs d'enchantabilité
        const modifiedLevel = this.applyEnchantabilityModifiers(baseLevel, enchantability);

        // Étape 2: Trouver les enchantements possibles
        const possibleEnchantments = this.findPossibleEnchantments(modifiedLevel, itemTags);

        // Étape 3: Sélectionner les enchantements
        const selectedEnchantments = this.selectEnchantments(possibleEnchantments, modifiedLevel);

        return {
            level: baseLevel,
            cost: baseLevel,
            enchantments: selectedEnchantments
        };
    }

    private applyEnchantabilityModifiers(baseLevel: number, enchantability: number): number {
        // Modificateur 1: randomInt(0, floor(enchantability/4)) + 1
        const modifier1 = this.randomInt(0, Math.floor(enchantability / 4)) + 1;

        // Modificateur 2: même chose
        const modifier2 = this.randomInt(0, Math.floor(enchantability / 4)) + 1;

        // Niveau modifié
        let modifiedLevel = baseLevel + modifier1 + modifier2;

        // Bonus aléatoire (0.85 - 1.15)
        const randomBonus = 1 + (Math.random() + Math.random() - 1) * 0.15;
        modifiedLevel = Math.round(modifiedLevel * randomBonus);

        return Math.max(1, modifiedLevel);
    }

    private findPossibleEnchantments(level: number, itemTags: string[]): Array<EnchantmentPossible> {
        const possible: Array<EnchantmentPossible> = [];

        for (const [id, enchantment] of this.enchantments) {
            // Vérifier si l'enchantement est disponible dans la table d'enchantement
            if (!this.isEnchantmentInEnchantingTable(id)) {
                continue;
            }

            // Vérifier compatibilité avec l'item
            if (!this.isEnchantmentApplicableToItem(enchantment, itemTags)) {
                continue;
            }

            // Trouver le niveau d'enchantement approprié pour ce niveau de puissance
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

    private selectEnchantments(possibleEnchantments: Array<EnchantmentPossible>, level: number): Array<EnchantmentEntry> {
        if (possibleEnchantments.length === 0) return [];

        const selected: Array<EnchantmentEntry> = [];
        let remaining = [...possibleEnchantments];

        // Sélectionner le premier enchantement
        const first = this.weightedRandomSelect(remaining);
        if (first) {
            selected.push({
                enchantment: first.id,
                level: first.applicableLevel,
                power: first.applicableLevel
            });
            remaining = remaining.filter((e) => e.id !== first.id);
        }

        // Chance d'enchantements supplémentaires
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

            extraChance *= 0.5; // Réduire les chances pour les enchantements suivants
        }

        return selected;
    }

    private isEnchantmentApplicableToItem(enchantment: Enchantment, itemTags: string[]): boolean {
        // Utiliser primary_items en priorité, sinon fallback sur supported_items
        const items = enchantment.primary_items || enchantment.supported_items;
        const supportedItems = Array.isArray(items) ? items : [items];

        return supportedItems.some((supportedItem) => {
            // Vérifier si c'est un tag (commence par #) ou un item direct
            if (supportedItem.startsWith("#")) {
                const tagName = supportedItem.substring(1);
                // Normaliser le tag en utilisant Identifier
                const normalizedTag = Identifier.normalize(tagName, "tags/item");
                // Retirer le # du résultat pour comparer avec itemTags
                const cleanTag = normalizedTag.startsWith("#") ? normalizedTag.substring(1) : normalizedTag;
                return itemTags.includes(cleanTag);
            }
            // Pour les items directs, normaliser en utilisant Identifier
            const normalizedItem = Identifier.normalize(supportedItem, "item");
            return itemTags.includes(normalizedItem);
        });
    }

    private areEnchantmentsCompatible(newEnchantmentId: string, existingEnchantmentIds: string[]): boolean {
        const newEnchantment = this.enchantments.get(newEnchantmentId);
        if (!newEnchantment?.exclusive_set) return true;

        const exclusiveSet = Array.isArray(newEnchantment.exclusive_set) ? newEnchantment.exclusive_set : [newEnchantment.exclusive_set];

        // Utiliser TagsComparator pour résoudre les tags d'exclusivité
        for (const existingId of existingEnchantmentIds) {
            const existingEnchantment = this.enchantments.get(existingId);
            if (!existingEnchantment?.exclusive_set) continue;

            const existingExclusiveSet = Array.isArray(existingEnchantment.exclusive_set)
                ? existingEnchantment.exclusive_set
                : [existingEnchantment.exclusive_set];

            // Vérifier si les enchantements partagent un tag d'exclusivité
            if (this.shareExclusiveTag(exclusiveSet, existingExclusiveSet)) {
                return false;
            }
        }

        return true;
    }

    private shareExclusiveTag(tagsA: string[], tagsB: string[]): boolean {
        if (!this.tagsComparator) return false;

        for (const tagA of tagsA) {
            for (const tagB of tagsB) {
                if (tagA === tagB) return true;

                // Si c'est un tag, résoudre les valeurs
                if (tagA.startsWith("#") && tagB.startsWith("#")) {
                    const valuesA = this.getTagValues(tagA);
                    const valuesB = this.getTagValues(tagB);

                    // Vérifier les intersections
                    if (valuesA.some((v) => valuesB.includes(v))) return true;
                }
            }
        }
        return false;
    }

    private getTagValues(tagReference: string): string[] {
        if (!this.tagsComparator || !tagReference.startsWith("#")) return [];

        const tagId = Identifier.of(tagReference, "tags/enchantment");
        return this.tagsComparator.getRecursiveValues(tagId.get());
    }

    private calculateEnchantmentCost(cost: { base: number; per_level_above_first: number }, level: number): number {
        return cost.base + (level - 1) * cost.per_level_above_first;
    }

    private weightedRandomSelect<T extends { weight: number }>(items: T[]): T | null {
        if (items.length === 0) return null;

        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight === 0) return items[Math.floor(Math.random() * items.length)];

        let random = Math.random() * totalWeight;
        for (const item of items) {
            random -= item.weight;
            if (random <= 0) return item;
        }

        return items[items.length - 1];
    }

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private initializeInEnchantingTableValues(tags: DataDrivenRegistryElement<TagType>[]): void {
        const inEnchantingTableTag = tags.find(
            (tag) => tag.identifier.resource === "in_enchanting_table" && tag.identifier.registry === "tags/enchantment"
        );

        if (inEnchantingTableTag && this.tagsComparator) {
            const values = this.tagsComparator.getRecursiveValues(inEnchantingTableTag.identifier);
            this.inEnchantingTableValues = new Set(values);
        }
    }

    private isEnchantmentInEnchantingTable(enchantmentId: string): boolean {
        if (this.inEnchantingTableValues.size === 0) return true; // Si pas de tag fourni, accepter tous

        // Normaliser l'ID en utilisant Identifier
        const normalizedId = Identifier.normalize(enchantmentId, "enchantment");
        return this.inEnchantingTableValues.has(normalizedId);
    }

    private calculateApplicableLevel(enchantment: Enchantment, powerLevel: number): number {
        // Selon la documentation Minecraft, trouver le niveau le plus élevé possible
        // pour ce niveau de puissance d'enchantement
        for (let level = 1; level <= enchantment.max_level; level++) {
            const minCost = this.calculateEnchantmentCost(enchantment.min_cost, level);
            const maxCost = this.calculateEnchantmentCost(enchantment.max_cost, level);

            // Si le niveau de puissance est dans la plage pour ce niveau d'enchantement
            if (powerLevel >= minCost && powerLevel <= maxCost) {
                // Continuer pour trouver le niveau le plus élevé possible
                let applicableLevel = level;

                for (let higherLevel = level + 1; higherLevel <= enchantment.max_level; higherLevel++) {
                    const higherMinCost = this.calculateEnchantmentCost(enchantment.min_cost, higherLevel);
                    const higherMaxCost = this.calculateEnchantmentCost(enchantment.max_cost, higherLevel);

                    if (powerLevel >= higherMinCost && powerLevel <= higherMaxCost) {
                        applicableLevel = higherLevel;
                    } else {
                        break;
                    }
                }

                return applicableLevel;
            }
        }
        return 0; // Aucun niveau applicable
    }
}
