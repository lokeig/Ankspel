import { Vector } from "@math";
import { SpriteSheet, Countdown, Frame, ItemInteraction, SeededRNG } from "@common";
import { ParticleManager } from "@game/Particles";
import { ExplosionVFX } from "@impl/Particles";
import { ProjectileManager } from "@game/Projectile";
import { Item } from "./item";
import { Bullet } from "@impl/Projectiles";
import { Images } from "@render";
import { AudioManager, Sound } from "@game/Audio";
import { Connection, GameMessage } from "@server";

class Grenade extends Item {
    private static spriteSheet: SpriteSheet;
    private static frames = { pinned: new Frame(), default: new Frame() };
    private static holdOffset = new Vector(11, -6);
    private static pixelOffset = new Vector(1, -1);
    private explosionDelay = new Countdown(2);

    private activated: boolean = false;

    private locallyActivated!: boolean;
    private rng!: SeededRNG;

    static {
        this.spriteSheet = new SpriteSheet(Images.grenade);

        this.frames.pinned.set(0, 1);
        this.frames.default.set(0, 0);
    }

    constructor(pos: Vector, id: number) {
        const width = 12;
        const height = 19;
        super(pos, width, height, id);

        this.body.bounceFactor = 0.3;

        this.info.holdOffset = Grenade.holdOffset;

        this.playerInteractions.setUse(ItemInteraction.Activate, (seed: number, local: boolean) => {
            this.activate(seed);
            this.locallyActivated = local;
            return [];
        });
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        if (!this.locallyActivated) {
            return;
        }
        this.explosionDelay.update(deltaTime);
        if (this.explosionDelay.isDone()) {
            Connection.get().sendGameMessage(GameMessage.ItemDestroyed, { id: this.info.id });
            this.explode();
        }
    }

    private explode(): void {
        ParticleManager.addParticle(new ExplosionVFX(this.body.getCenter(), true));

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

    public onDestroy(): void {
        this.explode();
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
        const drawPos = this.getDrawPos(drawSize, Grenade.pixelOffset);
        Grenade.spriteSheet.draw(drawPos, drawSize, this.body.isFlip(), this.getAngle(), this.getZIndex(), frame)
    }
}

export { Grenade };