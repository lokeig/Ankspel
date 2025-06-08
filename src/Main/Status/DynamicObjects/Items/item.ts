import { GameObject } from "../../Common/ObjectTypes/gameObject";
import { SpriteSheet } from "../../Common/sprite";
import { Vector } from "../../Common/types";
import { DynamicObject } from "../Common/dynamicObject";

export enum ThrowType {
    drop,
    upwards,
    light,
    hard,
    hardDiagonal
}

export class ItemEffects {
    private knockback: Vector = { x: 0, y: 0 };
    private disableMovement: boolean = false;
    private slowness: number = 0;

    public setKnockback(vector: Vector) {
        this.knockback = this.knockback;
    }

    public setDisableMovement(bool: boolean) {
        this.disableMovement = bool;
    }

    public setSlowness(amount: number) {
        this.slowness = amount;
    }

    public getKnockback(): Vector {
        return this.knockback;
    }

    public getDisableMovement(): boolean {
        return this.disableMovement;
    }

    public getSlowness(): number {
        return this.slowness;
    }
}


export abstract class Item {

    protected drawSize;
    protected spriteSheet: SpriteSheet;
    protected drawCol: number = 0;
    protected drawRow: number = 0;

    protected handOffset: Vector = { x: 0, y: 0 };
    protected holdOffset: Vector = { x: 0, y: 0 };
    protected pipeOffset: Vector = { x: 0, y: 0 };

    public collidable: boolean = false;
    public owned: boolean = false;

    public delete: boolean = false;
    public dynamicObject: DynamicObject;

    constructor(pos: Vector, width: number, height: number, spriteSheet: SpriteSheet, drawSize: number) {
        this.spriteSheet = spriteSheet;
        this.drawSize = drawSize;
        this.dynamicObject = new DynamicObject(pos, width, height);
    }

    abstract activate(): void;
    abstract interact(gameObject: GameObject): void;
    abstract itemUpdate(deltaTime: number): void;

    public update(deltaTime: number): void {
        this.dynamicObject.friction = this.dynamicObject.grounded ? 5 : 1;
        if (!this.owned) {
            this.updateItemPhysics(deltaTime)
        }
        this.itemUpdate(deltaTime);
    }

    updateItemPhysics(deltaTime: number) {

        this.dynamicObject.velocityPhysicsUpdate(deltaTime);

        // Handle Horizontal Collisions
        this.dynamicObject.pos.x += this.dynamicObject.velocity.x;
        const horizontalCollidingTile = this.dynamicObject.getHorizontalTileCollision();
        if (horizontalCollidingTile) {
            this.dynamicObject.handleSideCollision(horizontalCollidingTile);
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

    public throw(throwType: ThrowType) {
        this.dynamicObject.grounded = false;
        this.owned = false;
        const direcMult = this.dynamicObject.getDirectionMultiplier();

        switch (throwType) {
            case(ThrowType.light): {
                this.dynamicObject.velocity = { x: 3.5 * direcMult, y: -3.5 };
                break;
            }
            case(ThrowType.hard): {
                this.dynamicObject.velocity = { x: 15 * direcMult, y: -5 };
                break;
            }
            case(ThrowType.hardDiagonal): {
                this.dynamicObject.velocity = { x: 15 * direcMult, y: -10 };
                break;
            }
            case(ThrowType.drop): {
                this.dynamicObject.velocity = { x: 0 * direcMult, y: 0 };
                break;
            }
            case(ThrowType.upwards): {
                this.dynamicObject.velocity = { x: 0 * direcMult, y: -10 };
                break;
            }
        }
    }

    public getIncreasedHitbox(offset: number) {
        const pos = {
            x: this.dynamicObject.pos.x - (offset / 2),
            y: this.dynamicObject.pos.y - (offset / 2)
        };
        const width = this.dynamicObject.width + offset;
        const height = this.dynamicObject.height + offset;
        return new GameObject(pos, width, height);
    }

    public shouldBeDeleted(): boolean {
        return !this.owned && this.dynamicObject.grounded && (this.dynamicObject.velocity.x < 5) && this.delete;
    }

    public draw() {
        const xPos = this.dynamicObject.pos.x + ((this.dynamicObject.width - this.drawSize) / 2);
        const yPos = this.dynamicObject.pos.y + (this.dynamicObject.height - this.drawSize);
        const flip = this.dynamicObject.direction === "left";

        this.spriteSheet.draw(this.drawRow, this.drawCol, {x: xPos, y: yPos}, this.drawSize, flip);
    }
}