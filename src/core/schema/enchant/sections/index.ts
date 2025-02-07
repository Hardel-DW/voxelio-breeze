import { exclusive } from "@/core/schema/enchant/sections/exclusive";
import { find } from "@/core/schema/enchant/sections/find";
import { global } from "@/core/schema/enchant/sections/global";
import { slots } from "@/core/schema/enchant/sections/slots";
import { supported } from "@/core/schema/enchant/sections/supported";
import { technical } from "@/core/schema/enchant/sections/technical";

export const SECTIONS = [global, find, slots, supported, exclusive, technical];
