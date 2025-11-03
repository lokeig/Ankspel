import { ItemManager } from "@item";
import { Shotgun } from "./shotgun";
import { Glock } from "./glock";
import { Grenade } from "./grenade";

function RegisterItems() {
    ItemManager.registerItem("shotgun", Shotgun);
    ItemManager.registerItem("glock", Glock);
    ItemManager.registerItem("grenade", Grenade);
}

export { RegisterItems };