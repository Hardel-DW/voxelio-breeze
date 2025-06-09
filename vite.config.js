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
                schema: "src/exports/schema.ts"
            },
            formats: ["es"],
            fileName: (_, entryName) => `${entryName}.js`
        }
    },
    plugins: [
        dts({
            entryRoot: "src",
            outputDir: "dist",
            exclude: ["test/**/*", "benchmark/**/*"],
            rollupTypes: true
        })
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            "@test": resolve(__dirname, "test"),
            "@benchmark": resolve(__dirname, "benchmark")
        }
    }
});
