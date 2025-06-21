import { Render } from "../../../HMI/render";
import { images } from "../../../images";
import { SpriteSheet } from "../../Common/sprite";
import { Vector } from "../../Common/types";
import { ExplosiveInfo } from "./explosiveInfo";
import { ItemInterface, ItemLogic } from "./item";

export class Grenade implements ItemInterface {
    public itemLogic: ItemLogic;
    private spriteSheet = new SpriteSheet(images.grenade, 16, 16);
    private drawSize: number = 32;

    constructor(pos: Vector) {
        this.itemLogic = new ItemLogic(pos, 15, 19);
        const explosiveInfo = new ExplosiveInfo(5);
        explosiveInfo.radius = 5;
        this.itemLogic.setExplosiveInfo(explosiveInfo);
        this.itemLogic.holdOffset = { x: 12, y: -6 }
        this.itemLogic.setHitboxOffset({ x: 30, y: 30 });
    }

    update(deltaTime: number): void {
        this.itemLogic.update(deltaTime);
        this.itemLogic.getExplosiveInfo().update(deltaTime);
    }

    interact(): void {
        this.itemLogic.getExplosiveInfo().activate();
    }

    draw(): void {
        const col = this.itemLogic.getExplosiveInfo().isActivated() ? 1 : 0;
        this.spriteSheet.draw(0, col, this.itemLogic.getDrawpos(this.drawSize), this.drawSize, this.itemLogic.isFlip(), this.itemLogic.angle)
    }

    shouldBeDeleted(): boolean {
        return false;
    }
}