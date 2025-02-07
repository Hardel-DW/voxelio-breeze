import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    build: {
        outDir: "dist",
        lib: {
            formats: ["umd"],
            entry: "src/index.ts",
            fileName: "voxel",
            name: "@voxelio/core"
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
    resolve: {
        alias: {
            "@": resolve(__dirname, "src")
        }
    }
});
