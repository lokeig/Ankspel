import { SpriteSheet, images, Countdown, Vector, Utility, Frame, ItemInteractionInput } from "@common";
import { ParticleManager } from "@game/Particles";
import { ExplosionVFX } from "@impl/Particles";
import { ProjectileManager } from "@game/Projectile";
import { Item } from "./item";

class Grenade extends Item {
    private spriteSheet: SpriteSheet;
    private drawSize: number = 32;
    private frames = { pinned: new Frame(), default: new Frame() };
    private explosionDelay = new Countdown(2);
    private activated: boolean = false;

    constructor(pos: Vector) {
        const width = 8;
        const height = 19;
        super(pos, width, height);

        const spriteInfo = Utility.File.getImage(images.grenade);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
        Utility.File.setFrames("grenade", this.frames);
        
        this.holdOffset = new Vector(11, -6)
        this.body.bounceFactor = 0.3;

        this.interactions.on(ItemInteractionInput.Activate, (seed: number) => {
            this.activate();
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
                ProjectileManager.create("grenadeBullet", pos, angle);
            }
        }
    }

    private activate(): void {
        this.activated = true;
    }

    public draw(): void {
        const frame = this.activated ? this.frames.pinned : this.frames.default;
        this.spriteSheet.draw(frame, this.getDrawPos(this.drawSize), this.drawSize, this.body.isFlip(), this.angle())
    }
}

export { Grenade };