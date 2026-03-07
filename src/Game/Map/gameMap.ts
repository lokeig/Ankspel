import { Utility } from "@common";
import { ItemDescription } from "./itemDescription";
import { Vector } from "@math";
import { BackgroundConfig } from "./backgroundConfig";
import { SpawnerDescription } from "./spawnerDescription";
import { TileDescription } from "./tileDescription";

class GameMap {
    private tiles: TileDescription[] = [];
    private playerSpawns: Vector[] = [];
    private items: ItemDescription[] = [];
    private background!: BackgroundConfig;
    private itemSpawners: SpawnerDescription[] = [];

    public setBackground(config: BackgroundConfig): void {
        this.background = config;
    }   

    public getBackground(): BackgroundConfig {
        return this.background;
    }

    public setTile(type: string, gridPos: Vector): void {
        this.tiles.push({ type, pos: gridPos });
    }

    public getTiles(): TileDescription[] {
        return this.tiles;
    }

    public fillArea(type: string, x: number, y: number, width: number, height: number): void {
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                this.setTile(type, new Vector(x + i, y + j));
            }
        }
    }

    public setItem(type: string, gridPos: Vector): void {
        this.items.push({ type, gridPos });
    }

    public setItemSpawner(description: SpawnerDescription): void {
        this.itemSpawners.push(description);
    }

    public getItemSpawners(): SpawnerDescription[] {
        return this.itemSpawners;
    }

    public getItems(): ItemDescription[] {
        return this.items;
    }

    public setPlayerSpawn(gridPos: Vector): void {
        this.playerSpawns.push(gridPos);
    }

    public getSpawns(): Vector[] {
        return this.playerSpawns;
    }

    public getRandomSpawnLocations(amount: number): Vector[] {
        const spawnCount = this.playerSpawns.length;

        const base = Math.floor(amount / spawnCount);
        const extra = amount % spawnCount;

        const order = Utility.Random.order(spawnCount);
        const result: Vector[] = new Array(amount);

        let index = 0;
        for (let i = 0; i < spawnCount && i < amount; i++) {
            for (let j = 0; j < base; j++) {
                result[index++] = this.playerSpawns[order[i]];
            }
        }
        for (let i = 0; i < extra; i++) {
            result[index++] = this.playerSpawns[order[i]];
        }
        return result;
    }
}

export { GameMap };