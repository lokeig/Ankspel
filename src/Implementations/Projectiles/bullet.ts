import { Vector } from "@math";
import { AxisDirection, Countdown, Grid, ProjectileEffectType, Utility } from "@common";
import { GameObject } from "@core";
import { BulletTrail } from "./Trails/bulletTrail";
import { IProjectile, ProjectileTarget } from "@projectile";
import { ParticleManager } from "@game/Particles";
import { BulletReboundVFX } from "@impl/Particles";
import { TileManager } from "@game/StaticObjects/Tiles";

type BulletHit =
    | { type: "tile"; tile: GameObject; pos: Vector; resistance: number }
    | { type: "target"; target: ProjectileTarget; pos: Vector; resistance: number };

class Bullet implements IProjectile {
    private pos: Vector;
    private angle: number;
    private velocity: Vector;
    private prevPos: Vector;

    private local: boolean = false;
    private lifespan!: Countdown;
    private delete: boolean = false;
    public trail!: BulletTrail;

    constructor(pos: Vector, angle: number, speed: number, blockRange: number) {
        const lifespan = blockRange * Grid.size / speed;
        const velocity = Utility.Angle.rotateForce(new Vector(speed, 0), angle);
        const size = 2;
        this.lifespan = new Countdown(lifespan);

        this.pos = pos.clone();
        this.prevPos = pos.clone();
        this.velocity = velocity;
        this.angle = Math.atan2(velocity.y, velocity.x);

        const trailPos = pos.clone().add(size / 2);
        this.trail = new BulletTrail(trailPos, velocity.clone(), 200, size);
        this.trail.setTarget(trailPos);
    }

    public getTrail(): BulletTrail {
        return this.trail;
    }

    public update(deltaTime: number, collidable: ProjectileTarget[]): void {
        this.prevPos = this.pos.clone();
        this.pos.add(this.velocity.clone().multiply(deltaTime));
        this.lifespan.update(deltaTime);

        const tiles = this.getTileHits();
        const targets = this.getTargetHits(collidable);

        const allHits = [...tiles, ...targets];
        allHits.sort((a, b) => {
            const aDistance = a.pos.distanceToSquared(this.prevPos);
            const bDistance = b.pos.distanceToSquared(this.prevPos);
            return aDistance - bDistance;
        })

        for (const hit of allHits) {
            this.resolveHit(hit);
            if (this.delete) {
                break;
            }
        }
    }

    private resolveHit(hit: BulletHit): void {
        if (hit.type === "target") {
            if (!hit.target.enabled()) {
                return;
            }
            const knockback = this.velocity.clone().divide(10);
            hit.target.onProjectileHit([{ type: ProjectileEffectType.Damage }, { type: ProjectileEffectType.Knockback, amount: knockback }], hit.pos, this.local);
        } else {
            ParticleManager.addParticle(new BulletReboundVFX(hit.pos, this.angle, this.getAxis(hit.pos, hit.tile)));
        }
        if (hit.resistance < 2) {
            return;
        }
        this.pos = hit.pos.clone();
        this.setToDelete();
    }

    private getAxis(pos: Vector, tile: GameObject): AxisDirection {
        if (pos.y === tile.pos.y) {
            return AxisDirection.Up;
        }
        if (pos.x === tile.pos.x) {
            return AxisDirection.Left;
        }
        if (pos.y === tile.pos.y + tile.height) {
            return AxisDirection.Down;
        }
        return AxisDirection.Right;
    }

    private getTileHits(): BulletHit[] {
        const hits: BulletHit[] = [];
        const tiles = TileManager.getNearby(this.prevPos, 0, 0, this.pos);

        tiles.forEach(tile => {
            const result = this.collision(tile.body);
            if (!result.collision) {
                return;
            }
            hits.push({ type: "tile", tile: tile.body, pos: result.pos, resistance: 999 });
        });
        return hits;
    }

    private getTargetHits(targets: ProjectileTarget[]): BulletHit[] {
        const hits: BulletHit[] = [];

        targets.forEach(target => {
            const result = this.collision(target.body);
            if (!result.collision) {
                return;
            };
            hits.push({ type: "target", target, pos: result.pos, resistance: target.penetrationResistance });
        });
        return hits;
    }

    private collision(block: GameObject): { collision: boolean; pos: Vector } {
        const start = this.prevPos;
        const end = this.pos;
        return block.lineCollision(start, end);
    }

    public getPos(): Vector {
        return this.pos;
    }

    public setPos(pos: Vector): void {
        this.pos = pos;
    }

    public setToDelete(): void {
        this.delete = true;
    }

    public shouldBeDeleted(): boolean {
        return this.delete || this.lifespan.isDone();
    }

    public isLocal(): boolean {
        return this.local;
    }

    public setLocal(): void {
        this.local = true;
    }

    public draw(): void {

    }
}

export { Bullet };
