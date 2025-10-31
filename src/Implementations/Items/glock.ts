import { SpriteAnimator, Animation, SpriteSheet, images, Vector } from "@common";
import { ItemLogic, FirearmInterface, ItemType } from "@game/Item";
import { FirearmInfo } from "./firearmInfo";


class Glock implements FirearmInterface {
    public common: ItemLogic;
    private drawSize: number = 40;

    private defaultAnimation = new Animation();
    private shootAnimation = new Animation();
    private animator: SpriteAnimator = new SpriteAnimator(new SpriteSheet(images.glock, 20, 20), this.defaultAnimation)
    private firearmInfo: FirearmInfo

    constructor(pos: Vector) {
        const width = 30;
        const height = 15;
        this.common = new ItemLogic(pos, width, height, ItemType.fireArm);
        this.common.handOffset = { x: 2, y: 2 }
        this.common.holdOffset = { x: 10, y: -4 }
        this.common.setHitboxOffset({ x: 14, y: 8 });

        this.firearmInfo = new FirearmInfo();
        this.firearmInfo.bulletSpeed = 5;
        this.firearmInfo.bulletLifespan = 15;
        this.firearmInfo.ammo = 9;
        this.firearmInfo.bulletAngleVariation = Math.PI / 36;
        this.firearmInfo.knockback = { x: 9, y: 2 };
        this.firearmInfo.pipeOffset = { x: 14, y: -6 };

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
        this.animator.draw(this.common.getDrawpos(this.drawSize), this.drawSize, this.common.isFlip(), this.common.angle);
    }

    public shouldBeDeleted(): boolean {
        return this.common.deletable() && this.firearmInfo.ammo === 0;
    }
}

export { Glock };