import { Vector } from "@math";
import { SpriteSheet, Countdown, ItemInteraction, SeededRNG, Animation, SpriteAnimator, EquipmentSlot, OnItemCollision, Frame, OnItemCollisionType } from "@common";
import { ParticleManager } from "@game/Particles";
import { ExplosionVFX } from "@impl/Particles";
import { ProjectileManager } from "@game/Projectile";
import { Item } from "./item";
import { Bullet } from "@impl/Projectiles";
import { Images, zIndex } from "@render";
import { AudioManager, Sound } from "@game/Audio";
import { OnItemUseType } from "@item";
import { DynamicObject } from "@core";
import { Connection, GameMessage } from "@server";

class Mine extends Item {
    private static baseSprite = new SpriteSheet(Images.mine);
    private static flashSprite = new SpriteSheet(Images.mineFlash);

    private static frames = {
        default: new Frame(0, 0),
        activated: new Frame(0, 1),
        activatedBlink: new Frame(0, 2),
        steppedOn: new Frame(0, 3),
        steppedOnBlink: new Frame(0, 4),
    };
    private static blinkInterval: number = 0.4;
    private static holdOffset = new Vector(11, -6);

    private counter: number = 0;

    private activated: boolean = false;
    private steppedOn: boolean = false;
    private steppableCooldown = new Countdown(0.4);
    private thisFrameCollision: boolean = false;
    private lastFrameCollision: boolean = false;

    private locallyActivated!: boolean;

    constructor(pos: Vector, id: number) {
        const width = 16;
        const height = 16;
        super(pos, width, height, id);

        this.info.holdOffset = Mine.holdOffset;

        this.playerInteractions.setUse(ItemInteraction.Activate, (seed: number, local: boolean) => {
            this.activate(seed);
            this.locallyActivated = local;
            return [{ type: OnItemUseType.Throw, value: EquipmentSlot.Hand }];
        });
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        this.counter += deltaTime;
        if (this.activated) {
            this.steppableCooldown.update(deltaTime);
        }
        if (this.steppedOn && this.lastFrameCollision && !this.thisFrameCollision) {
            Connection.get().sendGameMessage(GameMessage.ItemDestroyed, { id: this.info.id });
            this.explode();
        }
        this.lastFrameCollision = this.thisFrameCollision;
        this.thisFrameCollision = false;
    }

    public onCollision(_deltaTime: number, _body: DynamicObject): OnItemCollision[] {
        if (this.activated) {
            if (!this.steppableCooldown.isDone()) {
                return [];
            }
            this.thisFrameCollision = true;
            if (!this.steppedOn && this.body.grounded) {
                this.steppedOn = true;
                return [{ type: OnItemCollisionType.SteppedOn }];
            }
            return [];
        } else {
            return super.onCollision(_deltaTime, _body);
        }
    }

    public handleCollision(collision: OnItemCollision): void {
        if (!this.activated && !this.steppableCooldown.isDone()) {
            return super.handleCollision(collision);
        }
        if (collision.type === OnItemCollisionType.SteppedOn) {
            AudioManager.get().play(Sound.beep);
            this.steppedOn = true;
        }
    }

    private explode(): void {
        ParticleManager.addParticle(new ExplosionVFX(this.body.getCenter(), true));
        this.setToDelete();

        const amountOfBullets = 10;
        for (let i = 0; i < amountOfBullets; i++) {
            const angle = i * 2 * Math.PI / amountOfBullets;
            const pos = this.body.getCenter();
            const bullet = new Bullet(pos, angle, 3400, 4);

            ProjectileManager.addProjectile(bullet, this.locallyActivated);
        }
        AudioManager.get().play(Sound.explode);
    }

    private activate(_seed: number): void {
        if (this.activated) {
            return;
        }
        AudioManager.get().play(Sound.beep);
        this.angle.landPerfectly = true;
        this.activated = true;
        AudioManager.get().play(Sound.pullPin);
    }

    public onDestroy(): void {
        this.explode();
    }

    public draw(): void {
        const mineDrawSize = new Vector(36, 20);
        const drawPos = this.getDrawPos(mineDrawSize);

        let frame = Mine.frames.default;
        if (this.steppedOn) {
            frame = (this.counter) % (Mine.blinkInterval * 2) < Mine.blinkInterval ? Mine.frames.steppedOn : Mine.frames.steppedOnBlink;
        } else if (this.activated) {
            frame = (this.counter) % (Mine.blinkInterval * 2) < Mine.blinkInterval ? Mine.frames.activated : Mine.frames.activatedBlink;
        }
        const z = this.getZIndex();
        Mine.baseSprite.draw(drawPos, mineDrawSize, this.body.isFlip(), this.getAngle(), z, frame);
        if (frame === Mine.frames.activatedBlink || frame === Mine.frames.steppedOnBlink) {
            const flashSize = 96;
            const flashPos = this.getDrawPos(flashSize);
            Mine.flashSprite.draw(flashPos, flashSize, false, 0, z - 1);
        }
    }

}
export { Mine };