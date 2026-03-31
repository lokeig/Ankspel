import { Side } from "@common";
import { GameMap } from "@game/Map/gameMap";
import { Vector } from "@math";

const defaultMap = new GameMap();

defaultMap.fillArea("natureTile", 5, 14, 25, 2);
defaultMap.fillArea("natureTile", 23, 5, 6, 8);
defaultMap.fillArea("natureTile", 3, 6, 2, 6);
defaultMap.fillArea("natureTile", 9, 11, 2, 4);
defaultMap.fillArea("iceTile", 9, 5, 2, 4);
defaultMap.fillArea("iceTile", 15, 7, 3, 3);
defaultMap.setTile("iceTile", new Vector(15, 6));

defaultMap.fillArea("natureTile", -47, 15, 50, 2);

defaultMap.fillArea("woodPlatform", 3, 5, 4, 1);
defaultMap.fillArea("woodPlatform", 5, 5, 1, 8);
defaultMap.fillArea("woodPlatform", 5, 7, 4, 6);

defaultMap.fillArea("iceTile", 30, 14, 4, 1);

defaultMap.setPlayerSpawn({ pos: new Vector(8, 14), direction: Side.Left });
defaultMap.setPlayerSpawn({ pos: new Vector(15, 14), direction: Side.Left });
defaultMap.setPlayerSpawn({ pos: new Vector(15, 6), direction: Side.Left });
defaultMap.setPlayerSpawn({ pos: new Vector(16, 14), direction: Side.Left });

defaultMap.setItem("rock", new Vector(19, 13));
defaultMap.setItem("crate", new Vector(20, 13));

defaultMap.setItemSpawner({ pos: new Vector(12, 13), possibleItems: ["glock"], startSpawned: true, timeBetweenSpawn: 10 });
defaultMap.setItemSpawner({ pos: new Vector(18, 13), possibleItems: ["grenade"], startSpawned: true, timeBetweenSpawn: 5 });
defaultMap.setItemSpawner({ pos: new Vector(3, 4), possibleItems: ["shotgun"], startSpawned: true, timeBetweenSpawn: 7 });
defaultMap.setItemSpawner({ pos: new Vector(9, 4), possibleItems: ["helmet", "chestplate"], startSpawned: false, timeBetweenSpawn: 2 });
defaultMap.setItemSpawner({ pos: new Vector(13, 13), possibleItems: ["helmet"], startSpawned: false, timeBetweenSpawn: 2 });
defaultMap.setItemSpawner({ pos: new Vector(14, 13), possibleItems: ["chestplate"], startSpawned: true, timeBetweenSpawn: 2 });

defaultMap.setBackground("forest");

export { defaultMap };