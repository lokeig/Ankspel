import { Vector } from "@math";
import { ProjectileEffectType, Side, SpriteSheet, Utility } from "@common";
import { DynamicObject } from "@core";
import { IProjectile, ProjectileTarget } from "@projectile";
import { Images, zIndex } from "@render";

class Net implements IProjectile {
    private body: DynamicObject;
    private angle: number;
    private static sprite = new SpriteSheet(Images.net);

    private local: boolean = false;
    private delete: boolean = false;

    constructor(pos: Vector, angle: number, direction: Side) {
        const speed = 800;
        const size = 20;
        this.body = new DynamicObject(pos.subtract(size / 2), size, size);

        const velocity = Utility.Angle.rotateForce(new Vector(speed, 0), angle);
        if (direction === Side.Left) {
            velocity.x *= -1;
        }
        if (velocity.y === 0) {
            velocity.y = -500;
        }

        this.body.velocity = velocity;
        this.angle = Math.atan2(velocity.y, velocity.x);

        this.body.friction = 8;
    }

    public getTrail(): null {
        return null;
    }

    public update(deltaTime: number, collidable: ProjectileTarget[]): void {
        this.body.ignoreFriction = !this.body.grounded;
        this.body.update(deltaTime);

        for (const collisionObject of collidable) {
            if (!collisionObject.enabled()) {
                continue;
            }
            if (!collisionObject.body().collision(this.body)) {
                continue;
            }
            if (collisionObject.penetrationResistance() !== 2) {
                continue;
            }
            collisionObject.onProjectileHit([{ type: ProjectileEffectType.Net, duration: 5 }], this.body.pos, this.local);
            this.setToDelete();
        }
        if (this.body.velocity.y !== 0 || this.body.velocity.x !== 0) {
            this.angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        }
    }

    public getSegment(): { start: Vector; end: Vector; } {
        return { start: this.body.pos, end: this.body.pos.add(new Vector(this.body.width, this.body.height)) };
    }

    public setToDelete(): void {
        this.delete = true;
    }

    public shouldBeDeleted(): boolean {
        return this.delete || (Math.abs(this.body.velocity.x) < 10 && this.body.velocity.y === 0);
    }

    public setLocal(): void {
        this.local = true;
    }

    public draw(): void {
        const drawSize = 32;
        const drawPos = new Vector(
            this.body.pos.x + ((this.body.width - drawSize) / 2),
            this.body.pos.y + ((this.body.height - drawSize) / 2)
        );
        Net.sprite.draw(drawPos, drawSize, false, this.angle, zIndex.Projectiles);
    }
}

export { Net };
