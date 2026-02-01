import { IceTile } from "@impl/Tiles";
import { GameMap } from "@game/Map/gameMap";
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

export { defaultMap3 };