import { Grid, Utility, Vector } from "@common";
import { TileConstructor, TileInterface } from "@game/StaticObjects/Tiles";
import { ItemConstructor, ItemInterface } from "@item";
import { PlayerCharacter } from "@player";

class GameMap {
    private tiles: TileInterface[] = [];
    private playerSpawns: Vector[] = [];
    private items: ItemInterface[] = [];

    public setTile(tile: TileConstructor, gridPos: Vector) {
        const pos = Grid.getWorldPos(gridPos);
        const newTile = new tile(pos, Grid.size);
        this.tiles.push(newTile);
    }

    public getTiles(): TileInterface[] {
        return this.tiles;
    }

    public setItem(item: ItemConstructor, gridPos: Vector) {
        const pos = Grid.getWorldPos(gridPos);
        const newItem = new item(pos);
        newItem.common.body.pos.y += newItem.common.body.height;
        newItem.common.body.pos.x += (newItem.common.body.width - Grid.size) / 2;
        this.items.push(newItem);
    }

    public getItems(): ItemInterface[] {
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

        console.log(result);
        return result;
    }
}

export { GameMap };