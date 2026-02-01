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

    public static getRandomMap(): [number, GameMap] {
        const index = Math.floor(this.maps.length * Math.random());
        console.log(index)
        return [index, this.maps[index]];
    }
}

export { MapManager };