import { Countdown, ProjectileEffect, Utility, Vector } from "@common";
import { GameObject } from "@core";
import { BulletTrail } from "./Trails/bulletTrail";
import { IProjectile } from "@projectile";
import { TileManager } from "@game/StaticObjects/Tiles";

abstract class Bullet implements IProjectile {
    private angle: number;
    private lifespan!: Countdown;
    public trail!: BulletTrail;
    private delete: boolean = false;
    private local: boolean = false;
    private pos: Vector;
    private velocity: Vector;
    private delay: boolean = true;
    constructor(pos: Vector, angle: number, speed: number, lifespan: number) {
        const velocity = Utility.Angle.rotateForce(new Vector(speed, 0), angle);
        const size = 2;
        this.lifespan = new Countdown(lifespan);

        this.pos = pos;
        this.velocity = velocity;
        this.angle = Math.atan2(velocity.y, velocity.x);

        const trailLength = 100;
        const trailPos = pos.clone().add(size / 2);
        this.trail = new BulletTrail(trailPos, velocity.clone(), trailLength, size);
        this.trail.setTarget(trailPos);
    }

    public getTrail(): BulletTrail {
        return this.trail;
    }

    public update(deltaTime: number): void {
        if (this.delay) {
            this.delay = false;
            return;
        }
        const nextPos = this.pos.clone().add(this.velocity.clone().multiply(deltaTime));
        const nearbyTiles = TileManager.getNearbyTiles(this.pos, 1, 1, nextPos);
        nearbyTiles.forEach(tile => {
            if (tile.platform && tile.gameObject.pos.y > this.pos.y) {
                return;
            }
            const collisionStatus = this.willGoThrough(tile.gameObject, deltaTime);
            if (collisionStatus.collision) {
                this.setToDelete();
            }
        });
        this.pos = nextPos;

        this.lifespan.update(deltaTime);
    }

    public willGoThrough(block: GameObject, deltaTime: number): { collision: boolean; pos: Vector } {
        const start = this.pos;
        const end = start.clone().add(this.velocity.clone().multiply(deltaTime));

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

    public onPlayerHit(): ProjectileEffect {
        this.setToDelete();
        return ProjectileEffect.Damage;
    }

    public draw(): void {

    }
}

export { Bullet };
