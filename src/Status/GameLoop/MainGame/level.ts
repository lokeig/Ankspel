import { ItemInterface } from "./Objects/DynamicObjects/Items/Common/itemInterface";
import { Vector } from "./Common/Types/vector";
import { tileType as TileType } from "./Objects/StaticObjects/tileType";

type TileInfo = {
    pos: Vector,
    type: TileType
}

export class Level {
    private name: string;
    private tiles: Array<TileInfo> = [];
    private spawns: Array<Vector> = [];
    private items: Array<ItemInterface> = [];

    constructor(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setTiles(tiles: TileInfo[]): void{
        this.tiles = tiles;
    }

    public getTiles(): Array<TileInfo> {
        return this.tiles;
    }

    public setSpawns(positions: Vector[]): void{
        this.spawns = positions;
    }
        
    public getSpawns(): Array<Vector> {
        return this.spawns;
    }  

    public setItems(items: ItemInterface[]): void{
        this.items = items;
    }

    public getItems(): Array<ItemInterface> {
        return this.items;
    }
}