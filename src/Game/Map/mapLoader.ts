import { TileManager } from "@game/StaticObjects/Tiles";
import { GameMap } from "./gameMap";
import { PlayerManager } from "@player";
import { MaxMinPositions, Utility } from "@common";
import { ItemManager } from "@item";
import { ProjectileManager } from "@projectile";
import { ParticleManager } from "@game/Particles";
import { BackgroundConfig } from "./backgroundConfig";

class MapLoader {
    public static load(map: GameMap, host: boolean): BackgroundConfig {
        this.reset();
        this.loadTiles(map);

        if (host) {
            this.loadPlayerSpawns(map);
            this.loadItems(map);
        }

        return map.getBackground();
    }

    private static reset(): void {
        PlayerManager.reset();
        TileManager.clear();
        ItemManager.clear();
        ProjectileManager.clear();
        ParticleManager.clear();
    }

    private static loadTiles(map: GameMap): void {
        map.getTiles().forEach(tile => {
            TileManager.setTile(tile);
        });
    }

    private static loadPlayerSpawns(map: GameMap) {
        const playerSpawns = map.getSpawns();
        const spawnCount = playerSpawns.length;

        const players = PlayerManager.getPlayers();
        const playerCount = players.length;

        const base = Math.floor(playerCount / spawnCount);
        const extra = playerCount % spawnCount;

        const order = Utility.Random.order(spawnCount);

        let index = 0;
        for (let i = 0; i < spawnCount && i < playerCount; i++) {
            for (let j = 0; j < base; j++) {
                players[index++].setSpawn(playerSpawns[order[i]]);
            }
        }
        for (let i = 0; i < extra; i++) {
            players[index++].setSpawn(playerSpawns[order[i]]);
        }
    }

    private static loadItems(map: GameMap) {
        map.getItems().forEach(item => {
            ItemManager.create(item.type, item.gridPos);
        });
    }

    public static getMapMinMax(): MaxMinPositions {
        const tiles = TileManager.getTiles();
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        tiles.forEach(tile => {
            const pos = tile.body.pos;
            if (pos.x > maxX) {
                maxX = pos.x;
            }
            if (pos.x < minX) {
                minX = pos.x;
            }
            if (pos.y > maxY) {
                maxY = pos.y;
            }
            if (pos.y < minY) {
                minY = pos.y;
            }
        });

        return { minX, maxX, minY, maxY };
    }
}

export { MapLoader };