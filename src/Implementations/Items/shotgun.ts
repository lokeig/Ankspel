import { Lerp, lerpTriangle, SpriteSheet, images, Vector, Utility } from "@common";
import { ItemInterface, ItemLogic, FirearmInfo } from "@game/Item";

enum ShotgunState {
    loaded,
    reloadable,
    empty
}

class Shotgun implements ItemInterface {
    public itemLogic: ItemLogic;
    private handleOffset: number = 0;
    private maxHandleOffset: number = -4;
    private handleLerp = new Lerp(6, lerpTriangle)
    private currentState: ShotgunState = ShotgunState.loaded; 
    private drawSize: number = 64;
    private spriteSheet = new SpriteSheet(images.shotgun, 32, 32);
    private amountOfBulletsPerShot: number = 7;

    constructor(pos: Vector) {
        this.itemLogic = new ItemLogic(pos, 30, 15);
        const firearmInfo = new FirearmInfo;
        firearmInfo.ammo = 2 * this.amountOfBulletsPerShot;
        firearmInfo.bulletAngleVariation =Math.PI / 12;
        firearmInfo.bulletLifespan = 0.11;
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
    }

    private shoot(): void {
        this.handleLerp.cancel();
        this.handleOffset = 0;
        this.currentState = ShotgunState.reloadable;
        for (let i = 0; i < this.amountOfBulletsPerShot; i++) {
            this.itemLogic.getFirearmInfo().shoot(this.itemLogic.dynamicObject.getCenter(), this.itemLogic.angle, this.itemLogic.isFlip());
        }
    }
        
    private reload(): void {
        this.handleLerp.startLerp(0, this.maxHandleOffset);
        this.currentState = this.itemLogic.getFirearmInfo().empty() ? ShotgunState.empty : ShotgunState.loaded;
    }

    draw(): void {
        const drawPos = this.itemLogic.getDrawpos(this.drawSize);
        this.spriteSheet.draw(0, 0, drawPos, this.drawSize, this.itemLogic.isFlip(), this.itemLogic.angle);

        const handleOffsetRotated = Utility.Angle.rotateForce({ x: this.handleOffset, y: 0 }, this.itemLogic.angle);
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

export { Shotgun };