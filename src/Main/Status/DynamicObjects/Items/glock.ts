import { images } from "../../../images";
import { Animation } from "../../Common/animation";
import { SpriteSheet } from "../../Common/sprite";
import { SpriteAnimator } from "../../Common/spriteAnimator";
import { Vector } from "../../Common/types";
import { FirearmInfo } from "./firearmInfo";
import { ItemInterface, ItemLogic } from "./itemLogic";

export class Glock implements ItemInterface {
    public itemLogic: ItemLogic;
    private drawSize: number = 40;

    private defaultAnimation = new Animation();
    private shootAnimation = new Animation();
    private animator: SpriteAnimator = new SpriteAnimator(new SpriteSheet(images.glock, 20, 20), this.defaultAnimation)

    constructor(pos: Vector) {
        this.itemLogic = new ItemLogic(pos, 30, 15);
        this.itemLogic.handOffset = { x: 2, y: 2 }
        this.itemLogic.holdOffset  = { x: 10, y: -4 }
        this.itemLogic.setHitboxOffset({ x: 14, y: 8 });

        const firearmInfo = new FirearmInfo();
        firearmInfo.ammo = 9;
        firearmInfo.bulletAngleVariation = Math.PI / 36;
        firearmInfo.knockback = { x: 8, y: 2 };
        firearmInfo.pipeOffset = { x: 4, y: -6 };
        this.itemLogic.setFirearmInfo(firearmInfo);

        this.defaultAnimation.addFrame({ row: 0, col: 0 });
        this.shootAnimation.addRow(0, 3);
        this.shootAnimation.addFrame({ row: 0, col: 0 });
        this.shootAnimation.fps = 24;
    }

    update(deltaTime: number): void {
        this.itemLogic.update(deltaTime);
        this.animator.update(deltaTime);
        //console.log(this.itemLogic.dynamicObject.collidableObjects)
    }

    interact(): void {
        this.itemLogic.getFirearmInfo().shoot(this.itemLogic.dynamicObject.getCenter(), this.itemLogic.angle, this.itemLogic.isFlip());
        this.animator.reset();
        this.animator.setAnimation(this.shootAnimation);
    }

    draw(): void {
        this.animator.draw(this.itemLogic.getDrawpos(this.drawSize), this.drawSize, this.itemLogic.isFlip(), this.itemLogic.angle);
    }
    
    shouldBeDeleted(): boolean {
        return this.itemLogic.deletable() && this.itemLogic.getFirearmInfo().empty();
    }
}