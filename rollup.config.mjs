import alias from "@rollup/plugin-alias";
import typescript from "rollup-plugin-typescript2";
import { defineConfig } from "rollup";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { dirname } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    input: {
        converter: "src/exports/converter.ts",
        core: "src/exports/core.ts",
        i18n: "src/exports/i18n.ts",
        net: "src/exports/net.ts",
        collections: "src/exports/collections.ts"
    },
    output: {
        dir: "dist",
        format: "esm",
        sourcemap: true,
        entryFileNames: "[name].js"
    },
    plugins: [
        alias({
            entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }]
        }),
        typescript({
            tsconfig: "tsconfig.json",
            useTsconfigDeclarationDir: true
        })
    ],
    external: ["jszip", "zustand", "zustand/shallow"]
});
