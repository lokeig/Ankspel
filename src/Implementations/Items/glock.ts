import { SpriteAnimator, Animation, SpriteSheet, images, Vector, Utility } from "@common";
import { ItemLogic, IFirearm, ItemType } from "@game/Item";
import { FirearmInfo } from "./firearmInfo";


class Glock implements IFirearm {
    public common!: ItemLogic;
    private animations: Record<string, Animation> = {
        default: new Animation(),
        shoot: new Animation()
    };
    private animator: SpriteAnimator;
    private firearmInfo!: FirearmInfo;

    constructor(pos: Vector) {
        const spriteInfo = Utility.File.getImage(images.glock);
        Utility.File.setAnimations("glock", this.animations);
        this.animator = new SpriteAnimator(new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight), this.animations.default);
        this.setupCommon(pos);
        this.setupFirearmInfo();
    }

    private setupCommon(pos: Vector): void {
        const width = 30;
        const height = 15;
        this.common = new ItemLogic(pos, width, height, ItemType.fireArm);
        this.common.handOffset = new Vector(2, 2);
        this.common.holdOffset = new Vector(10, -4);
        this.common.setHitboxOffset(new Vector(14, 8));
    }

    private setupFirearmInfo(): void {
        this.firearmInfo = new FirearmInfo();
        this.firearmInfo.bulletSpeed = 5;
        this.firearmInfo.bulletLifespan = 15;
        this.firearmInfo.ammo = 9;
        this.firearmInfo.bulletAngleVariation = Math.PI / 36;
        this.firearmInfo.knockback = new Vector(9, 2);
        this.firearmInfo.pipeOffset = new Vector(14, -6);
    }

    public update(deltaTime: number): void {
        this.common.update(deltaTime);
        this.animator.update(deltaTime);
        if (this.animator.animationDone()) {
            this.animator.setAnimation(this.animations.default);
        }
    }

    public shoot(): Vector {
        this.animator.reset();
        this.animator.setAnimation(this.animations.shoot);
        return this.firearmInfo.shoot(this.common.body.getCenter(), this.common.angle, this.common.isFlip());
    }

    public draw(): void {
        const drawSize = 40;
        this.animator.draw(this.common.getDrawPos(drawSize), drawSize, this.common.isFlip(), this.common.angle);
    }

    public shouldBeDeleted(): boolean {
        return this.common.deletable() && this.firearmInfo.ammo === 0;
    }
}

export { Glock };