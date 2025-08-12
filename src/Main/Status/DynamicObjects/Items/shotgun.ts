import { images } from "../../../images";
import { rotateForce } from "../../Common/angleHelper";
import { LerpValue, triangleLerp } from "../../Common/lerp";
import { SpriteSheet } from "../../Common/sprite";
import { Vector } from "../../Common/types";
import { ItemLogic, ItemInterface } from "./itemLogic";
import { FirearmInfo } from "./firearmInfo";

enum ShotgunState {
    loaded,
    reloadable,
    empty
}

export class Shotgun implements ItemInterface {
    public itemLogic: ItemLogic;
    private handleOffset: number = 0;
    private maxHandleOffset: number = -4;
    private handleLerp = new LerpValue(6, triangleLerp)
    private currentState: ShotgunState = ShotgunState.loaded; 
    private drawSize: number = 64;
    private spriteSheet = new SpriteSheet(images.shotgun, 32, 32);

    constructor(pos: Vector) {
        this.itemLogic = new ItemLogic(pos, 30, 15);
        const firearmInfo = new FirearmInfo;
        firearmInfo.ammo = 2;
        firearmInfo.bulletAngleVariation =Math.PI / 6;
        firearmInfo.bulletFireAmount =7;
        firearmInfo.bulletLifespan = 0.15;
        firearmInfo.pipeOffset ={ x: 28, y: -10 };
        this.itemLogic.setFirearmInfo(firearmInfo);
        this.itemLogic.holdOffset = { x: 14, y: -4 };
        this.itemLogic.handOffset = { x: 4,  y:  0 };
        this.itemLogic.setHitboxOffset({ x: 30, y: 8 });
    }

    public update(deltaTime: number): void {
        this.itemLogic.update(deltaTime);
        if (this.handleLerp.isActive()) {
            this.handleOffset = this.handleLerp.update(deltaTime);
        }
    }
    
    public interact(): void {
        this.itemLogic.getFirearmInfo().knockback = { x: 0, y: 0 };
        if (this.currentState === ShotgunState.loaded) {
            this.shoot();
            this.itemLogic.getFirearmInfo().knockback = { x: 12, y: 4 };
        } else if (this.currentState === ShotgunState.reloadable) {
            this.reload();
        }
        console.log(this.itemLogic.getFirearmInfo().knockback.x);
    }

    private shoot(): void {
        this.handleLerp.cancel();
        this.handleOffset = 0;
        this.currentState = ShotgunState.reloadable;
        this.itemLogic.getFirearmInfo().shoot(this.itemLogic.dynamicObject.getCenter(), this.itemLogic.angle, this.itemLogic.isFlip());
    }
        
    private reload(): void {
        this.handleLerp.startLerp(0, this.maxHandleOffset);
        this.currentState = this.itemLogic.getFirearmInfo().empty() ? ShotgunState.empty : ShotgunState.loaded;
    }

    draw(): void {
        const drawPos = this.itemLogic.getDrawpos(this.drawSize);
        this.spriteSheet.draw(0, 0, drawPos, this.drawSize, this.itemLogic.isFlip(), this.itemLogic.angle);

        // Handle
        const handleOffsetRotated = rotateForce({ x: this.handleOffset, y: 0 }, this.itemLogic.angle);
        const handleDrawPos = {
            x: drawPos.x + handleOffsetRotated.x * this.itemLogic.dynamicObject.getDirectionMultiplier(), 
            y: drawPos.y + handleOffsetRotated.y 
        }
        this.spriteSheet.draw(1, 0, handleDrawPos, this.drawSize, this.itemLogic.isFlip(), this.itemLogic.angle);
    }

    shouldBeDeleted(): boolean {
        return this.itemLogic.deletable() && this.itemLogic.getFirearmInfo().empty();
    }

}