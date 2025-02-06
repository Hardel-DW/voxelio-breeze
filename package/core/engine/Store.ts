import { isVoxelElement, sortVoxelElements } from "../Element.ts";
import type { Analysers, GetAnalyserVoxel } from "./Analyser.ts";
import { compileDatapack } from "./Compiler.ts";
import type { LabeledElement } from "../schema/primitive/label.ts";
import type { ParseDatapackResult } from "./Parser.ts";
import type { Action, ActionValue } from "./actions/index.ts";
import { updateData } from "./actions/index.ts";
import type { Logger } from "./migrations/logger.ts";
import type { ToolConfiguration } from "../schema/primitive/index.ts";
import type { ToggleSection } from "../schema/primitive/toggle.ts";
import { create } from "zustand";

export interface ConfiguratorState<T extends keyof Analysers> {
    name: string;
    minify: boolean;
    logger?: Logger;
    files: Record<string, Uint8Array>;
    elements: Map<string, GetAnalyserVoxel<T>>;
    currentElementId?: string;
    toggleSection?: Record<string, ToggleSection>;
    config: ToolConfiguration | null;
    isJar: boolean;
    version: number | null;
    sortedIdentifiers: string[];
    setName: (name: string) => void;
    setMinify: (minify: boolean) => void;
    setCurrentElementId: (id: string | undefined) => void;
    changeToggleValue: (id: string, name: ToggleSection) => void;
    handleChange: (action: Action, identifier?: string, value?: ActionValue) => void;
    setup: (updates: ParseDatapackResult<GetAnalyserVoxel<T>>) => void;
    compile: () => Array<LabeledElement>;
}

const createConfiguratorStore = <T extends keyof Analysers>() =>
    create<ConfiguratorState<T>>((set, get) => ({
        name: "",
        minify: true,
        files: {},
        elements: new Map(),
        config: null,
        isJar: false,
        version: null,
        sortedIdentifiers: [],
        setName: (name) => set({ name }),
        setMinify: (minify) => set({ minify }),
        setCurrentElementId: (currentElementId) => set({ currentElementId }),
        changeToggleValue: (id, name) =>
            set((state) => ({
                toggleSection: { ...state.toggleSection, [id]: name }
            })),
        handleChange: (action, identifier, value) => {
            const state = get();
            const elementId = identifier ?? state.currentElementId;
            if (!elementId) return;

            const element = state.elements.get(elementId);
            if (!element) return;

            const updatedElement = updateData(action, element, state.version ?? Number.POSITIVE_INFINITY, value);
            if (!updatedElement) return;

            const isElementValid = isVoxelElement(updatedElement);
            if (!isElementValid) return;

            if (state.logger && state.version && typeof state.config?.analyser === "string") {
                state.logger.handleActionDifference(action, element, state.config?.analyser, value, state.version);
            }

            set((state) => ({
                elements: state.elements.set(elementId, updatedElement)
            }));
        },
        setup: (updates) =>
            set({
                ...updates,
                sortedIdentifiers: sortVoxelElements(updates.elements)
            }),
        compile: () => {
            const { elements, version, files, config: configuration } = get();
            if (!version || !files || !configuration) {
                console.error("Version, files or configuration is missing");
                return [];
            }

            return compileDatapack({
                elements: Array.from(elements.values()),
                version,
                files,
                tool: configuration.analyser
            });
        }
    }));

export const useConfiguratorStore = createConfiguratorStore<"enchantment">();

export const getCurrentElement = <T extends keyof Analysers>(state: ConfiguratorState<T>) =>
    state.currentElementId ? state.elements.get(state.currentElementId) : undefined;
