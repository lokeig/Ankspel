import { OnItemCollision, OnItemCollisionType, ThrowType } from "@common";
import { Item } from "../item";
import { DynamicObject } from "@core";
import { Vector } from "@math";
import { CollisionManager } from "@game/Collision/collisionManager";

abstract class BaseProp extends Item {
    private collision = { body: this.body, platform: true };

    constructor(pos: Vector, width: number, height: number, id: number) {
        super(pos, width, height, id);
        CollisionManager.addCollidable(this.collision);
    }

    public setAngle(_to: number): void {
        return;
    }

    public onCollision(deltaTime: number, body: DynamicObject): OnItemCollision[] {
        const offset = 5;
        const minVerticalSpeed = 250;
        const prevPos = this.body.pos.y + this.body.height - this.body.velocity.y * deltaTime;
        if (this.body.velocity.y > minVerticalSpeed && prevPos - offset < body.pos.y) {
            return [{ type: OnItemCollisionType.Headbonk }];
        }
        if (Math.abs(this.body.velocity.x) > Item.MinItemDropSpeed) {
            return [{ type: OnItemCollisionType.Knockback, amount: this.getCollisionKnockback() }];
        }
        return [];
    }

    public handleCollision(collision: OnItemCollision): void {
        switch (collision.type) {
            case OnItemCollisionType.Knockback: {
                this.body.velocity.x *= -this.body.bounceFactor;
                break;
            }
            case OnItemCollisionType.Headbonk: {
                this.body.velocity.y *= -0.5;
                break;
            }
        }
    }

    public setToDelete(): void {
        super.setToDelete();
        CollisionManager.removeCollidable(this.collision);
    }

    public throw(throwType: ThrowType): void {
        this.body.grounded = false;
        const direcMult = this.body.getDirectionMultiplier();

        const factor = this.info.weightFactor;

        switch (throwType) {
            case (ThrowType.Light): {
                this.body.velocity.set(210 * direcMult * factor, -210 * factor);
                break;
            }
            case (ThrowType.Hard): {
                this.body.velocity.set(900 * direcMult * factor, -300 * factor);
                break;
            }
            case (ThrowType.HardDiagonal): {
                this.body.velocity.set(900 * direcMult * factor, -600 * factor);
                break;
            }
            case (ThrowType.Drop): {
                this.body.velocity.set(0 * direcMult * factor, 0 * factor);
                break;
            }
            case (ThrowType.Upwards): {
                this.body.velocity.set(0 * direcMult * factor, -600 * factor);
                break;
            }
        }
    }

}

export { BaseProp };