export interface TargetedConditionalEffect<T> {
    enchanted: string;
    affected?: string;
    effect: T;
    requirements?: unknown | unknown[];
}
