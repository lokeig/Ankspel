import { Vector } from "@math";
import { SpriteSheet, Countdown, Utility, Frame, ItemInteraction, SeededRNG } from "@common";
import { ParticleManager } from "@game/Particles";
import { ExplosionVFX } from "@impl/Particles";
import { ProjectileManager } from "@game/Projectile";
import { Item } from "./item";
import { Bullet } from "@impl/Projectiles";
import { Images } from "@render";
import { AudioManager, Sound } from "@game/Audio";

class Grenade extends Item {
    private static spriteSheet: SpriteSheet;
    private static frames = { pinned: new Frame(), default: new Frame() };

    private firstBeep: boolean = false;
    private secondBeep: boolean = false;

    private explosionDelay = new Countdown(2);
    private activated: boolean = false;
    private locallyActivated!: boolean;

    private rng!: SeededRNG;

    static {
        this.spriteSheet = new SpriteSheet(Images.grenade);
        Utility.File.setFrames("grenade", this.frames);
    }

    constructor(pos: Vector, id: number) {
        const width = 8;
        const height = 19;
        super(pos, width, height, id);


        this.holdOffset = new Vector(11, -6)
        this.body.bounceFactor = 0.3;

        this.useInteractions.set(ItemInteraction.Activate, (seed: number, local: boolean) => {
            this.activate(seed);
            this.locallyActivated = local;
            return [];
        });
    }

    public update(deltaTime: number): void {
        if (this.activated) {
            this.explodingUpdate(deltaTime);
        }
        super.update(deltaTime);

        if (this.explosionDelay.isDone()) {
            this.explode();
        }
    }

    private explodingUpdate(deltaTime: number): void {
        this.explosionDelay.update(deltaTime);
        if (!this.firstBeep && this.explosionDelay.getPercentageReady() > 1 / 3) {
            this.firstBeep = true;
            AudioManager.get().play(Sound.beep);
        }
        if (!this.secondBeep && this.explosionDelay.getPercentageReady() > 2 / 3) {
            this.secondBeep = true;
            AudioManager.get().play(Sound.beep);
        }
    }

    private explode(): void {
        ParticleManager.addParticle(new ExplosionVFX(this.body.getCenter()));
        this.setToDelete();

        const amountOfBullets = 24;
        for (let i = 0; i < amountOfBullets; i++) {
            const angleRandomness = Math.PI / 24;
            let angle = i * 2 * Math.PI / amountOfBullets;
            angle -= this.rng.getInRange(-angleRandomness, angleRandomness);

            const pos = this.body.pos;
            const bullet = new Bullet(pos, angle, 3400, 7);

            ProjectileManager.addProjectile(bullet, this.locallyActivated);
        }
        AudioManager.get().play(Sound.explode);
    }

    private activate(seed: number): void {
        if (this.activated) {
            return;
        }
        this.rng = new SeededRNG(seed);
        AudioManager.get().play(Sound.pullPin);
        this.activated = true;
    }

    public draw(): void {
        const drawSize = 32;
        const frame = this.activated ? Grenade.frames.pinned : Grenade.frames.default;
        Grenade.spriteSheet.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), frame)
    }
}

export { Grenade };