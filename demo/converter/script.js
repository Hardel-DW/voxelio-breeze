import { analyserCollection } from "../../dist/core.js";

const placeholderExample = {
    type: "minecraft:crafting_shapeless",
    category: "building",
    group: "planks",
    ingredients: ["#minecraft:acacia_logs"],
    result: {
        count: 4,
        id: "minecraft:acacia_planks"
    }
};

function getContent(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return "";

    const content = element.value.trim();
    console.log(`getContent(${elementId}):`, content);
    return content;
}

function parseJSONOrJS(content) {
    try {
        return JSON.parse(content);
    } catch (e) {
        try {
            const wrappedContent = content.startsWith("{") && !content.startsWith("({") ? `(${content})` : content;
            return new Function(`"use strict"; return (${wrappedContent})`)();
        } catch (e2) {
            throw new Error(`Invalid format - neither valid JSON nor JavaScript object: ${e.message}`);
        }
    }
}

function setContent(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = content;
    }
}

function formatJSON(elementId) {
    const content = getContent(elementId);
    if (content) {
        try {
            const parsed = parseJSONOrJS(content);
            const formatted = JSON.stringify(parsed, null, 2);
            setContent(elementId, formatted);
            showStatus("✅ JSON formatted!");
        } catch (e) {
            showStatus("❌ Invalid format", true);
        }
    }
}

function showStatus(message, isError = false) {
    const status = document.getElementById("status");
    status.textContent = message;
    status.className = `status ${isError ? "error" : "success"}`;
    setTimeout(() => {
        status.textContent = "";
        status.className = "status";
    }, 3000);
}

function loadPlaceholder() {
    setContent("dataDriven", JSON.stringify(placeholderExample, null, 2));
    showStatus("Placeholder loaded!");
}

function convertToVoxel() {
    const dataDrivenText = getContent("dataDriven");
    const schemaType = document.getElementById("schemaType").value;

    console.log("convertToVoxel - dataDrivenText:", dataDrivenText);
    console.log("convertToVoxel - schemaType:", schemaType);

    if (!dataDrivenText) {
        showStatus("Please enter DataDriven JSON or JS object", true);
        return;
    }

    try {
        const dataDrivenJson = parseJSONOrJS(dataDrivenText);
        console.log("convertToVoxel - parsed object:", dataDrivenJson);

        const analyser = analyserCollection[schemaType];
        console.log("convertToVoxel - analyser:", analyser);

        if (!analyser) {
            throw new Error(`Schema type "${schemaType}" not supported`);
        }

        const voxelFormat = analyser.parser({
            element: {
                identifier: { namespace: "test", registry: schemaType, resource: "converted" },
                data: dataDrivenJson
            }
        });

        console.log("convertToVoxel - voxelFormat:", voxelFormat);
        setContent("voxelDriven", JSON.stringify(voxelFormat, null, 2));
        showStatus("✅ Conversion to Voxel successful!");
    } catch (error) {
        showStatus(`❌ Conversion error: ${error.message}`, true);
        console.error("Detailed error:", error);
    }
}

function convertToDataDriven() {
    const voxelText = getContent("voxelDriven");
    const schemaType = document.getElementById("schemaType").value;

    if (!voxelText) {
        showStatus("Please enter VoxelDriven JSON or JS object", true);
        return;
    }

    try {
        const voxelJson = parseJSONOrJS(voxelText);

        const analyser = analyserCollection[schemaType];
        if (!analyser) {
            throw new Error(`Schema type "${schemaType}" not supported`);
        }

        const dataDrivenFormat = analyser.compiler(voxelJson, schemaType);

        setContent("dataDriven", JSON.stringify(dataDrivenFormat, null, 2));
        showStatus("✅ Conversion to DataDriven successful!");
    } catch (error) {
        showStatus(`❌ Conversion error: ${error.message}`, true);
        console.error("Detailed error:", error);
    }
}

function clearAll() {
    const dataDrivenElement = document.getElementById("dataDriven");
    const voxelDrivenElement = document.getElementById("voxelDriven");

    dataDrivenElement.value = "";
    voxelDrivenElement.value = "";

    showStatus("All cleared!");
}

window.showStatus = showStatus;
window.loadPlaceholder = loadPlaceholder;
window.convertToVoxel = convertToVoxel;
window.convertToDataDriven = convertToDataDriven;
window.clearAll = clearAll;

function addFormatButtons() {
    console.log("Basic interface ready");
}

window.onload = () => {
    console.log("Page loaded, basic interface...");
    addFormatButtons();
};
