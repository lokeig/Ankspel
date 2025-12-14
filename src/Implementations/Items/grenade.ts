import { SpriteSheet, images, Countdown, Vector, Utility, Frame } from "@common";
import { IExplosive, ItemLogic, ItemType } from "@game/Item";
import { ParticleManager } from "@game/Particles";
import { ExplosionVFX } from "@impl/Particles";
import { ProjectileManager } from "@game/Projectile";
import { Bullet } from "@impl/Projectiles";

class Grenade implements IExplosive {
    public common: ItemLogic;
    private spriteSheet: SpriteSheet;
    private drawSize: number = 32;
    private setToDelete: boolean = false;
    private frames = { pinned: new Frame(), default: new Frame() };
    private explosionDelay = new Countdown(2);
    private activated: boolean = false;

    constructor(pos: Vector) {
        const spriteInfo = Utility.File.getImage(images.grenade);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
        const width = 6;
        const height = 19;
        this.common = new ItemLogic(pos, width, height, ItemType.explosive);
        this.common.body.bounceFactor = 0.3;

        this.common.holdOffset = new Vector(12, -6)
        this.common.setHitboxOffset(new Vector(30, 30));
        Utility.File.setFrames("grenade", this.frames);
    }

    public update(deltaTime: number): void {
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
                const speed = Utility.Angle.rotateForce(new Vector(2000, 0), angle);
                const lifespan = 0.06;
                const pos = this.common.body.pos;
                ProjectileManager.addProjectile(new Bullet(pos.clone(), speed, lifespan));
            }
        }
    }

    public activate(): void {
        this.activated = true;
    }

    public draw(): void {
        const frame = this.activated ? this.frames.pinned : this.frames.default;
        this.spriteSheet.draw(frame, this.common.getDrawPos(this.drawSize), this.drawSize, this.common.isFlip(), this.common.angle)
    }

    public shouldBeDeleted(): boolean {
        return this.setToDelete;
    }
}

export { Grenade };