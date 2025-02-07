import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import tsconfigPaths from "rollup-plugin-tsconfig-paths";

const createConfig = (input, output) => ({
    input,
    output: {
        file: `dist/${output}.esm.js`,
        format: "esm",
        sourcemap: true
    },
    plugins: [
        tsconfigPaths(),
        resolve(),
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
    createConfig("src/exports/render.ts", "render"),
    createConfig("src/exports/i18n.ts", "i18n")
];
