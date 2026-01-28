import { Shotgun } from "./Shotgun/shotgun";
import { Glock } from "./glock";
import { Grenade } from "./grenade";
import { Chestplate } from "./Armor/chestplate";
import { Helmet } from "./Armor/helmet";
import { ItemManager } from "@item";

function RegisterItems() {
    ItemManager.registerItem("shotgun", Shotgun);
    ItemManager.registerItem("glock", Glock);
    ItemManager.registerItem("grenade", Grenade);
    ItemManager.registerItem("chestplate", Chestplate);
    ItemManager.registerItem("helmet", Helmet);
}

export { RegisterItems };