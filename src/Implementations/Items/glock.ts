import { Vector } from "@math";
import { SpriteAnimator, Animation, SpriteSheet, ItemInteraction } from "@common";
import { OnItemUseEffect } from "@game/Item";
import { FirearmHelper } from "./firearmHelper";
import { Item } from "./item";
import { SmallFlare } from "@impl/Particles";
import { Images } from "@render";
import { AudioManager } from "@game/Audio/audioManager";
import { Sound } from "@game/Audio";
import { addSmokeCloud } from "@game/Particles";

class Glock extends Item {
    private static animations: Record<string, Animation> = { default: new Animation(), shoot: new Animation() };
    private static sprite: SpriteSheet;
    private flare: SmallFlare;
    private static handOffset = new Vector(2, 2);
    private static holdOffset = new Vector(10, -4);

    private animator: SpriteAnimator;
    private firearmInfo!: FirearmHelper;

    static {
        this.sprite = new SpriteSheet(Images.glock);
        this.animations.default.addFrame(0, 0);
        this.animations.shoot.addSegment(0, 3, 4);
        this.animations.shoot.fps = 24;
    }

    constructor(pos: Vector, id: number) {
        const width = 30;
        const height = 15;
        super(pos, width, height, id);

        this.info.holdOffset = Glock.holdOffset;
        this.info.handOffset = Glock.handOffset;

        this.animator = new SpriteAnimator(Glock.sprite, Glock.animations.default);
        this.flare = new SmallFlare()

        this.setupFirearmInfo();

        this.playerInteractions.setUse(ItemInteraction.Activate, ((seed: number, local: boolean) => {
            return this.shoot(seed, local);
        }));
    }

    private setupFirearmInfo(): void {
        this.firearmInfo = new FirearmHelper();
        this.firearmInfo.ammo = 9;
        this.firearmInfo.bulletAngleVariation = Math.PI / 36;
        this.firearmInfo.knockback = new Vector(650, 120);
        this.firearmInfo.muzzleOffset = new Vector(23, -6);
        this.firearmInfo.bulletRange = 16;
        this.firearmInfo.bulletSpeed = 4000;
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        this.animator.update(deltaTime);
        if (this.animator.animationDone()) {
            this.animator.setAnimation(Glock.animations.default);
        }
        this.flare.update(deltaTime);
    }

    public shoot(seed: number, local: boolean): OnItemUseEffect[] {
        this.animator.reset();
        this.animator.setAnimation(Glock.animations.shoot);
        if (this.firearmInfo.ammo > 0) {
            AudioManager.get().play(Sound.glock);
            this.flare.reset();
        } else {
            const minScale = 0.3;
            const maxScale = 0.7;
            const variance = 10;
            addSmokeCloud(this.firearmInfo.getMuzzleOffset(this.body.getCenter(), this.getAngle(), this.body.isFlip()), minScale, maxScale, variance, 4);
            AudioManager.get().play(Sound.click);
        }
        return this.firearmInfo.shoot(this.body.getCenter(), this.getAngle(), this.body.isFlip(), seed, local);
    }

    public draw(): void {
        const drawSize = 40;
        this.animator.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), this.getZIndex());
        if (this.flare.shouldBeShown()) {
            this.drawFlare();
        }
    }

    private drawFlare(): void {
        const pos = this.firearmInfo.getMuzzleOffset(this.body.getCenter(), this.getAngle(), this.body.isFlip());
        this.flare.draw(pos, this.body.isFlip(), this.getAngle());
    }

    public getHandOffset(): Vector {
        return Glock.handOffset;
    }

    public getHoldOffset(): Vector {
        return Glock.holdOffset;
    }

    public shouldBeDeleted(): boolean {
        return super.shouldBeDeleted() || (this.deleteHelper() && this.firearmInfo.ammo === 0);
    }
}

export { Glock };