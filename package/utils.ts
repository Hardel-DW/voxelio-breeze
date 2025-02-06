export type SingleOrMultiple<T> = T | T[];
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type Empty = Record<string | number | symbol, never>;
