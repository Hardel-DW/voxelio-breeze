export type LogValue = string | number | boolean | null | undefined | LogValue[] | { [key: string]: LogValue };

export interface LogDifference {
    type: "set" | "add" | "remove";
    path: string;
    value?: unknown;
    origin_value?: unknown;
}

export interface ChangeSet {
    identifier?: string;
    registry?: string;
    differences: LogDifference[];
    timestamp: string;
}

export interface DatapackInfo {
    name: string;
    description?: string;
    namespaces: string[];
}

export interface LogsStructure {
    id: string;
    generated_at: string;
    version: number;
    isModded: boolean;
    engine: number;
    isMinified: boolean;
    datapack: DatapackInfo;
    logs: ChangeSet[];
}
