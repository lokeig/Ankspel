import { TileManager } from "@game/Tiles";
import { GameMap } from "../Map/gameMap";
import { PlayerManager } from "@player";
import { Grid, MaxMinPositions, SeededRNG, Utility } from "@common";
import { ItemManager } from "@item";
import { ProjectileManager } from "@projectile";
import { ParticleManager } from "@game/Particles";
import { SpawnerManager } from "@game/Spawner";
import { CollisionManager } from "@game/Collision/collisionManager";
import { Connection, GameMessage } from "@server";

class MapLoader {
    public static load(map: GameMap, seed: number, host: boolean): string {
        this.reset();
        this.loadTiles(map);

        const rng = new SeededRNG(seed);
        this.loadSpawners(map);
        this.loadPlayerSpawns(map, rng);
        if (host) {
            this.loadItems(map);
        }

        return map.getBackground();
    }

    private static reset(): void {
        PlayerManager.reload();
        TileManager.clear();
        ItemManager.clear();
        ProjectileManager.clear();
        ParticleManager.clear();
        SpawnerManager.reset();
        CollisionManager.clear();
    }

    private static loadTiles(map: GameMap): void {
        map.getTiles().forEach(tile => {
            TileManager.setTile(tile.type, tile.pos);
        });
    }

    private static loadSpawners(map: GameMap): void {
        map.getItemSpawners().forEach(spawner => SpawnerManager.create(spawner));
    }

    private static loadPlayerSpawns(map: GameMap, seed: SeededRNG) {
        const playerSpawns = map.getSpawns();
        const spawnCount = playerSpawns.length;

        const players = PlayerManager.getEnabled().sort((a, b) => a.getId() - b.getId());
        const playerCount = players.length;

        const base = Math.floor(playerCount / spawnCount);
        const extra = playerCount % spawnCount;

        const order = seed.order(spawnCount);

        let index = 0;
        for (let i = 0; i < spawnCount && i < playerCount; i++) {
            for (let j = 0; j < base; j++) {
                const player = players[index++];
                player.setSpawn(playerSpawns[order[i]]);
            }
        }
        for (let i = 0; i < extra; i++) {
            players[index++].setSpawn(playerSpawns[order[i]]);
        }
    }

    private static loadItems(map: GameMap) {
        map.getItems().forEach(item => {
            const newItem = ItemManager.create(item.type, item.gridPos);
            if (!newItem) {
                return;
            }
            Connection.get().sendGameMessage(GameMessage.SpawnItem, {
                id: newItem.info.id,
                pos: Utility.Vector.convertToNetwork(item.gridPos),
                type: item.type
            });
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
        maxX += Grid.size;
        maxY += Grid.size;

        return { minX, maxX, minY, maxY };
    }
}

export { MapLoader };