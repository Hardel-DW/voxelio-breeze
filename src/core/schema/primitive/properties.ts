export type FieldProperties = {
    [key: string]: {
        name: string;
        type: "number" | "boolean" | "string" | "array" | "tags" | "effects" | "deleted";
        icon?: string;
        addons?: string;
    };
};
