import { images } from "../../Game/Common/images";
import { Animation } from "../../Game/Common/Sprite/Animation/animation";
import { SpriteSheet } from "../../Game/Common/Sprite/sprite";
import { SpriteAnimator } from "../../Game/Common/Sprite/spriteAnimator";
import { Vector } from "../../Game/Common/Types/vector";
import { FirearmInfo } from "../../Game/Objects/DynamicObjects/Items/Common/firearmInfo";
import { ItemLogic } from "../../Game/Objects/DynamicObjects/Items/Common/itemLogic";
import { ItemInterface } from "../../Game/Objects/DynamicObjects/Items/Common/itemInterface";

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
        firearmInfo.knockback = { x: 9, y: 2 };
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