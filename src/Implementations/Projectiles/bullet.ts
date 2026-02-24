import { Vector } from "@math";
import { AxisDirection, Countdown, Grid, ProjectileEffect, Utility } from "@common";
import { CollisionObject, GameObject } from "@core";
import { BulletTrail } from "./Trails/bulletTrail";
import { IProjectile } from "@projectile";
import { TileManager } from "@game/StaticObjects/Tiles";
import { ParticleManager } from "@game/Particles";
import { BulletReboundVFX } from "@impl/Particles";

class Bullet implements IProjectile {
    private pos: Vector;
    private angle: number;
    private velocity: Vector;
    
    private local: boolean = false;
    private lifespan!: Countdown;
    private delete: boolean = false;
    public trail!: BulletTrail;

    private prevPos: Vector;
    private minDistance: number = Infinity;

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

    public update(deltaTime: number): void {
        this.prevPos = this.pos.clone();
        this.pos.add(this.velocity.clone().multiply(deltaTime));

        this.lifespan.update(deltaTime);

        const nearbyTiles = TileManager.getNearby(this.prevPos, 0, 0, this.pos);
        const status = this.getClosestCollidingTile(nearbyTiles);
        if (status) {
            const [tile, pos] = status;
            this.minDistance = pos.distanceToSquared(this.prevPos);
            this.pos = pos.clone();
            const axisDirection = this.getAxis(pos, tile);

            ParticleManager.addParticle(new BulletReboundVFX(this.pos.clone(), this.angle, axisDirection));
            this.setToDelete();
        }
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

    private getClosestCollidingTile(tiles: CollisionObject[]): [GameObject, Vector] | null {
        const colliding: [GameObject, Vector][] = [];
        tiles.forEach(tile => {
            if (tile.platform) {
                return;
            }
            const status = this.collision(tile.gameObject);
            if (status.collision) {
                colliding.push([tile.gameObject, status.pos]);
            }
        });

        let closest: [GameObject, Vector] | null = null;
        let minDistance: number = Infinity;
        colliding.forEach(([tile, pos]) => {
            const distance = pos.distanceToSquared(this.prevPos);
            if (distance < minDistance) {
                closest = [tile, pos];
                minDistance = distance;
            }
        });
        return closest;
    }

    private collision(block: GameObject): { collision: boolean; pos: Vector } {
        const start = this.prevPos;
        const end = this.pos;
        return block.lineCollision(start, end);
    }

    public wentThrough(block: GameObject): { collision: boolean; pos: Vector } {
        const status = this.collision(block);
        if (status.collision && status.pos.distanceToSquared(this.prevPos) < this.minDistance) {
            this.pos = status.pos.clone();
            return { collision: true, pos: status.pos };
        }
        return { collision: false, pos: status.pos };
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
        return ProjectileEffect.Damage;
    }

    public draw(): void {

    }
}

export { Bullet };
