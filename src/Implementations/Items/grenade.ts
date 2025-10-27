import { SpriteSheet, images, Countdown, Vector, Utility } from "@common";
import { ExplosiveInterface, ItemLogic, ItemType } from "@game/Item";
import { ParticleManager } from "@game/Particles";
import { ExplosionVFX } from "@impl/Particles";
import { ProjectileManager } from "@game/Projectile";
import { Bullet } from "@impl/Projectiles";

class Grenade implements ExplosiveInterface {
    public itemLogic: ItemLogic;
    private spriteSheet = new SpriteSheet(images.grenade, 16, 16);
    private drawSize: number = 32;
    private setToDelete: boolean = false;

    private explosionDelay = new Countdown(2);
    private activated: boolean = false;    

    constructor(pos: Vector) {
        const width = 6;
        const height = 19;
        this.itemLogic = new ItemLogic(pos, width, height, ItemType.explosive);
        this.itemLogic.dynamicObject.bounceFactor = 0.3;

        this.itemLogic.holdOffset = { x: 12, y: -6 }
        this.itemLogic.setHitboxOffset({ x: 30, y: 30 });
    }

    update(deltaTime: number): void {
        if (this.activated) {
            this.explosionDelay.update(deltaTime); 
        }
        this.itemLogic.update(deltaTime);

        if (this.explosionDelay.isDone()) {

            ParticleManager.addParticle(new ExplosionVFX(this.itemLogic.dynamicObject.getCenter()));
            this.setToDelete = true;

            const amountOfBullets = 16;
            for (let i = 0; i < amountOfBullets; i++) {
                const angle = i * 2 * Math.PI / amountOfBullets;
                const speed = Utility.Angle.rotateForce({ x: 2000, y: 0 }, angle)
                const lifespan = 0.06;
                const pos = this.itemLogic.dynamicObject.pos;
                ProjectileManager.addProjectile(new Bullet({ ...pos }, speed, lifespan));
            }
        }
    }

    activate(): void {
        this.activated = true;
    }

    draw(): void {
        const col = this.activated ? 1 : 0;
        this.spriteSheet.draw(0, col, this.itemLogic.getDrawpos(this.drawSize), this.drawSize, this.itemLogic.isFlip(), this.itemLogic.angle)
    }

    shouldBeDeleted(): boolean {
        return this.setToDelete;
    }
}

export { Grenade };