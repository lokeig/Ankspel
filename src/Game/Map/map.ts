import { Grid, Utility, Vector } from "@common";
import { TileConstructor, ITile } from "@game/StaticObjects/Tiles";
import { PlayerCharacter } from "@player";
import { ItemDescription } from "./itemDescription";

class GameMap {
    private tiles: ITile[] = [];
    private playerSpawns: Vector[] = [];
    private items: ItemDescription[] = [];

    public setTile(tile: TileConstructor, gridPos: Vector) {
        const pos = Grid.getWorldPos(gridPos);
        const newTile = new tile(pos, Grid.size);
        this.tiles.push(newTile);
    }

    public getTiles(): ITile[] {
        return this.tiles;
    }

    public setItem(type: string, gridPos: Vector) {;
        this.items.push({ type, gridPos });
    }

    public getItems(): ItemDescription[] {
        return this.items;
    }

    public setPlayerSpawn(gridPos: Vector) {
        const pos = Grid.getWorldPos(gridPos);
        pos.y -= PlayerCharacter.standardHeight;
        pos.x -= PlayerCharacter.standardWidth / 2;
        this.playerSpawns.push(pos);
    }

    public getRandomSpawnLocations(amount: number): Vector[] {
        const spawnCount = this.playerSpawns.length;

        const base = Math.floor(amount / spawnCount);
        const extra = amount % spawnCount;

        const order = Utility.Random.getRandomArray(spawnCount);
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