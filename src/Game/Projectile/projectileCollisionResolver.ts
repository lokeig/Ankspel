import { GameObject } from "@core";
import { ProjectileTarget } from "./IProjectile";
import { Vector } from "@math";
import { TileManager } from "@game/Tiles";

type BulletHit =
    | { type: "tile"; tile: GameObject; pos: Vector; resistance: number }
    | { type: "target"; target: ProjectileTarget; pos: Vector; resistance: number };

class ProjectileCollisionResolver {

    public static getCollisions(segment: { start: Vector, end: Vector }, targets: ProjectileTarget[]): BulletHit[] {
        const tileHits = this.getTileHits(segment);
        const targetHits = this.getTargetHits(segment, targets);

        const allHits = [...tileHits, ...targetHits];

        allHits.sort((a, b) =>
            a.pos.distanceToSquared(segment.start) - b.pos.distanceToSquared(segment.start)
        );

        return allHits;
    }

    private static getTileHits(segment: { start: Vector, end: Vector }): BulletHit[] {
        const hits: BulletHit[] = [];
        const tiles = TileManager.getNearby(segment.start, 0, 0, segment.end);

        tiles.forEach(tile => {
            if (tile.platform) {
                return;
            }
            const result = this.collision(segment, tile.body);
            if (!result.collision) {
                return;
            }
            hits.push({ type: "tile", tile: tile.body, pos: result.pos, resistance: 999 });
        });
        return hits;
    }

    private static getTargetHits(segment: { start: Vector, end: Vector }, targets: ProjectileTarget[]): BulletHit[] {
        const hits: BulletHit[] = [];

        targets.forEach(target => {
            const result = this.collision(segment, target.body());
            if (!result.collision) {
                return;
            };
            hits.push({ type: "target", target, pos: result.pos, resistance: target.penetrationResistance() });
        });
        return hits;
    }

    private static collision(segment: { start: Vector, end: Vector }, block: GameObject): { collision: boolean; pos: Vector } {
        return block.lineCollision(segment.start, segment.end);
    }
}

export { ProjectileCollisionResolver };
export type { BulletHit };