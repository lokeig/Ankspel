import { Vector, Lerp, lerpAngle, Utility, ThrowType } from "@common";
import { DynamicObject, GameObject } from "@core";
import { ItemType } from "./itemType";

class ItemLogic {
    public body: DynamicObject;
    public owned: boolean = false;

    public handOffset = new Vector();
    public holdOffset = new Vector();
    private hitboxOffset = new Vector();

    public angle: number = 0;
    public rotateSpeed: number = 0;
    private rotateLerp = new Lerp(15, lerpAngle);
    private itemType: ItemType;

    constructor(pos: Vector, width: number, height: number, itemType: ItemType) {
        this.body = new DynamicObject(pos, width, height);
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
            this.body.setNewCollidableObjects();
        }
    }

    private updateItemPhysics(deltaTime: number) {
        this.body.friction = this.body.grounded ? 5 : 1;

        this.updateAngle(deltaTime);
        this.body.update(deltaTime);
        if (this.body.collisions.side) {
            this.rotateSpeed *= 0.5;
        }

    }

    private updateAngle(deltaTime: number): void {
        const normalized = Utility.Angle.normalizeAngle(this.angle);
        if (this.body.grounded && normalized !== 0 && normalized !== -Math.PI) {
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

    public throw(throwType: ThrowType): void {
        this.body.grounded = false;
        const direcMult = this.body.getDirectionMultiplier();

        switch (throwType) {
            case (ThrowType.light): {
                this.body.velocity = new Vector(210 * direcMult, -210);
                this.rotateSpeed = 10;
                break;
            }
            case (ThrowType.hard): {
                this.body.velocity = new Vector(900 * direcMult, -300);
                this.rotateSpeed = 15;
                break;
            }
            case (ThrowType.hardDiagonal): {
                this.body.velocity = new Vector(900 * direcMult, -600);
                this.rotateSpeed = 15;
                break;
            }
            case (ThrowType.drop): {
                this.body.velocity = new Vector(0 * direcMult, 0);
                this.rotateSpeed = 5;
                break;
            }
            case (ThrowType.upwards): {
                this.body.velocity = new Vector(0 * direcMult, -600);
                this.rotateSpeed = 8;
                break;
            }
        }
    }

    public getPickupHitbox(): GameObject {
        return this.body.scale(this.hitboxOffset.x, this.hitboxOffset.y);
    }

    public getDrawPos(drawSize: number): Vector {
        return new Vector(
            this.body.pos.x + ((this.body.width - drawSize) / 2),
            this.body.pos.y + ((this.body.height - drawSize) / 2)
        );
    }

    public isFlip(): boolean {
        return this.body.isFlip();
    }

    public deletable(): boolean {
        return !this.owned && this.body.grounded && Math.abs(this.body.velocity.x) < 0.3;
    }
}

export { ItemLogic };