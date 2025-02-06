export interface ConditionalEffect<T> {
    effect: T;
    requirements?: unknown | unknown[];
}
