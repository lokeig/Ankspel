import { ItemDescription } from "./itemDescription";
import { Vector } from "@math";
import { SpawnerDescription } from "./spawnerDescription";
import { TileDescription } from "./tileDescription";
import { PlayerSpawnDescription } from "./PlayerSpawnDescription";

class GameMap {
    private tiles: TileDescription[] = [];
    private playerSpawns: PlayerSpawnDescription[] = [];
    private items: ItemDescription[] = [];
    private background!: string;
    private itemSpawners: SpawnerDescription[] = [];

    public setBackground(background: string): void {
        this.background = background;
    }   

    public getBackground(): string {
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

    public setPlayerSpawn(spawn: PlayerSpawnDescription): void {
        this.playerSpawns.push(spawn);
    }

    public getSpawns(): PlayerSpawnDescription[] {
        return this.playerSpawns;
    }
}

export { GameMap };