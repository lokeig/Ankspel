import { Lerp, lerpTriangle, SpriteSheet, images, Vector, Utility } from "@common";
import { ItemLogic, FirearmInterface, ItemType } from "@game/Item";
import { ShotgunState } from "./shotgunState";
import { FirearmInfo } from "./firearmInfo";

class Shotgun implements FirearmInterface {
    public itemLogic: ItemLogic;
    private handleOffset: number = 0;
    private maxHandleOffset: number = -4;
    private handleLerp = new Lerp(6, lerpTriangle)

    private currentState: ShotgunState = ShotgunState.loaded;
    private spriteSheet = new SpriteSheet(images.shotgun, 32, 32);
    private firearmInfo: FirearmInfo;

    constructor(pos: Vector) {
        const width = 30;
        const height = 15;
        this.itemLogic = new ItemLogic(pos, width, height, ItemType.fireArm);
        this.itemLogic.holdOffset = { x: 14, y: -4 };
        this.itemLogic.handOffset = { x: 4, y: 0 };
        this.itemLogic.setHitboxOffset({ x: 30, y: 8 });
        this.firearmInfo = new FirearmInfo();

        this.firearmInfo = new FirearmInfo;
        this.firearmInfo.ammo = 2;
        this.firearmInfo.bulletCount = 10;
        this.firearmInfo.bulletAngleVariation = Math.PI / 12;
        this.firearmInfo.bulletLifespan = 0.11;
        this.firearmInfo.pipeOffset = { x: 28, y: -10 };
        this.firearmInfo.knockback = { x: 12, y: 4 };
    }

    public update(deltaTime: number): void {
        this.itemLogic.update(deltaTime);
        if (this.handleLerp.isActive()) {
            this.handleOffset = this.handleLerp.update(deltaTime);
        }
    }

    public shoot(): Vector {
        if (this.currentState === ShotgunState.loaded) {
            return this.fire();
        } else if (this.currentState === ShotgunState.reloadable) {
            return this.reload();
        } else {
            return { x: 0, y: 0 };
        }
    }

    private fire(): Vector {
        this.handleLerp.cancel();
        this.handleOffset = 0;
        this.currentState = ShotgunState.reloadable;
        return this.firearmInfo.shoot(this.itemLogic.dynamicObject.getCenter(), this.itemLogic.angle, this.itemLogic.isFlip());
    }

    private reload(): Vector {
        this.handleLerp.startLerp(0, this.maxHandleOffset);
        this.currentState = this.firearmInfo.ammo === 0 ? ShotgunState.empty : ShotgunState.loaded;
        return { x: 0, y: 0 };
    }

    public draw(): void {
        const drawSize = 64;
        const drawPos = this.itemLogic.getDrawpos(drawSize);
        this.spriteSheet.draw(0, 0, drawPos, drawSize, this.itemLogic.isFlip(), this.itemLogic.angle);

        const handleOffsetRotated = Utility.Angle.rotateForce({ x: this.handleOffset, y: 0 }, this.itemLogic.angle);
        const handleDrawPos = {
            x: drawPos.x + handleOffsetRotated.x * this.itemLogic.dynamicObject.getDirectionMultiplier(),
            y: drawPos.y + handleOffsetRotated.y
        }
        this.spriteSheet.draw(1, 0, handleDrawPos, drawSize, this.itemLogic.isFlip(), this.itemLogic.angle);
    }

    public shouldBeDeleted(): boolean {
        return this.itemLogic.deletable() && this.currentState === ShotgunState.empty;
    }

}

export { Shotgun };