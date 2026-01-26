import { Countdown, Grid, ProjectileEffect, Utility, Vector } from "@common";
import { CollisionObject, GameObject } from "@core";
import { BulletTrail } from "./Trails/bulletTrail";
import { IProjectile } from "@projectile";
import { TileManager } from "@game/StaticObjects/Tiles";
import { ParticleManager } from "@game/Particles";
import { ExplosionVFX } from "@impl/Particles";

abstract class Bullet implements IProjectile {
    private pos: Vector;

    private angle: number;
    private lifespan!: Countdown;
    public trail!: BulletTrail;

    private delete: boolean = false;

    private local: boolean = false;
    private velocity: Vector;

    private prevPos: Vector;

    private minDistance: number = 0;

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
        this.trail = new BulletTrail(trailPos, velocity.clone(), blockRange * Grid.size, size);
        this.trail.setTarget(trailPos);
    }

    public getTrail(): BulletTrail {
        return this.trail;
    }

    public update(deltaTime: number): void {
        this.prevPos = this.pos.clone();
        this.pos.add(this.velocity.clone().multiply(deltaTime));

        this.lifespan.update(deltaTime);

        const nearbyTiles = TileManager.getNearby(this.prevPos, 1, 1);
        const colliding = this.getCollidingPositions(nearbyTiles);

        let closest: Vector | undefined;
        let minDistance = Infinity;

        colliding.forEach(pos => {
            const distance = pos.distanceToSquared(this.prevPos);
            if (distance < minDistance) {
                minDistance = distance;
                closest = pos;
            }
        });
        this.minDistance = minDistance;
        if (closest) {
            this.pos = closest.clone();
            this.setToDelete();
        }
    }

    private getCollidingPositions(tiles: CollisionObject[]): Vector[] {
        const result: Vector[] = [];
        tiles.forEach(tile => {
            if (tile.platform) {
                return;
            }
            const status = this.collision(tile.gameObject);
            if (status.collision) {
                result.push(status.pos);
            }
        });
        return result;
    }

    private collision(block: GameObject): { collision: boolean; pos: Vector } {
        const start = this.prevPos;
        const end = this.pos;
        return block.lineCollision(start, end);
    }

    public wentThrough(block: GameObject): { collision: boolean; pos: Vector } {
        const status = this.collision(block);
        let closer = status.pos.distanceToSquared(this.prevPos) < this.minDistance;
        return { collision: status.collision && closer, pos: status.pos };
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

    public onPlayerHit(): ProjectileEffect {
        this.setToDelete();
        return ProjectileEffect.Damage;
    }

    public draw(): void {

    }
}

export { Bullet };
