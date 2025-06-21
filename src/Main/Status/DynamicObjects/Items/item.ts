import { normalizeAngle } from "../../Common/angleHelper";
import { lerpAngle, LerpValue } from "../../Common/lerp";
import { GameObject } from "../../Common/ObjectTypes/gameObject";
import { Vector } from "../../Common/types";
import { DynamicObject } from "../Common/dynamicObject";
import { ExplosiveInfo } from "./explosiveInfo";
import { FirearmInfo } from "./firearmInfo";

export enum ThrowType {
    drop,
    upwards,
    light,
    hard,
    hardDiagonal
}

export enum ItemType {
    fireArm,
    mine,
    explosive,
    prop
}

export interface ItemInterface {
    update(deltaTime: number): void,
    draw(): void,
    shouldBeDeleted(): boolean,
    interact(): void,
    itemLogic: ItemLogic;
}


export class ItemLogic {
    public itemType!: ItemType;
    private firearmInfo!: FirearmInfo;
    private explosiveInfo!: ExplosiveInfo;

    public dynamicObject: DynamicObject;

    public handOffset: Vector = { x: 0, y: 0 };
    public holdOffset: Vector = { x: 0, y: 0 };
    private hitboxOffset: Vector = { x: 0, y: 0 };
    public collidable: boolean = false;
    public owned: boolean = false;

    public angle: number = 0;
    public personalAngle: number = 0;
    public rotateSpeed: number = 0;
    private rotateLerp = new LerpValue(15, lerpAngle);

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

    public setExplosiveInfo(explosiveInfo: ExplosiveInfo) {
        this.itemType = ItemType.explosive;
        this.explosiveInfo = explosiveInfo;
    }

    public getExplosiveInfo(): ExplosiveInfo {
        return this.explosiveInfo;
    }

    public setHitboxOffset(offset: Vector) {
        this.hitboxOffset = offset;
    }

    public getType(): ItemType {
        return this.itemType;
    }
    
    private updateAngle(deltaTime: number): void {
        const normalized = normalizeAngle(this.angle);
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
        }
    }

    public updateItemPhysics(deltaTime: number) {
        this.dynamicObject.friction = this.dynamicObject.grounded ? 5 : 1;

        this.updateAngle(deltaTime);
        this.dynamicObject.velocityPhysicsUpdate(deltaTime);

        // Handle Horizontal Collisions
        this.dynamicObject.pos.x += this.dynamicObject.velocity.x;
        const horizontalCollidingTile = this.dynamicObject.getHorizontalTileCollision();
        if (horizontalCollidingTile) {
            this.dynamicObject.handleSideCollision(horizontalCollidingTile);
            this.rotateSpeed *= 0.5;
        }

        // Handle Vertical Collisions
        this.dynamicObject.pos.y += this.dynamicObject.velocity.y;
        const verticalCollidingTile = this.dynamicObject.getVerticalTileCollision();
        if (verticalCollidingTile) {
            if (this.dynamicObject.velocity.y > 0) {
                this.dynamicObject.handleBotCollision(verticalCollidingTile);
            } else {
                this.dynamicObject.handleTopCollision(verticalCollidingTile);
            }
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