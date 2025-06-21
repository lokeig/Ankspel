import { images } from "../../../images";
import { SpriteAnimator, SpriteSheet, Animation } from "../../Common/sprite";
import { Vector } from "../../Common/types";
import { FirearmInfo } from "./firearmInfo";
import { ItemInterface, ItemLogic } from "./item";

export class Glock implements ItemInterface {
    public itemLogic: ItemLogic;
    private drawSize: number = 40;
    private defaultAnimation: Animation = {
        frames: [{ row: 0, col: 0 }], fps: 8, repeat: false
    };
    private shootAnimation: Animation = {
        frames: [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 0 }], fps: 16, repeat: false
    };
    private animator: SpriteAnimator = new SpriteAnimator(new SpriteSheet(images.glock, 20, 20), this.defaultAnimation)

    constructor(pos: Vector) {
        this.itemLogic = new ItemLogic(pos, 30, 15);
        this.itemLogic.handOffset = { x: 2, y: 2 }
        this.itemLogic.holdOffset  = { x: 10, y: -4 }
        const firearmInfo = new FirearmInfo();
        firearmInfo.ammo = 9;
        firearmInfo.bulletAngleVariation = Math.PI / 36;
        firearmInfo.knockback = { x: 8, y: 2 };
        firearmInfo.pipeOffset = { x: 4, y: -6 };
        firearmInfo.bulletSpeed = 1800;
        this.itemLogic.setFirearmInfo(firearmInfo);
        this.itemLogic.setHitboxOffset({ x: 14, y: 8 });
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