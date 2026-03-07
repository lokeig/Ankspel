import { Vector } from "@math";
import { Grid, Utility, Direction, Side } from "@common";
import { CollisionObject, GameObject } from "@core";
import { ITile, TileConstructor } from "./ITile";

class TileManager {
    private static tiles = new Map<string, ITile>();
    private static register = new Map<string, TileConstructor>();

    public static clear(): void {
        this.tiles = new Map;
    }

    private static getTile(gridPos: Vector): ITile | undefined {
        return this.tiles.get(Grid.key(gridPos));
    }

    public static setTile(name: string, gridPos: Vector): void {
        const tileConstructor = this.register.get(name);
        if (!tileConstructor) {
            console.error("Tried to add non registered tile: ", name);
            return;
        }
        const tile = new tileConstructor(Grid.getWorldPos(gridPos), Grid.size);
        this.tiles.set(Grid.key(gridPos), tile);

        this.setNeighbours(tile);
        tile.update();

        for (const direction of tile.body.getNeighbours()) {
            const neighbourTile = this.getTile(this.shift(gridPos, direction));
            neighbourTile!.body.setNeighbour(Utility.Direction.getReverseDirection(direction));
            neighbourTile!.update();
        }
    }

    public static getNearby(pos: Vector, width: number, height: number, nextPos: Vector = pos): CollisionObject[] {
        const result: CollisionObject[] = [];

        const accumulate = (gridPos: Vector) => {
            const tile = this.getTile(gridPos);
            if (!tile) {
                return;
            }
            const tileObj = tile.body;

            result.push({ body: tileObj, platform: tileObj.isPlatform() });

            if (tile.body.getLip(Side.Left)) {
                const lipLeft = new GameObject(tileObj.pos.clone(), tileObj.getLipWidth(), tileObj.height);
                lipLeft.pos.x -= tileObj.getLipWidth();
                result.push({ body: lipLeft, platform: true });
            }
            if (tile.body.getLip(Side.Right)) {
                const lipRight = new GameObject(tileObj.pos.clone(), tileObj.getLipWidth(), tileObj.height);
                lipRight.pos.x += tileObj.width;
                result.push({ body: lipRight, platform: true });
            }
        };

        Grid.forNearby(pos, nextPos, width, height, accumulate);
        return result;
    }

    public static getTiles(): ITile[] {
        return Array.from(this.tiles.values());
    }

    private static tilesMatch(a: ITile, b: ITile): boolean {
        return a.constructor === b.constructor;
    }

    private static shift(gridPos: Vector, direction: Direction): Vector {
        switch (direction) {
            case Direction.Left: return new Vector(gridPos.x - 1, gridPos.y);
            case Direction.Right: return new Vector(gridPos.x + 1, gridPos.y);
            case Direction.Up: return new Vector(gridPos.x, gridPos.y - 1);
            case Direction.Down: return new Vector(gridPos.x, gridPos.y + 1);
            case Direction.UpLeft: return new Vector(gridPos.x - 1, gridPos.y - 1);
            case Direction.UpRight: return new Vector(gridPos.x + 1, gridPos.y - 1);
            case Direction.DownLeft: return new Vector(gridPos.x - 1, gridPos.y + 1);
            case Direction.DownRight: return new Vector(gridPos.x + 1, gridPos.y + 1);
        }
    }

    private static setNeighbours(tile: ITile): void {
        const gridPos = Grid.getGridPos(tile.body.pos);

        for (const key of Object.values(Direction)) {
            const neighbourTile = this.tiles.get(Grid.key(this.shift(gridPos, key)));
            if (neighbourTile && this.tilesMatch(tile, neighbourTile)) {
                tile.body.setNeighbour(key);
            } else {
                tile.body.removeNeighbour(key);
            }
        }
    }

    public static registerTile(name: string, tile: TileConstructor): void {
        this.register.set(name, tile);
    }

    public static draw(): void {
        for (const tile of this.tiles.values()) {
            tile.draw();
        }
    }
}

export { TileManager };