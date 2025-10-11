import { Vector, Lerp, lerpAngle, Utility } from "@common";
import { DynamicObject, GameObject } from "@core";
import { FirearmInfo } from "./firearmInfo";
import { ItemType } from "./itemType";


class ItemLogic {
    public itemType!: ItemType;
    private firearmInfo!: FirearmInfo;

    public dynamicObject: DynamicObject;

    public handOffset: Vector = { x: 0, y: 0 };
    public holdOffset: Vector = { x: 0, y: 0 };
    private hitboxOffset: Vector = { x: 0, y: 0 };
    public collidable: boolean = false;
    public owned: boolean = false;

    public angle: number = 0;
    public personalAngle: number = 0;
    public rotateSpeed: number = 0;
    private rotateLerp = new Lerp(15, lerpAngle);

    constructor(pos: Vector, width: number, height: number) {
        this.dynamicObject = new DynamicObject(pos, width, height);
    }

    public setFirearmInfo(firearmInfo: FirearmInfo) {
        this.itemType = ItemType.fireArm;
        this.firearmInfo = firearmInfo;
    }

    public getFirearmInfo(): FirearmInfo {
        return this.firearmInfo;
    }

    public setHitboxOffset(offset: Vector) {
        this.hitboxOffset = offset;
    }

    public getType(): ItemType {
        return this.itemType;
    }
    
    private updateAngle(deltaTime: number): void {
        const normalized = Utility.Angle.normalizeAngle(this.angle);
        if (this.dynamicObject.grounded && normalized !== 0 && normalized !== -Math.PI) {
            this.rotateSpeed = 0;
            if (!this.rotateLerp.isActive()) {
                const target = Math.abs(normalized) > Math.PI / 2 ? Math.PI : 0;

                this.rotateLerp.startLerp(normalized, target);
            }
        }
        if (this.rotateLerp.isActive()) {
            this.angle = this.rotateLerp.update(deltaTime);
        }

        this.angle += this.rotateSpeed * deltaTime;
    }    

    public update(deltaTime: number): void {
        if (!this.owned) {
            this.updateItemPhysics(deltaTime);
        } else {
            this.dynamicObject.setNewCollidableObjects();
        }
    }

    public updateItemPhysics(deltaTime: number) {
        this.dynamicObject.friction = this.dynamicObject.grounded ? 5 : 1;

        this.updateAngle(deltaTime);
        this.dynamicObject.update(deltaTime);
        if (this.dynamicObject.collisions.side) {
            this.rotateSpeed *= 0.5;
        }
        
    }

    public getPickupHitbox(): GameObject {
        return this.dynamicObject.getScaled(this.hitboxOffset.x, this.hitboxOffset.y);
    }

    public getDrawpos(drawSize: number): Vector {
        return {
            x: this.dynamicObject.pos.x + ((this.dynamicObject.width - drawSize) / 2),
            y: this.dynamicObject.pos.y + ((this.dynamicObject.height - drawSize) / 2)
        };
    }

    public isFlip(): boolean {
        return this.dynamicObject.direction === "left";
    }

    public deletable(): boolean {
        return !this.owned && this.dynamicObject.grounded && Math.abs(this.dynamicObject.velocity.x) < 0.3;; 
    }
}

export { ItemLogic };