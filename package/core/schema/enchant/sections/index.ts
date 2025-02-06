import { exclusive } from "@/lib/minecraft/core/schema/enchant/sections/exclusive.ts";
import { find } from "@/lib/minecraft/core/schema/enchant/sections/find.ts";
import { global } from "@/lib/minecraft/core/schema/enchant/sections/global.ts";
import { slots } from "@/lib/minecraft/core/schema/enchant/sections/slots.ts";
import { supported } from "@/lib/minecraft/core/schema/enchant/sections/supported.ts";
import { technical } from "@/lib/minecraft/core/schema/enchant/sections/technical.ts";

export const SECTIONS = [global, find, slots, supported, exclusive, technical];
