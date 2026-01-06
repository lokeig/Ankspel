import { Countdown, Utility, Vector } from "@common";
import { DynamicObject } from "@core";
import { Render } from "@render";
import { BulletTrail } from "./Trails/bulletTrail";
import { IProjectile } from "@projectile";

abstract class Bullet implements IProjectile {
    private angle!: number;
    public getBody()!: DynamicObject;
    private lifespan!: Countdown;
    public trail!: BulletTrail;
    private delete: boolean = false;

    constructor(pos: Vector, angle: number, speed: number, lifespan: number) {
        const velocity = Utility.Angle.rotateForce(new Vector(speed, 0), angle);
        const size = 2;
        this.getBody() = new DynamicObject(pos.clone(), size, size);
        this.lifespan = new Countdown(lifespan);

        this.angle = Math.atan2(velocity.y, velocity.x);
        this.getBody().velocity = velocity.clone();
        this.getBody().ignoreGravity = true;
        this.getBody().ignoreFriction = true;

        const trailLength = 100;
        const trailPos = pos.clone().add(size / 2);
        this.trail = new BulletTrail(trailPos, velocity.clone(), trailLength, size);
        this.trail.setTarget(trailPos);
    }

    public getTrail(): BulletTrail {
        return this.trail;
    }

    public update(deltaTime: number): void {
        this.getBody().update(deltaTime);
        if (this.getBody().collided()) {
            this.delete = true;
        }
        this.lifespan.update(deltaTime);
    }

    public shouldBeDeleted(): boolean {
        return this.delete || this.lifespan.isDone();
    }

    public draw(): void {
        Render.get().drawSquare({ x: this.getBody().pos.x, y: this.getBody().pos.y, width: this.getBody().width, height: this.getBody().height }, this.angle, "red");
    }
}

export { Bullet };
