import { voxelDatapacks } from "@/index";
import { simpleEnchantment, DATA_DRIVEN_TEMPLATE_ENCHANTMENT } from "./concept/enchant/DataDriven";
import { enchantplusTags, fireAspectTag, swordAttributeTag, vanillaTags } from "./concept/enchant/DataDrivenTags";
import { completeLootTable, advancedLootTable, ultimateTestLootTable, finalBossOfLootTable } from "./concept/loot/DataDriven";
import { prepareFiles, createFilesFromElements, createZipFile } from "./utils";

export const lootTableFile = {
    "data/test/loot_table/test.json": completeLootTable,
    "data/test/loot_table/advanced.json": advancedLootTable,
    "data/test/loot_table/ultimate.json": ultimateTestLootTable,
    "data/test/loot_table/final_boss.json": finalBossOfLootTable
};

export const enchantmentFile = {
    "data/enchantplus/enchantment/sword/attack_speed.json": simpleEnchantment,
    "data/enchantplus/tags/enchantment/exclusive_set/sword_attribute.json": swordAttributeTag,
    "data/minecraft/tags/enchantment/non_treasure.json": fireAspectTag,
    "data/yggdrasil/tags/enchantment/equipment/item/sword.json": fireAspectTag
};

export const testMcMetaNotExists = {
    "data/enchantplus/enchantment/test.json": new TextEncoder().encode(JSON.stringify({}, null, 2))
};

export const enchantmentWithTagFiles = createFilesFromElements([
    ...DATA_DRIVEN_TEMPLATE_ENCHANTMENT,
    ...voxelDatapacks,
    ...enchantplusTags,
    ...vanillaTags
]);

export const nonValidMcmetaZip = prepareFiles({}, -1);
export const lootTableZip = await createZipFile(prepareFiles(lootTableFile));
