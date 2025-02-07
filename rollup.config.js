import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import tsconfigPaths from "rollup-plugin-tsconfig-paths";
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: {
        core: "./src/exports/core.ts",
        collections: "./src/exports/collections.ts",
        converter: "./src/exports/converter.ts",
        net: "./src/exports/net.ts",
        i18n: "./src/exports/i18n.ts"
    },
    output: {
        dir: "dist",
        format: "esm",
        sourcemap: true,
        entryFileNames: "[name].js"
    },
    external: ["jszip", "react", "zustand", "zustand/vanilla/shallow"],
    plugins: [tsconfigPaths(), resolve(), commonjs(), typescript({ useTsconfigDeclarationDir: true }), terser()]
};
