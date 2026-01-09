import { Countdown, Utility, Vector } from "@common";
import { DynamicObject } from "@core";
import { Render } from "@render";
import { BulletTrail } from "./Trails/bulletTrail";
import { IProjectile, ProjectileEffect } from "@projectile";

abstract class Bullet implements IProjectile {
    private angle!: number;
    private body!: DynamicObject;
    private lifespan!: Countdown;
    public trail!: BulletTrail;
    private delete: boolean = false;
    private local: boolean = false;

    constructor(pos: Vector, angle: number, speed: number, lifespan: number) {
        const velocity = Utility.Angle.rotateForce(new Vector(speed, 0), angle);
        const size = 2;
        this.body = new DynamicObject(pos.clone(), size, size);
        this.lifespan = new Countdown(lifespan);

        this.angle = Math.atan2(velocity.y, velocity.x);
        this.body.velocity = velocity.clone();
        this.body.ignoreGravity = true;
        this.body.ignoreFriction = true;

        const trailLength = 100;
        const trailPos = pos.clone().add(size / 2);
        this.trail = new BulletTrail(trailPos, velocity.clone(), trailLength, size);
        this.trail.setTarget(trailPos);
    }

    public getTrail(): BulletTrail {
        return this.trail;
    }

    public update(deltaTime: number): void {
        this.body.update(deltaTime);
        if (this.body.collided()) {
            this.delete = true;
        }
        this.lifespan.update(deltaTime);
    }

    public getBody(): DynamicObject {
        return this.body;
    }

    public onCollision(): void {
        return;
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
        Render.get().drawSquare({
            x: this.body.pos.x,
            y: this.body.pos.y,
            width: this.body.width,
            height: this.body.height
        }, this.angle, "red");
    }
}

export { Bullet };
