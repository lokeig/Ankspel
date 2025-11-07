import { SpriteSheet, images, Countdown, Vector, Utility } from "@common";
import { ExplosiveInterface, ItemLogic, ItemType } from "@game/Item";
import { ParticleManager } from "@game/Particles";
import { ExplosionVFX } from "@impl/Particles";
import { ProjectileManager } from "@game/Projectile";
import { Bullet } from "@impl/Projectiles";

class Grenade implements ExplosiveInterface {
    public common: ItemLogic;
    private spriteSheet: SpriteSheet;
    private drawSize: number = 32;
    private setToDelete: boolean = false;

    private explosionDelay = new Countdown(2);
    private activated: boolean = false;

    constructor(pos: Vector) {
        const spriteInfo = Utility.File.getImage(images.grenade);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
        const width = 6;
        const height = 19;
        this.common = new ItemLogic(pos, width, height, ItemType.explosive);
        this.common.body.bounceFactor = 0.3;

        this.common.holdOffset = { x: 12, y: -6 }
        this.common.setHitboxOffset({ x: 30, y: 30 });
    }

    update(deltaTime: number): void {
        if (this.activated) {
            this.explosionDelay.update(deltaTime);
        }
        this.common.update(deltaTime);

        if (this.explosionDelay.isDone()) {

            ParticleManager.addParticle(new ExplosionVFX(this.common.body.getCenter()));
            this.setToDelete = true;

            const amountOfBullets = 16;
            for (let i = 0; i < amountOfBullets; i++) {
                const angle = i * 2 * Math.PI / amountOfBullets;
                const speed = Utility.Angle.rotateForce({ x: 2000, y: 0 }, angle)
                const lifespan = 0.06;
                const pos = this.common.body.pos;
                ProjectileManager.addProjectile(new Bullet({ ...pos }, speed, lifespan));
            }
        }
    }

    activate(): void {
        this.activated = true;
    }

    draw(): void {
        const col = this.activated ? 1 : 0;
        this.spriteSheet.draw(0, col, this.common.getDrawpos(this.drawSize), this.drawSize, this.common.isFlip(), this.common.angle)
    }

    shouldBeDeleted(): boolean {
        return this.setToDelete;
    }
}

export { Grenade };