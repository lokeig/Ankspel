import { ParticleManager } from "@game/Particles";
import { ItemManager } from "@game/Item";
import { PlayerManager } from "@game/Player";
import { ProjectileManager } from "@game/Projectile";
import { TileManager } from "@game/StaticObjects/Tiles";
import { GameMap, MapManager } from "@game/Map";

class GameLoopUtility {

    public static update(deltaTime: number): void {
        const fixedStep = 0.1;
        const maxIterations = 20;

        let remainingDelta = deltaTime;
        let iterations = 0;

        while (remainingDelta > 0 && iterations < maxIterations) {

            const currentDelta = Math.min(fixedStep, remainingDelta);
            remainingDelta -= currentDelta;

            this.gameUpdate(currentDelta);

            iterations++;
        }
    }

    private static gameUpdate(deltaTime: number): void {
        ItemManager.update(deltaTime);
        PlayerManager.update(deltaTime);
        ProjectileManager.update(deltaTime);
        ParticleManager.update(deltaTime);
    }

    public static draw(): void {
        ProjectileManager.draw();
        ItemManager.draw();
        PlayerManager.draw();
        ParticleManager.draw();
        TileManager.draw();
    }

    public static loadMap(map: GameMap): void {
        const tiles = map.getTiles();
        const items = map.getItems();
        items.forEach(item => ItemManager.addItem(item));
        tiles.forEach(tile => TileManager.setTile(tile));
    }

    public static setSpawns(mapName: string): void {
        const map = MapManager.getMap(mapName);
        const players = PlayerManager.getPlayers();
        const spawns = map.getRandomSpawnLocations(players.length);
        for (let i = 0; i < players.length; i++) {
            players[i].setCharacter(spawns[i]);
        }
    }
}

export { GameLoopUtility };