import type { IdentifierObject } from "@/core/Identifier";

export type ActionValue = string | number | boolean | IdentifierObject | unknown;

export interface ActionHandler<T = any> {
    execute(
        action: T,
        element: Record<string, unknown>,
        version?: number
    ): Promise<Record<string, unknown> | undefined> | Record<string, unknown> | undefined;
}

// Base action structure - all actions must have a type
export interface BaseAction {
    type: string;
}

// Generic action type with extensible properties
export type Action = BaseAction & Record<string, unknown>;

// Type helper for creating domain-specific action types
export type DomainAction<Domain extends string, Actions extends Record<string, unknown>> = {
    [K in keyof Actions]: Actions[K] & { type: `${Domain}.${string}` };
}[keyof Actions];

// Type helper for inferring action types from handler map
export type InferActionTypes<T extends Map<string, ActionHandler<any>>> = T extends Map<infer K, ActionHandler<infer A>>
    ? K extends string
        ? A
        : never
    : never;

// Generic domain validation system
export type DomainActionKeys<T> = keyof T;
export type ExpectedHandlerKey<Domain extends string, K extends PropertyKey> = `${Domain}.${string & K}`;
export type AllExpectedHandlerKeys<Domain extends string, Actions> = ExpectedHandlerKey<Domain, keyof Actions>;

// Type to validate that all actions have handlers and no extra handlers exist
export type ValidateHandlerRegistry<T, Expected extends PropertyKey> = [Expected] extends [keyof T]
    ? [keyof T] extends [Expected]
        ? T // Perfect match
        : { error: "Extra handlers detected"; got: keyof T; expected: Expected }
    : { error: "Missing handlers"; got: keyof T; expected: Expected };

// Generic helper function to create a validated handler registry
export function createHandlers<
    Domain extends string,
    Actions extends Record<string, any>,
    Expected extends AllExpectedHandlerKeys<Domain, Actions>,
    T extends Record<Expected, any>
>(handlers: ValidateHandlerRegistry<T, Expected>): T {
    return handlers as T;
}

export type UpdateDataFunction = (
    action: Action,
    element: Record<string, unknown>,
    version?: number
) => Promise<Record<string, unknown> | undefined>;
