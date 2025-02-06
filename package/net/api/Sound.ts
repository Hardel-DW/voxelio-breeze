import { capitalize } from "@/lib/utils.ts";

const owner = "misode";
const repository = "mcmeta";
const branch = "assets";
const basePath = "assets/minecraft/sounds";
const url = `https://api.github.com/repos/${owner}/${repository}/contents/${basePath}?ref=${branch}`;

const audioOwner = "PixiGeko";
const audioRepository = "Minecraft-generated-data";
const audioBranch = "1.21.4";
const audioBasePath = "custom-generated/misc";
const audioUrl = `https://api.github.com/repos/${audioOwner}/${audioRepository}/contents/${audioBasePath}/sounds.json?ref=${audioBranch}`;

export type SoundTest = {
    [key: string]: {
        hash: string;
        size: number;
        url: string;
    };
};

export type CategorySound = {
    name: string;
    category: string;
};

/**
 * Search all elements in the sound directory, using GitHub API
 */
export async function searchSound(): Promise<Record<string, string>> {
    try {
        console.log("Fetching data from GitHub API...", audioUrl);
        const response = await fetch(audioUrl);
        if (!response.ok) {
            console.error(`GitHub API request failed with status: ${response.status}`);
            return {};
        }

        const data: SoundTest = await response.json();
        const test: Record<string, string> = {};
        for (const [key, value] of Object.entries(data)) {
            test[key] = value.hash;
        }

        return test;
    } catch (error) {
        console.error("Error fetching data from GitHub API:", error);
        return {};
    }
}

export async function getCategory(): Promise<CategorySound[]> {
    try {
        console.log("Fetching data from GitHub API...", url);
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`GitHub API request failed with status: ${response.status}`);
            return [];
        }

        const data: Array<any> = await response.json();
        const result: Array<CategorySound> = [];

        for (const element of data) {
            const category = element.path;
            const name = capitalize(element.name);
            result.push({ name, category });
        }

        return result;
    } catch (error) {
        console.error("Error fetching data from GitHub API:", error);
        return [];
    }
}
