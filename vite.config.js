import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    build: {
        outDir: "dist",
        lib: {
            entry: {
                index: "src/index.ts",
                core: "src/exports/core.ts",
                converter: "src/exports/converter.ts",
                i18n: "src/exports/i18n.ts",
                net: "src/exports/net.ts",
                collections: "src/exports/collections.ts",
                schema: "src/exports/schema.ts"
            },
            formats: ["es"],
            fileName: (_, entryName) => `${entryName}.js`
        },
        rollupOptions: {
            external: ["jszip", "zustand", "zustand/shallow"],
            output: {
                globals: {
                    jszip: "JSZip",
                    zustand: "zustand",
                    "zustand/shallow": "shallow"
                }
            }
        }
    },
    plugins: [
        dts({
            entryRoot: "src",
            outputDir: "dist",
            exclude: ["test/**/*"],
            rollupTypes: true
        })
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            "@test": resolve(__dirname, "test")
        }
    }
});
