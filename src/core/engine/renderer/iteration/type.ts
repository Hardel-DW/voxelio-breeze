export type IterationCollectFromPath = {
    type: "collect_from_path";
    registry: string;
    path: string;
    exclude_namespace?: string[];
};

export type IterationStatic = {
    type: "static";
    values: string[];
};

export type IterationObject = {
    type: "object";
    values: Record<string, any>[];
};

export type IterationGetRegistryElements = {
    type: "get_registry_elements";
    registry: string;
};

export type GetValueFromContext = {
    type: "get_value_from_context";
    key: string;
};

export type InternalCurrentIteration = {
    current_iteration: string;
};

export type InternalFileName = {
    filename: string;
    resource: string;
    namespace: string;
    identifier: string;
};

export type InternalObjectData = {
    object_data: Record<string, any>;
};

export type InternalIterationResult = InternalCurrentIteration | InternalFileName | InternalObjectData;
export type IterationResult = {
    key: string;
    context: InternalIterationResult;
};

export type IterationValue = IterationCollectFromPath | IterationStatic | IterationObject | IterationGetRegistryElements;
export type TemplateReplacer<T> = T extends string
    ? string | GetValueFromContext
    : T extends object
      ? { [K in keyof T]: TemplateReplacer<T[K]> }
      : T;
