import { IceTile } from "@impl/Tiles";
import { GameMap } from "@game/Map/gameMap";
import { Vector } from "@math";

const defaultMap = new GameMap();

defaultMap.fillArea(IceTile, 5, 14, 25, 2);
defaultMap.fillArea(IceTile, 23, 5, 6, 8);
defaultMap.fillArea(IceTile, 3, 8, 2, 8);
defaultMap.fillArea(IceTile, 9, 11, 2, 4);
defaultMap.fillArea(IceTile, 9, 5, 2, 4);
defaultMap.fillArea(IceTile, 15, 7, 3, 3);

defaultMap.setPlayerSpawn(new Vector(8, 14));
defaultMap.setPlayerSpawn(new Vector(15, 14));
defaultMap.setPlayerSpawn(new Vector(15, 6));
defaultMap.setPlayerSpawn(new Vector(16, 14));

defaultMap.setTile(IceTile, new Vector(15, 6));

defaultMap.setItem("chestplate", new Vector(12, 14));
defaultMap.setItem("chestplate", new Vector(14, 14));

defaultMap.setItem("helmet", new Vector(12, 14));

defaultMap.setItem("shotgun", new Vector(10, 5));
defaultMap.setItem("shotgun", new Vector(20, 14));
defaultMap.setItem("glock", new Vector(21, 14));
defaultMap.setItem("grenade", new Vector(19, 14));

export { defaultMap };