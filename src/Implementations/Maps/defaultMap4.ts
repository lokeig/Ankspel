import { IceTile } from "@impl/Tiles";
import { GameMap } from "@game/Map/gameMap";
import { Vector } from "@common";

const defaultMap4 = new GameMap();

defaultMap4.fillArea(IceTile, 5, 14, 25, 2);

defaultMap4.setPlayerSpawn(new Vector(8, 14));
defaultMap4.setPlayerSpawn(new Vector(15, 14));
defaultMap4.setPlayerSpawn(new Vector(15, 5));
defaultMap4.setPlayerSpawn(new Vector(16, 14));

defaultMap4.setTile(IceTile, new Vector(15, 6));

defaultMap4.setItem("chestplate", new Vector(12, 13));
defaultMap4.setItem("chestplate", new Vector(14, 13));

defaultMap4.setItem("helmet", new Vector(12, 14));

defaultMap4.setItem("shotgun", new Vector(10, 3));
defaultMap4.setItem("shotgun", new Vector(20, 14));
defaultMap4.setItem("glock", new Vector(21, 12));
defaultMap4.setItem("grenade", new Vector(19, 12));

export { defaultMap4 };