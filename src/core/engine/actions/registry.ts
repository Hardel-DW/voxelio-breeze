import register from "./domains/core";
import enchantmentRegister from "./domains/enchantment";
import lootTableRegister from "./domains/loot_table";
import recipeRegister from "./domains/recipe";
import structureRegister from "./domains/structure";
import structureSetRegister from "./domains/structure_set";
import type { Action, ActionHandler } from "./types";

const loadedDomains = new Set<string>();

type DomainRegisterFunction = () => Map<string, ActionHandler>;
type CoreRegisterFunction = (registry: ActionRegistry) => Map<string, ActionHandler>;

interface DomainModule {
    default: DomainRegisterFunction | CoreRegisterFunction;
}

function extractDomain(actionType: string): string {
    const dotIndex = actionType.indexOf(".");
    if (dotIndex === -1) {
        throw new Error(`Invalid action type: ${actionType}. Expected format: 'domain.action'`);
    }
    return actionType.substring(0, dotIndex);
}

export class ActionRegistry {
    private handlers = new Map<string, ActionHandler>();

    constructor() {
        register(this);

        // Preload all domains to avoid dynamic import issues
        const enchantmentHandlers = enchantmentRegister();
        const lootTableHandlers = lootTableRegister();
        const recipeHandlers = recipeRegister();
        const structureHandlers = structureRegister();
        const structureSetHandlers = structureSetRegister();

        for (const [type, handler] of enchantmentHandlers) {
            this.register(type, handler);
        }
        for (const [type, handler] of lootTableHandlers) {
            this.register(type, handler);
        }
        for (const [type, handler] of recipeHandlers) {
            this.register(type, handler);
        }
        for (const [type, handler] of structureHandlers) {
            this.register(type, handler);
        }
        for (const [type, handler] of structureSetHandlers) {
            this.register(type, handler);
        }

        loadedDomains.add("enchantment");
        loadedDomains.add("loot_table");
        loadedDomains.add("recipe");
        loadedDomains.add("structure");
        loadedDomains.add("structure_set");
    }

    register = (type: string, handler: ActionHandler) => {
        this.handlers.set(type, handler);
    };

    private async ensureDomainLoaded(domain: string): Promise<void> {
        if (loadedDomains.has(domain)) return;

        // Mapping explicite des domains pour éviter les imports dynamiques
        const domainMap: Record<string, () => Promise<DomainModule>> = {
            core: () => import("./domains/core"),
            loot_table: () => import("./domains/loot_table"),
            recipe: () => import("./domains/recipe"),
            structure: () => import("./domains/structure"),
            structure_set: () => import("./domains/structure_set"),
            enchantment: () => import("./domains/enchantment")
        };

        const domainLoader = domainMap[domain];
        if (!domainLoader) {
            throw new Error(`Unknown domain: ${domain}`);
        }

        try {
            const domainModule: DomainModule = await domainLoader();
            if (!domainModule.default) {
                throw new Error(`Domain ${domain} must export a default register function`);
            }

            const handlers =
                domain === "core"
                    ? (domainModule.default as CoreRegisterFunction)(this)
                    : (domainModule.default as DomainRegisterFunction)();

            for (const [actionType, handler] of handlers) {
                this.register(actionType, handler);
            }

            loadedDomains.add(domain);
        } catch (error) {
            throw new Error(`Failed to load domain ${domain}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async execute<T extends Record<string, unknown>>(action: Action, element: T, version?: number): Promise<Partial<T> | undefined> {
        if (!this.handlers.has(action.type)) {
            try {
                await this.ensureDomainLoaded(extractDomain(action.type));
            } catch (error) {
                if (!action.type.startsWith("core.")) {
                    throw error;
                }
            }
        }

        const handler = this.handlers.get(action.type);
        if (!handler) {
            throw new Error(`Unknown action type: ${action.type}`);
        }
        return handler.execute(action, element, version) as Partial<T> | undefined;
    }

    has(type: string): boolean {
        return this.handlers.has(type);
    }
}
