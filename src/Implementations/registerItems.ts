import { Shotgun } from "./Items/Shotgun/shotgun";
import { Glock } from "./Items/glock";
import { Grenade } from "./Items/grenade";
import { Chestplate } from "./Items/Armor/chestplate";
import { Helmet } from "./Items/Armor/helmet";
import { ItemManager } from "@item";
import { TileManager } from "@game/StaticObjects/Tiles";
import { IceTile } from "./Tiles";
import { NatureTile } from "./Tiles/natureTile";

function registerDefaultNames() {
    ItemManager.registerItem("shotgun", Shotgun);
    ItemManager.registerItem("glock", Glock);
    ItemManager.registerItem("grenade", Grenade);
    ItemManager.registerItem("chestplate", Chestplate);
    ItemManager.registerItem("helmet", Helmet);

    TileManager.registerTile("iceTile", IceTile);
    TileManager.registerTile("natureTile", NatureTile);
}

export { registerDefaultNames };