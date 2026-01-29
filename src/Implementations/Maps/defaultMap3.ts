import { IceTile } from "@impl/Tiles";
import { GameMap } from "@game/Map/map";
import { Vector } from "@common";

const defaultMap3 = new GameMap();

defaultMap3.fillArea(IceTile, 5, 14, 25, 2);
defaultMap3.fillArea(IceTile, 23, 5, 6, 8);
defaultMap3.fillArea(IceTile, 3, 8, 2, 8);
defaultMap3.fillArea(IceTile, 9, 11, 2, 4);
defaultMap3.fillArea(IceTile, 9, 5, 2, 4);
defaultMap3.fillArea(IceTile, 15, 7, 3, 3);

defaultMap3.setPlayerSpawn(new Vector(8, 14));
defaultMap3.setPlayerSpawn(new Vector(15, 14));
defaultMap3.setPlayerSpawn(new Vector(15, 5));
defaultMap3.setPlayerSpawn(new Vector(16, 14));

defaultMap3.setTile(IceTile, new Vector(15, 6));

defaultMap3.setItem("chestplate", new Vector(12, 13));
defaultMap3.setItem("chestplate", new Vector(14, 13));

defaultMap3.setItem("helmet", new Vector(12, 14));

defaultMap3.setItem("shotgun", new Vector(10, 3));
defaultMap3.setItem("shotgun", new Vector(20, 14));
defaultMap3.setItem("glock", new Vector(21, 12));
defaultMap3.setItem("grenade", new Vector(19, 12));

export { defaultMap3 };