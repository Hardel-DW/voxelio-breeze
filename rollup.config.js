import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import tsconfigPaths from "rollup-plugin-tsconfig-paths";
import commonjs from "@rollup/plugin-commonjs";

const createConfig = (input, output) => ({
    input,
    output: {
        file: `dist/${output}.esm.js`,
        format: "esm",
        sourcemap: true
    },
    external: ["jszip", "react", "zustand", "zustand/vanilla/shallow"],
    plugins: [
        tsconfigPaths(),
        resolve({
            preferBuiltins: true
        }),
        commonjs(),
        typescript({
            tsconfig: "./tsconfig.json",
            include: ["src/**/*"]
        }),
        terser()
    ]
});

export default [
    createConfig("src/exports/core.ts", "core"),
    createConfig("src/exports/collections.ts", "collections"),
    createConfig("src/exports/converter.ts", "converter"),
    createConfig("src/exports/net.ts", "net"),
    createConfig("src/exports/i18n.ts", "i18n")
];
