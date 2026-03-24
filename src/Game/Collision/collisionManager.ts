import { Vector } from "@math";
import { CollisionObject } from "./collisionObject";
import { Side } from "@common";
import { TileManager } from "@game/Tiles";
import { GameObject } from "@core";

class CollisionManager {
    private static dynamic: Set<CollisionObject> = new Set();

    public static clear(): void {
        this.dynamic = new Set();
    }

    // public static updateDynamicPositions() {
    //     Grid.updateMapPositions<CollisionObject>(this.dynamic, e => e.body.pos);
    // }

    public static getNearby(pos: Vector, width: number, height: number, nextPos: Vector = pos): CollisionObject[] {
        // const accumulate = (gridPos: Vector): void => {
        //     const collidableSet = this.getDynamic(gridPos);
        //     if (!collidableSet) {
        //         return;
        //     }
        //     collidableSet.forEach(collidable => {
        //         result.push(collidable);
        //     });
        // }

        // Grid.forNearby(pos, nextPos, width, height, accumulate);
        const collisionTiles: CollisionObject[] = [];
        const tiles = TileManager.getNearby(pos, width, height, nextPos);

        tiles.forEach(tile => {
            const body = tile.body;
            collisionTiles.push({ body, platform: body.isPlatform() });
            if (tile.body.getLip(Side.Left)) {
                const lipLeft = new GameObject(body.pos.clone(), body.getLipWidth(), body.height);
                lipLeft.pos.x -= body.getLipWidth();
                collisionTiles.push({ body: lipLeft, platform: true });
            }
            if (tile.body.getLip(Side.Right)) {
                const lipRight = new GameObject(body.pos.clone(), body.getLipWidth(), body.height);
                lipRight.pos.x += body.width;
                collisionTiles.push({ body: lipRight, platform: true });
            }
        })

        const together = [...collisionTiles, ...this.dynamic];
        return together;
    }

    // private static getDynamic(pos: Vector): Set<CollisionObject> | undefined {
    //     return this.dynamic.get(Grid.key(pos));
    // }

    public static addCollidable(object: CollisionObject): void {
        // const pos = Grid.key(Grid.getGridPos(object.body.pos))
        // const set = this.dynamic.get(pos);
        // if (!set) {
        //     this.dynamic.set(pos, new Set());
        // }
        // this.dynamic.get(pos)!.add(object);
        this.dynamic.add(object);
    }

    public static removeCollidable(object: CollisionObject): void {
        this.dynamic.delete(object);
    }
}

export { CollisionManager };