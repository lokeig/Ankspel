import { Vector, Lerp, lerpAngle, Utility } from "@common";
import { DynamicObject, GameObject } from "@core";
import { ItemType } from "./itemType";

class ItemLogic {
    public dynamicObject: DynamicObject;

    public handOffset: Vector = { x: 0, y: 0 };
    public holdOffset: Vector = { x: 0, y: 0 };
    public owned: boolean = false;
    private hitboxOffset: Vector = { x: 0, y: 0 };

    public angle: number = 0;
    public rotateSpeed: number = 0;
    private rotateLerp = new Lerp(15, lerpAngle);
    private itemType: ItemType;

    constructor(pos: Vector, width: number, height: number, itemType: ItemType) {
        this.dynamicObject = new DynamicObject(pos, width, height);
        this.itemType = itemType;
    }

    public getType(): ItemType {
        return this.itemType;
    }

    public setHitboxOffset(offset: Vector) {
        this.hitboxOffset = offset;
    }

    public update(deltaTime: number): void {
        if (!this.owned) {
            this.updateItemPhysics(deltaTime);
        } else {
            this.dynamicObject.setNewCollidableObjects();
        }
    }

    private updateItemPhysics(deltaTime: number) {
        this.dynamicObject.friction = this.dynamicObject.grounded ? 5 : 1;

        this.updateAngle(deltaTime);
        this.dynamicObject.update(deltaTime);
        if (this.dynamicObject.collisions.side) {
            this.rotateSpeed *= 0.5;
        }

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
        return this.dynamicObject.isFlip();
    }

    public deletable(): boolean {
        return !this.owned && this.dynamicObject.grounded && Math.abs(this.dynamicObject.velocity.x) < 0.3;;
    }
}

export { ItemLogic };