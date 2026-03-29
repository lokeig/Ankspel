import { Utility } from "@common";
import { GameMap } from "./gameMap";

class MapManager {
    private static maps: GameMap[] = [];

    public static addMap(map: GameMap) {
        this.maps.push(map);
    }

    public static getMap(id: number): GameMap {
        return this.maps[id];
    }

    public static getRandomMap(): number {
        return Utility.Random.getInteger(0, this.maps.length - 1);
    }
}

export { MapManager };