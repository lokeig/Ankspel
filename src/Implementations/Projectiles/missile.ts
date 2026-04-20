import { Vector } from "@math";
import { Countdown, ProjectileEffectType, Side, SpriteSheet, Utility } from "@common";
import { DynamicObject } from "@core";
import { IProjectile, ProjectileTarget } from "@projectile";
import { Images, zIndex } from "@render";
import { ParticleManager } from "@game/Particles";
import { ExplosionVFX } from "@impl/Particles";

class Missile implements IProjectile {
    private body: DynamicObject;
    private angle: number;
    private static sprite = new SpriteSheet(Images.missile);

    private local: boolean = false;
    private delete: boolean = false;
    private deleteTimer = new Countdown(0.25);

    constructor(pos: Vector, angle: number) {
        const speed = 800;
        const size = 20;
        this.body = new DynamicObject(pos.subtract(size / 2), size, size);

        const velocity = Utility.Angle.rotateForce(new Vector(speed, 0), angle);

        this.body.velocity = velocity;
        this.angle = Math.atan2(velocity.y, velocity.x);

        this.body.ignoreFriction = true;
        this.body.ignoreGravity = true;

        this.body.onHeadCollision = () => this.setToDelete();
        this.body.onBottomCollision = () => this.setToDelete();
        this.body.onSideCollision = () => this.setToDelete();
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
            collisionObject.onProjectileHit(
                [
                    { type: ProjectileEffectType.Damage },
                    { type: ProjectileEffectType.Knockback, amount: this.body.velocity.clone().multiply(1) }
                ],
                this.body.pos,
                this.local
            );
            this.setToDelete();
            break;
        }
        if (this.body.velocity.y !== 0 || this.body.velocity.x !== 0) {
            this.angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
            this.deleteTimer.reset();
        } else {
            this.deleteTimer.update(deltaTime);
            if (this.deleteTimer.isDone()) {
                this.setToDelete();
            }
        }
    }


    public getSegment(): { start: Vector; end: Vector; } {
        return { start: this.body.pos, end: this.body.pos.add(new Vector(this.body.width, this.body.height)) };
    }

    public setToDelete(): void {
        ParticleManager.addParticle(new ExplosionVFX(this.body.getCenter()));
        this.delete = true;
    }

    public shouldBeDeleted(): boolean {
        return this.delete;
    }

    public setLocal(): void {
        this.local = true;
    }

    public draw(): void {
        const drawSize = new Vector(28, 16);
        const drawPos = new Vector(
            this.body.pos.x + ((this.body.width - drawSize.x) / 2),
            this.body.pos.y + ((this.body.height - drawSize.y) / 2)
        );
        Missile.sprite.draw(drawPos, drawSize, false, this.angle, zIndex.Projectiles);
    }
}

export { Missile };
