import { Vector } from "@math";
import { SpriteSheet, images, Countdown, Utility, Frame, ItemInteraction } from "@common";
import { ParticleManager } from "@game/Particles";
import { ExplosionVFX } from "@impl/Particles";
import { ProjectileManager } from "@game/Projectile";
import { Item } from "./item";
import { Bullet } from "@impl/Projectiles";

class Grenade extends Item {
    private static spriteSheet: SpriteSheet;
    private static frames = { pinned: new Frame(), default: new Frame() };

    private explosionDelay = new Countdown(2);
    private activated: boolean = false;
    private locallyActivated!: boolean;

    static {
        const spriteInfo = Utility.File.getImage(images.grenade);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
        Utility.File.setFrames("grenade", this.frames);
    }

    constructor(pos: Vector) {
        const width = 8;
        const height = 19;
        super(pos, width, height);


        this.holdOffset = new Vector(11, -6)
        this.body.bounceFactor = 0.3;

        this.useInteractions.set(ItemInteraction.Activate, (seed: number, local: boolean) => {
            this.activate();
            this.locallyActivated = local;
            return [];
        });
    }

    public update(deltaTime: number): void {
        if (this.activated) {
            this.explosionDelay.update(deltaTime);
        }
        super.update(deltaTime);

        if (this.explosionDelay.isDone()) {
            ParticleManager.addParticle(new ExplosionVFX(this.body.getCenter()));
            this.setToDelete();

            const amountOfBullets = 16;
            for (let i = 0; i < amountOfBullets; i++) {
                const angle = i * 2 * Math.PI / amountOfBullets;
                const pos = this.body.pos;
                const bullet = new Bullet(pos, angle, 3400, 7);
                ProjectileManager.addProjectile(bullet, this.locallyActivated);
            }
        }
    }

    private activate(): void {
        this.activated = true;
    }

    public draw(): void {
        const drawSize = 32;
        const frame = this.activated ? Grenade.frames.pinned : Grenade.frames.default;
        Grenade.spriteSheet.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), frame)
    }
}

export { Grenade };