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

window.simulateEnchantment = () => {
    try {
        const itemType = document.getElementById("item-select").value;
        const bookshelves = Number.parseInt(document.getElementById("bookshelves").value);
        const enchantability = Number.parseInt(document.getElementById("enchantability").value);

        const item = { ...items[itemType], enchantability };

        console.log("Item tags:", item.tags);
        console.log("Available enchantments:", Array.from(enchantment.keys()));

        const options = simulator.simulateEnchantmentTable(bookshelves, enchantability, item.tags);
        console.log("Options result:", options);

        let html = `<h3>Options for ${item.id}</h3>`;

        options.forEach((option, index) => {
            html += `
                <div class="enchantment-option">
                    <h4>Slot ${index + 1} - Niveau ${option.level} (${option.cost} XP)</h4>
                    ${option.enchantments.map((ench) => `<div>• ${ench.enchantment} ${ench.level}</div>`).join("")}
                </div>
            `;
        });

        document.getElementById("results").innerHTML = html;
    } catch (error) {
        document.getElementById("results").innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
};

window.calculateProbabilities = () => {
    try {
        const itemType = document.getElementById("item-select").value;
        const bookshelves = Number.parseInt(document.getElementById("bookshelves").value);
        const enchantability = Number.parseInt(document.getElementById("enchantability").value);

        const item = { ...items[itemType], enchantability };
        console.log(item);

        const probabilities = simulator.calculateEnchantmentProbabilities(
            bookshelves,
            enchantability,
            item.tags,
            1000 // 1000 simulations
        );

        let html = `<h3>Probabilities for ${item.id}</h3>`;

        for (const stat of probabilities) {
            const percentage = stat.probability.toFixed(1);
            html += `
                <div class="enchantment-option">
                    <h4>${stat.enchantmentId}</h4>
                    <div class="probability-container">
                        <div class="probability-text">
                            ${percentage}% (Average level: ${stat.averageLevel.toFixed(1)})
                        </div>
                        <div class="probability-bar">
                            <div class="probability-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }

        document.getElementById("results").innerHTML = html;
    } catch (error) {
        document.getElementById("results").innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
};

// Auto-update enchantability when item changes
document.getElementById("item-select").addEventListener("change", function () {
    const itemType = this.value;
    document.getElementById("enchantability").value = items[itemType].enchantability;
});
