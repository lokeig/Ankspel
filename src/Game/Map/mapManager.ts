import { GameMap } from "./map";

class MapManager {
    private static maps: Map<string, GameMap> = new Map;

    public static addMap(name: string, map: GameMap) {
        this.maps.set(name, map);
    }

    public static getMap(name: string): GameMap {
        return this.maps.get(name)!;
    }
}

export { MapManager };