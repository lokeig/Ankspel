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

    public toJson(): any {
        return {
            playerSpawns: this.playerSpawns,
            items: this.items,
            background: this.background,
            tiles: this.tiles,
            itemSpawners: this.itemSpawners,
        };
    }

    public static fromJson(obj: any): GameMap {
        const map = new GameMap();
        (obj.tiles ?? []).forEach((tile: any) => {
            if (!tile?.type || !tile?.pos) {
                return;
            }
            map.setTile(
                tile.type,
                new Vector(tile.pos.x, tile.pos.y)
            );
        });
        (obj.items ?? []).forEach((item: any) => {
            if (!item?.type || !item?.gridPos) {
                return;
            }
            map.setItem(
                item.type,
                new Vector(item.gridPos.x, item.gridPos.y)
            );
        });
        (obj.playerSpawns ?? []).forEach((playerSpawn: any) => {
            if (!playerSpawn?.pos) {
                return;
            }
            map.setPlayerSpawn({
                pos: new Vector(playerSpawn.pos.x, playerSpawn.pos.y),
                direction: playerSpawn.direction
            });
        });
        (obj.itemSpawners ?? []).forEach((spawner: any) => {
            if (!spawner?.pos) {
                return;
            }
            map.setItemSpawner({
                ...spawner,
                pos: new Vector(spawner.pos.x, spawner.pos.y)
            });
        });
        if (obj.background) {
            map.setBackground(obj.background);
        }
        return map;
    }

}

export { GameMap };