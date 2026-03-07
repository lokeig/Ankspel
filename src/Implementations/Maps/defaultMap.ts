import { GameMap } from "@game/Map/gameMap";
import { Vector } from "@math";
import { forestBackground } from "@impl/Parallax/forestBackground";

const defaultMap = new GameMap();

defaultMap.fillArea("natureTile", 5, 14, 25, 2);
defaultMap.fillArea("natureTile", 23, 5, 6, 8);
defaultMap.fillArea("natureTile", 3, 8, 2, 8);
defaultMap.fillArea("natureTile", 9, 11, 2, 4);
defaultMap.fillArea("iceTile", 9, 5, 2, 4);
defaultMap.fillArea("iceTile", 15, 7, 3, 3);
defaultMap.setTile("iceTile", new Vector(15, 6));

defaultMap.setPlayerSpawn(new Vector(8, 14));
defaultMap.setPlayerSpawn(new Vector(15, 14));
defaultMap.setPlayerSpawn(new Vector(15, 6));
defaultMap.setPlayerSpawn(new Vector(16, 14));

defaultMap.setItem("chestplate", new Vector(14, 14));
defaultMap.setItem("helmet", new Vector(13, 14));

defaultMap.setItem("shotgun", new Vector(10, 5));
defaultMap.setItem("shotgun", new Vector(20, 14));
defaultMap.setItem("glock", new Vector(21, 14));
defaultMap.setItem("grenade", new Vector(19, 14));

defaultMap.setItemSpawner({ pos: new Vector(12, 13), possibleItems: ["glock"], startSpawned: false, timeBetweenSpawn: 10 });
defaultMap.setItemSpawner({ pos: new Vector(18, 13), possibleItems: ["grenade"], startSpawned: true, timeBetweenSpawn: 5 });

defaultMap.setBackground(forestBackground);

export { defaultMap };