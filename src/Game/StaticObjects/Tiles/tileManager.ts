import { Vector, Grid, Utility, Direction, Side } from "@common";
import { CollisionObject, GameObject } from "@core";
import { TileInterface } from "./tileInterface";

class TileManager {

    private static tiles = new Map<string, TileInterface>();

    public static clear(): void {
        this.tiles = new Map;
    }

    public static getTile(gridPos: Vector): TileInterface | undefined {
        return this.tiles.get(Grid.key(gridPos));
    }

    public static setTile(gridPos: Vector, tile: TileInterface) {
        this.tiles.set(Grid.key(gridPos), tile);

        this.setNeighbours(tile);
        tile.update();

        for (const direction of tile.body.getNeighbours()) {
            const neighbourTile = this.getTile(this.shift(gridPos, direction));
            neighbourTile!.body.setNeighbour(Utility.Direction.getReverseDirection(direction));
            neighbourTile!.update();
        }
    }

    public static getNearbyTiles(pos: Vector, width: number, height: number): CollisionObject[] {
        const result: CollisionObject[] = [];

        const startX = pos.x - Grid.size * 2;
        const endX = pos.x + width + Grid.size * 2;
        const startY = pos.y - Grid.size * 2;
        const endY = pos.y + height + Grid.size * 2;

        for (let x = startX; x < endX; x += Grid.size) {
            for (let y = startY; y < endY; y += Grid.size) {
                const gridPos = Grid.getGridPos({ x, y });

                this.processTile(gridPos, result);
            }
        }

        return result;
    }

    private static processTile(gridPos: Vector, accumulatedCollidable: Array<CollisionObject>): void {

        const tile = this.getTile(gridPos);
        if (!tile) {
            return;
        }
        const tileObj = tile.body;

        accumulatedCollidable.push({ gameObject: tileObj, platform: tileObj.isPlatform() });

        if (tile.body.getLip(Side.left)) {
            const lipLeft = new GameObject({...tileObj.pos}, tileObj.getLipWidth(), tileObj.height);
            lipLeft.pos.x -= tileObj.getLipWidth();
            accumulatedCollidable.push({ gameObject: lipLeft, platform: true });
        }

        if (tile.body.getLip(Side.right)) {
            const lipRight = new GameObject({...tileObj.pos}, tileObj.getLipWidth(), tileObj.height);
            lipRight.pos.x += tileObj.width;
            accumulatedCollidable.push({ gameObject: lipRight, platform: true });
        }
    }

    private static tilesMatch(a: TileInterface, b: TileInterface): boolean {
        return a.constructor === b.constructor;
    }

    private static shift(gridPos: Vector, direction: Direction): Vector {
        switch (direction) {
            case Direction.left: return { x: gridPos.x - 1, y: gridPos.y };
            case Direction.right: return { x: gridPos.x + 1, y: gridPos.y };
            case Direction.top: return { x: gridPos.x, y: gridPos.y - 1 };
            case Direction.bot: return { x: gridPos.x, y: gridPos.y + 1 };
            case Direction.topLeft: return { x: gridPos.x - 1, y: gridPos.y - 1 };
            case Direction.topRight: return { x: gridPos.x + 1, y: gridPos.y - 1 };
            case Direction.botLeft: return { x: gridPos.x - 1, y: gridPos.y + 1 };
            case Direction.botRight: return { x: gridPos.x + 1, y: gridPos.y + 1 };
        }
    }

    private static setNeighbours(tile: TileInterface): void {
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

    static draw() {
        for (const tile of this.tiles.values()) {
            tile.draw();
        }
    }
}

export { TileManager };