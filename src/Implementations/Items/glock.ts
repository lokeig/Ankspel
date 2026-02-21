import { Vector } from "@math";
import { SpriteAnimator, Animation, SpriteSheet, images, Utility, ItemInteraction } from "@common";
import { OnItemUseEffect } from "@game/Item";
import { FirearmHelper } from "./firearmInfo";
import { Item } from "./item";
import { SmallFlare } from "@impl/Particles";

class Glock extends Item {
    private static animations: Record<string, Animation> = {
        default: new Animation(),
        shoot: new Animation()
    };
    private animator: SpriteAnimator;
    private firearmInfo!: FirearmHelper;

    private static sprite: SpriteSheet;
    private flare: SmallFlare;

    static {
        Utility.File.setAnimations("glock", this.animations);
        const spriteInfo = Utility.File.getImage(images.glock);
        this.sprite = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
    }

    constructor(pos: Vector) {
        const width = 30;
        const height = 15;
        super(pos, width, height);

        this.handOffset = new Vector(2, 2);
        this.holdOffset = new Vector(10, -4);
        this.animator = new SpriteAnimator(Glock.sprite, Glock.animations.default);
        this.flare = new SmallFlare()

        this.setupFirearmInfo();

        this.useInteractions.set(ItemInteraction.Activate, ((seed: number, local: boolean) => {
            return this.shoot(seed, local);
        }));
    }

    private setupFirearmInfo(): void {
        this.firearmInfo = new FirearmHelper();
        this.firearmInfo.ammo = 11119;
        this.firearmInfo.bulletAngleVariation = Math.PI / 36;
        this.firearmInfo.knockback = new Vector(450, 120);
        this.firearmInfo.muzzleOffset = new Vector(23, -6);
        this.firearmInfo.bulletRange = 16;
        this.firearmInfo.bulletSpeed = 3400;
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
        this.flare.reset();

        return this.firearmInfo.shoot(this.body.getCenter(), this.getAngle(), this.body.isFlip(), seed, local);
    }

    public draw(): void {
        const drawSize = 40;
        this.animator.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle());
        if (this.flare.shouldBeShown()) {
            this.drawFlare();
        }
    }

    private drawFlare(): void {
        const pos = this.firearmInfo.getMuzzleOffset(this.body.getCenter(), this.getAngle(), this.body.isFlip());


        this.flare.draw(pos, this.body.isFlip(), this.getAngle());

    }

    public shouldBeDeleted(): boolean {
        return super.shouldBeDeleted() || (this.deleteHelper() && this.firearmInfo.ammo === 0);
    }
}

export { Glock };