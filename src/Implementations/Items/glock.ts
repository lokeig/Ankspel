import { SpriteAnimator, Animation, SpriteSheet, images, Vector, Utility } from "@common";
import { ItemLogic, IFirearm, ItemType } from "@game/Item";
import { FirearmInfo } from "./firearmInfo";


class Glock implements IFirearm {
    public common!: ItemLogic;
    private defaultAnimation = new Animation();
    private shootAnimation = new Animation();
    private animator: SpriteAnimator;
    private firearmInfo!: FirearmInfo;

    constructor(pos: Vector) {
        const spriteInfo = Utility.File.getImage(images.glock);
        this.animator = new SpriteAnimator(new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight), this.defaultAnimation);
        this.setupCommon(pos);
        this.setupFirearmInfo();
        this.setupAnimations();
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

    private setupAnimations(): void {
        this.defaultAnimation.addFrame({ row: 0, col: 0 });
        this.shootAnimation.addFrame({ row: 0, col: 1 });
        this.shootAnimation.addFrame({ row: 0, col: 2 });
        this.shootAnimation.addFrame({ row: 0, col: 3 });
        this.shootAnimation.fps = 24;
    }

    public update(deltaTime: number): void {
        this.common.update(deltaTime);
        this.animator.update(deltaTime);
        if (this.animator.animationDone()) {
            this.animator.setAnimation(this.defaultAnimation);
        }
    }

    public shoot(): Vector {
        this.animator.reset();
        this.animator.setAnimation(this.shootAnimation);
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