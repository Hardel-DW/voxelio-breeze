import dts from "rollup-plugin-dts";

export default [
    {
        input: "dist/types/exports/core.d.ts",
        output: [{ file: "dist/exports/core.d.ts", format: "esm" }],
        plugins: [dts()]
    },
    {
        input: "dist/types/exports/collections.d.ts",
        output: [{ file: "dist/exports/collections.d.ts", format: "esm" }],
        plugins: [dts()]
    },
    {
        input: "dist/types/exports/converter.d.ts",
        output: [{ file: "dist/exports/converter.d.ts", format: "esm" }],
        plugins: [dts()]
    },
    {
        input: "dist/types/exports/net.d.ts",
        output: [{ file: "dist/exports/net.d.ts", format: "esm" }],
        plugins: [dts()]
    },
    {
        input: "dist/types/exports/i18n.d.ts",
        output: [{ file: "dist/exports/i18n.d.ts", format: "esm" }],
        plugins: [dts()]
    }
];
