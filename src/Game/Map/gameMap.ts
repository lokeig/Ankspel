import { Grid, Utility, Vector } from "@common";
import { TileConstructor, ITile } from "@game/StaticObjects/Tiles";
import { PlayerCharacter } from "@player";
import { ItemDescription } from "./itemDescription";

class GameMap {
    private tiles: ITile[] = [];
    private playerSpawns: Vector[] = [];
    private items: ItemDescription[] = [];

    public setTile(tile: TileConstructor, gridPos: Vector): void {
        const pos = Grid.getWorldPos(gridPos);
        const newTile = new tile(pos, Grid.size);
        this.tiles.push(newTile);
    }

    public getTiles(): ITile[] {
        return this.tiles;
    }

    public fillArea(tile: TileConstructor, x: number, y: number, width: number, height: number): void {
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                this.setTile(tile, new Vector(x + i, y + j));
            }
        }
    }

    public setItem(type: string, gridPos: Vector): void {
        this.items.push({ type, gridPos });
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