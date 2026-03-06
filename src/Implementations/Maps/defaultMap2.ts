import { IceTile } from "@impl/Tiles";
import { GameMap } from "@game/Map/gameMap";
import { Vector } from "@math";

const defaultMap2 = new GameMap();

/**
 * MAIN FLOOR
 */
// Bottom left platform
defaultMap2.fillArea(IceTile, 2, 16, 10, 2);

// Bottom right platform
defaultMap2.fillArea(IceTile, 18, 16, 10, 2);

// Center floating ice arena
defaultMap2.fillArea(IceTile, 10, 12, 10, 2);

// Small center pillar (mix-up / cover)
defaultMap2.fillArea(IceTile, 14, 9, 2, 3);

/**
 * SIDE MID PLATFORMS
 */
defaultMap2.fillArea(IceTile, 3, 10, 5, 2);
defaultMap2.fillArea(IceTile, 22, 10, 5, 2);

/**
 * TOP CONTROL PLATFORMS
 */
defaultMap2.fillArea(IceTile, 6, 6, 6, 2);
defaultMap2.fillArea(IceTile, 18, 6, 6, 2);

/**
 * PLAYER SPAWNS
 */
defaultMap2.setPlayerSpawn(new Vector(4, 15));
defaultMap2.setPlayerSpawn(new Vector(25, 15));
defaultMap2.setPlayerSpawn(new Vector(8, 9));
defaultMap2.setPlayerSpawn(new Vector(21, 9));

/**
 * ITEMS
 */

// Shotgun = dangerous mid control reward
defaultMap2.setItem("shotgun", new Vector(15, 11));

// Grenade = top power spike
defaultMap2.setItem("grenade", new Vector(15, 5));

// Secondary weapons (side pressure)
defaultMap2.setItem("glock", new Vector(5, 9));
defaultMap2.setItem("glock", new Vector(24, 9));

// Defensive gear bottom
defaultMap2.setItem("chestplate", new Vector(6, 15));
defaultMap2.setItem("chestplate", new Vector(23, 15));

defaultMap2.setItem("helmet", new Vector(12, 15));
defaultMap2.setItem("helmet", new Vector(17, 15));

export { defaultMap2 };