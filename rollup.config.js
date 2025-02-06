import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import tsconfigPaths from "rollup-plugin-tsconfig-paths";

export default {
    input: "package/index.ts", // Point d'entrée de votre module
    output: [
        {
            file: "package/dist/index.cjs", // Sortie CommonJS
            format: "cjs",
            sourcemap: true
        },
        {
            file: "package/dist/index.esm.js", // Sortie ESM
            format: "esm",
            sourcemap: true
        }
    ],
    plugins: [
        tsconfigPaths(),
        resolve(),
        commonjs(),
        typescript({ tsconfig: "./tsconfig.json" }),
        terser()
    ]
};
