import { IceTile } from "@impl/Tiles";
import { GameMap } from "@game/Map/gameMap";
import { Vector } from "@math";

const defaultMap4 = new GameMap();

/**
 * LOWER LANE
 */
defaultMap4.fillArea(IceTile, 2, 18, 12, 2);
defaultMap4.fillArea(IceTile, 18, 18, 12, 2);

/**
 * MID LANE (split with gap)
 */
defaultMap4.fillArea(IceTile, 5, 13, 8, 2);
defaultMap4.fillArea(IceTile, 17, 13, 8, 2);

/**
 * CENTRAL DROP BLOCK (forces movement decisions)
 */
defaultMap4.fillArea(IceTile, 13, 15, 4, 2);

/**
 * UPPER RUN PLATFORM
 */
defaultMap4.fillArea(IceTile, 7, 8, 16, 2);

/**
 * SMALL TOP CORNERS
 */
defaultMap4.fillArea(IceTile, 3, 5, 5, 2);
defaultMap4.fillArea(IceTile, 22, 5, 5, 2);

/**
 * PLAYER SPAWNS (spread across lanes)
 */
defaultMap4.setPlayerSpawn(new Vector(4, 17));
defaultMap4.setPlayerSpawn(new Vector(25, 17));
defaultMap4.setPlayerSpawn(new Vector(6, 12));
defaultMap4.setPlayerSpawn(new Vector(23, 12));

/**
 * ITEMS
 */

// Shotgun = dangerous mid reward
defaultMap4.setItem("shotgun", new Vector(15, 12));

// Grenade = strong top control
defaultMap4.setItem("grenade", new Vector(15, 7));

// Bottom gear (safe route reward)
defaultMap4.setItem("chestplate", new Vector(8, 17));
defaultMap4.setItem("helmet", new Vector(22, 17));

// Side pressure weapons
defaultMap4.setItem("glock", new Vector(3, 4));
defaultMap4.setItem("glock", new Vector(27, 4));

export { defaultMap4 };