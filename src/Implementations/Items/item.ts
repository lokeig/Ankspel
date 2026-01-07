import { ItemInteraction, Lerp, lerpAngle, ThrowType, Utility, Vector } from "@common";
import { DynamicObject } from "@core";
import { IItem, useFunction } from "@item";

abstract class Item implements IItem {
    public interactions: Map<ItemInteraction, useFunction> = new Map();
    private owned: boolean = false;
    protected body: DynamicObject;

    protected localAngle: number = 0;
    private worldAngle: number = 0;
    private rotateSpeed: number = 0;
    private rotateLerp = new Lerp(15, lerpAngle);

    protected holdOffset = new Vector;
    protected handOffset = new Vector;

    private delete: boolean = false;

    constructor(pos: Vector, width: number, height: number) {
        this.body = new DynamicObject(pos, width, height);
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
        const angle = this.worldAngle + this.localAngle;
        const normalized = Utility.Angle.normalizeAngle(angle);
        if (this.body.grounded && normalized !== 0 && normalized !== -Math.PI) {
            this.rotateSpeed = 0;
            if (!this.rotateLerp.isActive()) {
                const target = Math.abs(normalized) > Math.PI / 2 ? Math.PI : 0;
                this.rotateLerp.startLerp(normalized, target);
            }
        }
        if (this.rotateLerp.isActive()) {
            this.worldAngle = this.rotateLerp.update(deltaTime);
        }

        this.worldAngle += this.rotateSpeed * deltaTime;
    }

    public getBody(): DynamicObject {
        return this.body;
    }

    public getAngle(): number {
        return this.worldAngle + this.localAngle;
    }

    public setWorldAngle(to: number): void {
        this.worldAngle = to;
    }

    public setLocalAngle(angle: number): void {
        this.localAngle = angle;
    }

    public getLocalAngle(): number {
        return this.localAngle;
    }

    public getHandOffset(): Vector {
        return this.handOffset;
    }

    public getHoldOffset(): Vector {
        return this.holdOffset;
    }

    public setOwnership(value: boolean): void {
        this.owned = value;
    }

    public isOwned(): boolean {
        return this.owned;
    }

    protected getDrawPos(drawSize: number): Vector {
        return new Vector(
            this.body.pos.x + ((this.body.width - drawSize) / 2),
            this.body.pos.y + ((this.body.height - drawSize) / 2)
        );
    }

    public throw(throwType: ThrowType): void {
        this.body.grounded = false;
        const direcMult = this.body.getDirectionMultiplier();

        switch (throwType) {
            case (ThrowType.Light): {
                this.body.velocity = new Vector(210 * direcMult, -210);
                this.rotateSpeed = 10;
                break;
            }
            case (ThrowType.Hard): {
                this.body.velocity = new Vector(900 * direcMult, -300);
                this.rotateSpeed = 15;
                break;
            }
            case (ThrowType.HardDiagonal): {
                this.body.velocity = new Vector(900 * direcMult, -600);
                this.rotateSpeed = 15;
                break;
            }
            case (ThrowType.Drop): {
                this.body.velocity = new Vector(0 * direcMult, 0);
                this.rotateSpeed = 5;
                break;
            }
            case (ThrowType.Upwards): {
                this.body.velocity = new Vector(0 * direcMult, -600);
                this.rotateSpeed = 8;
                break;
            }
        }
    }

    public shouldBeDeleted(): boolean {
        return this.delete;
    };

    protected deleteHelper(): boolean {
        return !this.owned && Math.abs(this.body.velocity.x) < 50 && this.body.grounded;
    }

    public setToDelete(): void {
        this.delete = true;
    };

    public abstract draw(): void;
}

export { Item };