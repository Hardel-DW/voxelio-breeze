import type { Action, ActionHandler } from "./types";
import register from "./domains/core";

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
    }

    register = (type: string, handler: ActionHandler) => {
        this.handlers.set(type, handler);
    };

    private async ensureDomainLoaded(domain: string): Promise<void> {
        if (loadedDomains.has(domain)) return;

        try {
            const domainModule: DomainModule = await import(`./domains/${domain}`);
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
