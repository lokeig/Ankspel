import { Shotgun } from "./Items/Shotgun/shotgun";
import { Glock } from "./Items/glock";
import { Grenade } from "./Items/grenade";
import { Chestplate } from "./Items/Armor/chestplate";
import { Helmet } from "./Items/Armor/helmet";
import { ItemManager } from "@item";
import { TileManager } from "@game/Tiles";
import { IceTile } from "./Tiles";
import { NatureTile } from "./Tiles/natureTile";
import { Platform } from "./Tiles/platform";

function registerDefaultNames() {
    ItemManager.registerItem("shotgun", Shotgun);
    ItemManager.registerItem("glock", Glock);
    ItemManager.registerItem("grenade", Grenade);
    ItemManager.registerItem("chestplate", Chestplate);
    ItemManager.registerItem("helmet", Helmet);

    console.log("All good in the neighbourhood")

    TileManager.registerTile("iceTile", IceTile);
    TileManager.registerTile("natureTile", NatureTile);
    TileManager.registerTile("woodPlatform", Platform);

}

export { registerDefaultNames };