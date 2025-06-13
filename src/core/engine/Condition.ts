export class Condition {
    private current = true;
    private usedFields: Set<string> = new Set();
    constructor(private element: Record<string, unknown>) {}

    contains(field: string, values: string[]): this {
        this.usedFields.add(field);
        if (!this.current) return this;
        const fieldValue = this.element[field];
        this.current = Array.isArray(fieldValue) && values.some((v) => fieldValue.includes(v));
        return this;
    }

    equals(field: string, value: string | number | boolean): this {
        this.usedFields.add(field);
        if (!this.current) return this;
        this.current = this.element[field] === value;
        return this;
    }

    isUndefined(field: string): this {
        this.usedFields.add(field);
        if (!this.current) return this;
        this.current = this.element[field] === undefined;
        return this;
    }

    equalsFieldValue(field: string, value: string | number | boolean): this {
        this.usedFields.add(field);
        if (!this.current) return this;
        const compared = this.element[field];
        this.current = compared !== undefined && compared === value;
        return this;
    }

    not(check: (cond: Condition) => boolean): this {
        if (!this.current) return this;
        this.current = !check(new Condition(this.element));
        return this;
    }

    object(field: string, callback: (cond: Condition) => boolean): this {
        this.usedFields.add(field);
        if (!this.current) return this;
        const subObject = this.element[field];
        if (!subObject || typeof subObject !== "object") {
            this.current = false;
            return this;
        }
        this.current = callback(new Condition(subObject as Record<string, unknown>));
        return this;
    }

    allOf(cb: (c: Condition) => Condition): this {
        if (!this.current) return this;
        this.current = cb(new Condition(this.element)).result();
        return this;
    }

    anyOf(cb: (c: Condition) => Condition): this {
        if (this.current) return this;
        this.current = cb(new Condition(this.element)).result();
        return this;
    }

    custom(cb: (element: Record<string, unknown>) => boolean): this {
        if (!this.current) return this;
        this.current = cb(this.element);
        return this;
    }

    result(): boolean {
        return this.current;
    }

    getFields(): string[] {
        return Array.from(this.usedFields);
    }
}
