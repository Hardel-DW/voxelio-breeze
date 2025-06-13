import type { RecipeAction } from "../domains/recipe/types";
import { ActionBuilder } from "./ActionBuilder";

/**
 * Builder for recipe actions with fluent API
 */
export class RecipeActionBuilder extends ActionBuilder<RecipeAction> {
    /**
     * Add ingredients to a slot
     */
    addIngredient(slot: string): AddIngredientBuilder {
        return new AddIngredientBuilder(slot);
    }

    /**
     * Remove ingredients from a slot
     */
    removeIngredient(slot: string): RemoveIngredientBuilder {
        return new RemoveIngredientBuilder(slot);
    }

    /**
     * Clear a slot completely
     */
    clearSlot(slot: string): ClearSlotBuilder {
        return new ClearSlotBuilder(slot);
    }

    /**
     * Swap contents of two slots
     */
    swapSlots(fromSlot: string, toSlot: string): SwapSlotsBuilder {
        return new SwapSlotsBuilder(fromSlot, toSlot);
    }

    /**
     * Convert recipe to a different type
     */
    convertType(newType: string): ConvertRecipeTypeBuilder {
        return new ConvertRecipeTypeBuilder(newType);
    }

    build(): RecipeAction {
        throw new Error("Use specific builder methods to create actions");
    }
}

class AddIngredientBuilder extends ActionBuilder<Extract<RecipeAction, { type: "recipe.add_ingredient" }>> {
    private itemsList: string[] = [];
    private replace = false;

    constructor(private slot: string) {
        super();
    }

    /**
     * Add items to the slot
     */
    items(...items: string[]): this {
        this.itemsList.push(...items);
        return this;
    }

    /**
     * Replace existing items instead of adding to them
     */
    replaceExisting(): this {
        this.replace = true;
        return this;
    }

    build() {
        if (this.itemsList.length === 0) {
            throw new Error("At least one item must be specified");
        }

        return {
            type: "recipe.add_ingredient" as const,
            slot: this.slot,
            items: this.itemsList,
            ...(this.replace && { replace: this.replace })
        };
    }
}

class RemoveIngredientBuilder extends ActionBuilder<Extract<RecipeAction, { type: "recipe.remove_ingredient" }>> {
    private itemsList?: string[];

    constructor(private slot: string) {
        super();
    }

    /**
     * Specify which items to remove (if not specified, removes all)
     */
    items(...items: string[]): this {
        this.itemsList = items;
        return this;
    }

    build() {
        return {
            type: "recipe.remove_ingredient" as const,
            slot: this.slot,
            ...(this.itemsList && { items: this.itemsList })
        };
    }
}

class ClearSlotBuilder extends ActionBuilder<Extract<RecipeAction, { type: "recipe.clear_slot" }>> {
    constructor(private slot: string) {
        super();
    }

    build() {
        return {
            type: "recipe.clear_slot" as const,
            slot: this.slot
        };
    }
}

class SwapSlotsBuilder extends ActionBuilder<Extract<RecipeAction, { type: "recipe.swap_slots" }>> {
    constructor(
        private fromSlot: string,
        private toSlot: string
    ) {
        super();
    }

    build() {
        return {
            type: "recipe.swap_slots" as const,
            fromSlot: this.fromSlot,
            toSlot: this.toSlot
        };
    }
}

class ConvertRecipeTypeBuilder extends ActionBuilder<Extract<RecipeAction, { type: "recipe.convert_recipe_type" }>> {
    private preserveIngredients = true;

    constructor(private newType: string) {
        super();
    }

    /**
     * Don't preserve ingredients when converting
     */
    clearIngredients(): this {
        this.preserveIngredients = false;
        return this;
    }

    build() {
        return {
            type: "recipe.convert_recipe_type" as const,
            newType: this.newType,
            ...(this.preserveIngredients !== true && { preserveIngredients: this.preserveIngredients })
        };
    }
}

// Factory function for easier usage
export const recipe = new RecipeActionBuilder();
