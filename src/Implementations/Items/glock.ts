import { SpriteAnimator, Animation, SpriteSheet, images, Vector, Utility, ItemInteraction } from "@common";
import { OnItemUseEffect } from "@game/Item";
import { FirearmHelper } from "./firearmInfo";
import { Item } from "./item";

class Glock extends Item {
    private animations: Record<string, Animation> = {
        default: new Animation(),
        shoot: new Animation()
    };
    private animator: SpriteAnimator;
    private firearmInfo!: FirearmHelper;

    constructor(pos: Vector) {
        const width = 30;
        const height = 15;
        super(pos, width, height);

        this.handOffset = new Vector(2, 2);
        this.holdOffset = new Vector(10, -4);

        const spriteInfo = Utility.File.getImage(images.glock);
        Utility.File.setAnimations("glock", this.animations);
        this.animator = new SpriteAnimator(new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight), this.animations.default);
        this.setupFirearmInfo();

        this.interactions.set(ItemInteraction.Activate, ((seed: number, local: boolean) => {
            return this.shoot(seed, local);
        }));
    }

    private setupFirearmInfo(): void {
        this.firearmInfo = new FirearmHelper();
        this.firearmInfo.ammo = 1119;
        this.firearmInfo.bulletAngleVariation = Math.PI / 36;
        this.firearmInfo.knockback = new Vector(450, 120);
        this.firearmInfo.pipeOffset = new Vector(20, -6);
        this.firearmInfo.bulletRange = 16;
        this.firearmInfo.bulletSpeed = 2400;
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        this.animator.update(deltaTime);
        if (this.animator.animationDone()) {
            this.animator.setAnimation(this.animations.default);
        }
    }

    public shoot(seed: number, local: boolean): OnItemUseEffect[] {
        this.animator.reset();
        this.animator.setAnimation(this.animations.shoot);
        return this.firearmInfo.shoot(this.body.getCenter(), this.getAngle(), this.body.isFlip(), seed, local);
    }

    public draw(): void {
        const drawSize = 40;
        this.animator.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle());
    }

    public shouldBeDeleted(): boolean {
        return super.shouldBeDeleted() || (this.deleteHelper() && this.firearmInfo.ammo === 0);
    }
}

export { Glock };