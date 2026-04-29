import { Vector } from "@math";
import { Countdown, Grid, ProjectileEffectType, Side, SpriteSheet, Utility } from "@common";
import { DynamicObject } from "@core";
import { IProjectile, ProjectileManager, ProjectileTarget } from "@projectile";
import { Images, zIndex } from "@render";
import { ParticleManager } from "@game/Particles";
import { ExplosionVFX } from "@impl/Particles";
import { AudioManager, Sound } from "@game/Audio";
import { Bullet } from "./bullet";
import { TileManager } from "@game/Tiles";

class Missile implements IProjectile {
    private body: DynamicObject;
    private angle: number;
    private static sprite = new SpriteSheet(Images.missile);

    private local: boolean = false;
    private delete: boolean = false;

    constructor(pos: Vector, angle: number) {
        const speed = 800;
        const size = 20;
        this.body = new DynamicObject(pos.subtract(size / 2), size, size);

        const velocity = Utility.Angle.rotateForce(new Vector(speed, 0), angle);

        this.body.velocity = velocity;
        this.angle = Math.atan2(velocity.y, velocity.x);

        this.body.ignoreFriction = true;
        this.body.ignoreGravity = true;

        this.body.onHeadCollision = () => this.explode();
        this.body.onBottomCollision = () => this.explode();
        this.body.onSideCollision = () => this.explode();

        AudioManager.get().play(Sound.missile);
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
            this.explode();
            break;
        }
    }

    private explode(): void {
        ParticleManager.addParticle(new ExplosionVFX(this.body.getCenter(), false));
        AudioManager.get().play(Sound.explode);
        const amountOfBullets = 24;
        for (let i = 0; i < amountOfBullets; i++) {
            let angle = i * 2 * Math.PI / amountOfBullets;

            const pos = this.body.pos;
            const bullet = new Bullet(pos, angle, 3400, 3);

            ProjectileManager.addProjectile(bullet, this.local);
        }
        const radius = 2;
        TileManager.deleteArea(Grid.getGridPos(this.body.getCenter()), radius);

        this.setToDelete();
    }

    public getSegment(): { start: Vector; end: Vector; } {
        return { start: this.body.pos, end: this.body.pos.add(new Vector(this.body.width, this.body.height)) };
    }

    public setToDelete(): void {
        ParticleManager.addParticle(new ExplosionVFX(this.body.getCenter(), false));
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
