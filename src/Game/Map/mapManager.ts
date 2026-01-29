import { Utility } from "@common";
import { GameMap } from "./map";

class MapManager {
    private static maps: Map<string, GameMap> = new Map;

    public static addMap(name: string, map: GameMap) {
        this.maps.set(name, map);
    }

    public static getMap(name: string): GameMap {
        return this.maps.get(name)!;
    }

    public static getRandomMap(): [string, GameMap] {
        const mapsArray = Array.from(this.maps);
        const index = Utility.Random.getNumber(0, mapsArray.length - 1);
        return mapsArray[index];
    }
}

export { MapManager };