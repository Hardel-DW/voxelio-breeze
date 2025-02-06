import { isVoxelElement, sortVoxelElements } from "@/core/Element";
import type { Analysers, GetAnalyserVoxel } from "@/core/engine/Analyser";
import { compileDatapack } from "@/core/engine/Compiler";
import type { ParseDatapackResult } from "@/core/engine/Parser";
import type { Action, ActionValue } from "@/core/engine/actions/index";
import { updateData } from "@/core/engine/actions/index";
import type { Logger } from "@/core/engine/migrations/logger";
import type { ToolConfiguration } from "@/core/schema/primitive/index";
import type { LabeledElement } from "@/core/schema/primitive/label";
import type { ToggleSection } from "@/core/schema/primitive/toggle";
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
