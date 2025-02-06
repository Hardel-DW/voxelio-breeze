export type SingleOrMultiple<T> = T | T[];
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type Empty = Record<string | number | symbol, never>;

/**
 * Capitalize the first letter of a string
 * @param s - string
 * @returns string with the first letter capitalized
 */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
