type SelectorCase = {
    condition: (el: Record<string, unknown>) => boolean;
    getValue: (el: Record<string, unknown>) => any;
};

export class ValueSelector {
    private cases: SelectorCase[] = [];
    private currentCondition: ((el: Record<string, unknown>) => boolean) | null = null;
    private hasFinalElse = false;
    private usedFields: Set<string> = new Set();
    private element?: Record<string, unknown>;

    constructor(element?: Record<string, unknown>) {
        this.element = element;
    }

    if(cond: (el: Record<string, unknown>) => boolean) {
        this.currentCondition = cond;
        return this;
    }

    elseIf(cond: (el: Record<string, unknown>) => boolean) {
        this.currentCondition = cond;
        return this;
    }

    field(fieldName: string) {
        this.usedFields.add(fieldName);
        if (!this.currentCondition) throw new Error("No condition set for field");
        this.cases.push({
            condition: this.currentCondition,
            getValue: (el) => el[fieldName]
        });
        this.currentCondition = null;
        return this;
    }

    value(val: any) {
        if (!this.currentCondition) throw new Error("No condition set for value");
        this.cases.push({
            condition: this.currentCondition,
            getValue: () => val
        });
        this.currentCondition = null;
        return this;
    }

    else() {
        this.currentCondition = () => true;
        this.hasFinalElse = true;
        return this;
    }

    get(): any;
    get(element: Record<string, unknown>): any;
    get(element?: Record<string, unknown>) {
        const targetElement = element || this.element;
        if (!targetElement) {
            throw new Error("No element provided to ValueSelector");
        }

        if (this.currentCondition && this.hasFinalElse) {
            this.cases.push({
                condition: this.currentCondition,
                getValue: () => undefined
            });
            this.currentCondition = null;
        }
        for (const c of this.cases) {
            if (c.condition(targetElement)) return c.getValue(targetElement);
        }
        throw new Error("No matching case in ValueSelector");
    }

    getFields(): string[] {
        return Array.from(this.usedFields);
    }
}
