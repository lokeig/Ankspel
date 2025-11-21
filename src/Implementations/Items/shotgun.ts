import { Lerp, lerpTriangle, SpriteSheet, images, Vector, Utility } from "@common";
import { ItemLogic, IFirearm, ItemType } from "@game/Item";
import { ShotgunState } from "./shotgunState";
import { FirearmInfo } from "./firearmInfo";

class Shotgun implements IFirearm {
    public common!: ItemLogic;
    private handleOffset: number = 0;
    private maxHandleOffset: number = -4;
    private handleLerp = new Lerp(6, lerpTriangle)

    private currentState: ShotgunState = ShotgunState.loaded;
    private spriteSheet: SpriteSheet;
    private firearmInfo!: FirearmInfo;

    constructor(pos: Vector) {
        const spriteInfo = Utility.File.getImage(images.shotgun);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
        this.setCommonInfo(pos);
        this.setupFirearmInfo();
    }
    
    private setCommonInfo(pos: Vector): void {
        const width = 30;
        const height = 15;
        this.common = new ItemLogic(pos, width, height, ItemType.fireArm);
        this.common.holdOffset = { x: 14, y: -4 };
        this.common.handOffset = { x: 4, y: 0 };
        this.common.setHitboxOffset({ x: 30, y: 8 });
    }
    
    private setupFirearmInfo(): void {
        this.firearmInfo = new FirearmInfo();
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
        this.common.update(deltaTime);
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
        return this.firearmInfo.shoot(this.common.body.getCenter(), this.common.angle, this.common.isFlip());
    }

    private reload(): Vector {
        this.handleLerp.startLerp(0, this.maxHandleOffset);
        this.currentState = this.firearmInfo.ammo === 0 ? ShotgunState.empty : ShotgunState.loaded;
        return { x: 0, y: 0 };
    }

    public draw(): void {
        const drawSize = 64;
        const drawPos = this.common.getDrawpos(drawSize);
        this.spriteSheet.draw(0, 0, drawPos, drawSize, this.common.isFlip(), this.common.angle);

        const handleOffsetRotated = Utility.Angle.rotateForce({ x: this.handleOffset, y: 0 }, this.common.angle);
        const handleDrawPos = {
            x: drawPos.x + handleOffsetRotated.x * this.common.body.getDirectionMultiplier(),
            y: drawPos.y + handleOffsetRotated.y
        }
        this.spriteSheet.draw(1, 0, handleDrawPos, drawSize, this.common.isFlip(), this.common.angle);
    }

    public shouldBeDeleted(): boolean {
        return this.common.deletable() && this.currentState === ShotgunState.empty;
    }

}

export { Shotgun };