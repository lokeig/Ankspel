import { Vector } from "@math";
import { Lerp, lerpAngle, ProjectileEffect, ThrowType, Utility } from "@common";
import { DynamicObject } from "@core";
import { ItemUseInteractions } from "@game/Item/itemUseInteractions";
import { IItem, Ownership } from "@item";
import { AudioManager, Sound } from "@game/Audio";

abstract class Item implements IItem {
    protected useInteractions = new ItemUseInteractions;
    private ownership: Ownership = Ownership.None;
    protected body: DynamicObject;

    protected localAngle: number = 0;
    private worldAngle: number = 0;
    private rotateSpeed: number = 0;
    private rotateLerp = new Lerp(15, lerpAngle);

    protected id: number;

    protected holdOffset = new Vector;
    protected handOffset = new Vector;

    private delete: boolean = false;

    constructor(pos: Vector, width: number, height: number, id: number) {
        this.body = new DynamicObject(pos, width, height);
        this.id = id;
    }

    public update(deltaTime: number): void {
        const prevGrounded = this.body.grounded;
        const prevVelocity = Math.abs(this.body.velocity.y);
        
        if (this.ownership === Ownership.None) {
            this.updateItemPhysics(deltaTime);
        } else {
            this.body.setNewCollidableObjects();
        }
        this.itemUpdate(deltaTime);
        
        const audioLandThreshold = 100;
        if (this.body.grounded && !prevGrounded && prevVelocity > audioLandThreshold) {
            AudioManager.get().play(Sound.land);
        }
    }

    protected itemUpdate(deltaTime: number): void {

    }

    public onProjectileEffect(_effect: ProjectileEffect, _pos: Vector, _local: boolean): void {
        return;
    }

    private updateItemPhysics(deltaTime: number) {
        this.body.friction = this.body.grounded ? 5 : 1;

        this.updateAngle(deltaTime);
        this.body.update(deltaTime);
        if (this.body.collidingSide) {
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

    public interactions(): ItemUseInteractions {
        return this.useInteractions;
    }

    public getBody(): DynamicObject {
        return this.body;
    }

    public getAngle(): number {
        return this.worldAngle + this.localAngle;
    }

    public setAngle(to: number): void {
        this.worldAngle = to;
    }

    public getHandOffset(): Vector {
        return this.handOffset;
    }

    public getHoldOffset(): Vector {
        return this.holdOffset;
    }

    public setOwnership(value: Ownership): void {
        this.ownership = value;
    }

    public getOwnership(): Ownership {
        return this.ownership;
    }

    protected getDrawPos(drawSize: number): Vector {
        return new Vector(
            this.body.pos.x + ((this.body.width - drawSize) / 2),
            this.body.pos.y + ((this.body.height - drawSize) / 2)
        );
    }

    public enabled(): boolean {
        return true;
    }

    public throw(throwType: ThrowType): void {
        this.body.grounded = false;
        const direcMult = this.body.getDirectionMultiplier();

        switch (throwType) {
            case (ThrowType.Light): {
                this.body.velocity.set(210 * direcMult, -210);
                this.rotateSpeed = 10;
                break;
            }
            case (ThrowType.Hard): {
                this.body.velocity.set(900 * direcMult, -300);
                this.rotateSpeed = 15;
                break;
            }
            case (ThrowType.HardDiagonal): {
                this.body.velocity.set(900 * direcMult, -600);
                this.rotateSpeed = 15;
                break;
            }
            case (ThrowType.Drop): {
                this.body.velocity.set(0 * direcMult, 0);
                this.rotateSpeed = 5;
                break;
            }
            case (ThrowType.Upwards): {
                this.body.velocity.set(0 * direcMult, -600);
                this.rotateSpeed = 8;
                break;
            }
        }
    }

    public shouldBeDeleted(): boolean {
        return this.delete;
    };

    protected deleteHelper(): boolean {
        return this.ownership === Ownership.None && Math.abs(this.body.velocity.x) < 50 && this.body.grounded;
    }

    public setToDelete(): void {
        this.delete = true;
    };

    public abstract draw(): void;
}

export { Item };