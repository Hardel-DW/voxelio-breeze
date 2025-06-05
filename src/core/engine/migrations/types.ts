// Types for the generic diff system
export type LogValue = string | number | boolean | null | undefined | LogValue[] | { [key: string]: LogValue };

export interface LogDifference {
    type: "set" | "add" | "remove";
    path: string;
    value?: unknown;
    origin_value?: unknown;
}

export interface ChangeSet {
    element_id?: string;
    element_type?: string;
    differences: LogDifference[];
    timestamp: string;
}
