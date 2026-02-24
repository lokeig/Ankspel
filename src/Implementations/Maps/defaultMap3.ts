import { IceTile } from "@impl/Tiles";
import { GameMap } from "@game/Map/gameMap";
import { Vector } from "@math";

const defaultMap3 = new GameMap();

/**
 * WIDE BASE FLOOR
 */
defaultMap3.fillArea(IceTile, 6, 18, 18, 2);

/**
 * LOWER SIDE PLATFORMS
 */
defaultMap3.fillArea(IceTile, 4, 14, 6, 2);
defaultMap3.fillArea(IceTile, 20, 14, 6, 2);

/**
 * CENTRAL CORE PLATFORM
 */
defaultMap3.fillArea(IceTile, 12, 12, 6, 2);

/**
 * SIDE MID PLATFORMS
 */
defaultMap3.fillArea(IceTile, 3, 9, 5, 2);
defaultMap3.fillArea(IceTile, 22, 9, 5, 2);

/**
 * TOP TOWER PLATFORM
 */
defaultMap3.fillArea(IceTile, 13, 6, 4, 2);

/**
 * SMALL TOP WINGS (grenade risk zone)
 */
defaultMap3.fillArea(IceTile, 8, 4, 4, 2);
defaultMap3.fillArea(IceTile, 18, 4, 4, 2);

/**
 * PLAYER SPAWNS (spread vertically)
 */
defaultMap3.setPlayerSpawn(new Vector(9, 17));
defaultMap3.setPlayerSpawn(new Vector(21, 17));
defaultMap3.setPlayerSpawn(new Vector(5, 8));
defaultMap3.setPlayerSpawn(new Vector(24, 8));

/**
 * ITEMS
 */

// Shotgun = central dominance
defaultMap3.setItem("shotgun", new Vector(15, 11));

// Grenade = high-risk top power
defaultMap3.setItem("grenade", new Vector(15, 5));

// Side pistols for scrappy fights
defaultMap3.setItem("glock", new Vector(5, 13));
defaultMap3.setItem("glock", new Vector(24, 13));

// Bottom survival gear
defaultMap3.setItem("chestplate", new Vector(10, 17));
defaultMap3.setItem("helmet", new Vector(20, 17));

export { defaultMap3 };