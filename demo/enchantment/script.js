import { EnchantmentSimulator } from "../../dist/core.js";
import { enchantment, exclusivityTags } from "./mock.js";

const items = {
    sword: {
        id: "minecraft:diamond_sword",
        enchantability: 10,
        tags: [
            "minecraft:swords",
            "minecraft:enchantable/sword",
            "minecraft:enchantable/sharp_weapon",
            "minecraft:enchantable/weapon",
            "minecraft:enchantable/fire_aspect",
            "minecraft:enchantable/durability"
        ]
    },
    book: {
        id: "minecraft:book",
        enchantability: 1,
        tags: ["minecraft:enchantable/durability"]
    },
    bow: {
        id: "minecraft:bow",
        enchantability: 1,
        tags: ["minecraft:enchantable/bow", "minecraft:enchantable/durability"]
    },
    pickaxe: {
        id: "minecraft:diamond_pickaxe",
        enchantability: 10,
        tags: ["minecraft:enchantable/mining", "minecraft:enchantable/durability"]
    }
};

let simulator;

try {
    simulator = new EnchantmentSimulator(enchantment, exclusivityTags);
} catch (error) {
    console.error("Error initializing:", error);
    document.getElementById("results").innerHTML = `<div class="error">Error: ${error.message}</div>`;
}

const displayResults = (element) => {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
    resultsDiv.appendChild(element);
};

const displayError = (error) => {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error";
    errorDiv.textContent = `Error: ${error.message}`;
    displayResults(errorDiv);
};

window.simulateEnchantment = () => {
    try {
        const itemType = document.getElementById("item-select").value;
        const bookshelves = Number.parseInt(document.getElementById("bookshelves").value);
        const enchantability = Number.parseInt(document.getElementById("enchantability").value);

        const item = { ...items[itemType], enchantability };

        const options = simulator.simulateEnchantmentTable(bookshelves, enchantability, item.tags);

        const fragment = document.createDocumentFragment();
        const title = document.createElement("h3");
        title.textContent = `Options for ${item.id}`;
        fragment.appendChild(title);

        if (options.length === 0) {
            const p = document.createElement("p");
            p.textContent = "No enchantments could be generated with the current configuration.";
            fragment.appendChild(p);
        } else {
            options.forEach((option, index) => {
                const optionDiv = document.createElement("div");
                optionDiv.className = "enchantment-option";

                const optionTitle = document.createElement("h4");
                optionTitle.textContent = `Slot ${index + 1} - Level ${option.level} (${option.cost} XP)`;
                optionDiv.appendChild(optionTitle);

                for (const ench of option.enchantments) {
                    const enchDiv = document.createElement("div");
                    enchDiv.textContent = `• ${ench.enchantment} ${ench.level}`;
                    optionDiv.appendChild(enchDiv);
                }
                fragment.appendChild(optionDiv);
            });
        }
        displayResults(fragment);
    } catch (error) {
        displayError(error);
    }
};

window.calculateProbabilities = () => {
    try {
        const itemType = document.getElementById("item-select").value;
        const bookshelves = Number.parseInt(document.getElementById("bookshelves").value);
        const enchantability = Number.parseInt(document.getElementById("enchantability").value);

        const item = { ...items[itemType], enchantability };

        const probabilities = simulator.calculateEnchantmentProbabilities(
            bookshelves,
            enchantability,
            item.tags,
            1000 // 1000 simulations
        );

        const fragment = document.createDocumentFragment();
        const title = document.createElement("h3");
        title.textContent = `Probabilities for ${item.id}`;
        fragment.appendChild(title);

        if (probabilities.length === 0) {
            const p = document.createElement("p");
            p.textContent = "No enchantments possible with current configuration.";
            fragment.appendChild(p);
        } else {
            for (const stat of probabilities) {
                const percentage = stat.probability.toFixed(1);

                const optionDiv = document.createElement("div");
                optionDiv.className = "enchantment-option";

                const statTitle = document.createElement("h4");
                statTitle.textContent = stat.enchantmentId;
                optionDiv.appendChild(statTitle);

                const probContainer = document.createElement("div");
                probContainer.className = "probability-container";

                const probText = document.createElement("div");
                probText.className = "probability-text";
                probText.textContent = `${percentage}% (Average level: ${stat.averageLevel.toFixed(1)})`;
                probContainer.appendChild(probText);

                const probBar = document.createElement("div");
                probBar.className = "probability-bar";

                const probFill = document.createElement("div");
                probFill.className = "probability-fill";
                probFill.style.width = `${percentage}%`;
                probBar.appendChild(probFill);

                probContainer.appendChild(probBar);
                optionDiv.appendChild(probContainer);
                fragment.appendChild(optionDiv);
            }
        }
        displayResults(fragment);
    } catch (error) {
        displayError(error);
    }
};

// Auto-update enchantability when item changes
document.getElementById("item-select").addEventListener("change", function () {
    const itemType = this.value;
    document.getElementById("enchantability").value = items[itemType].enchantability;
});
